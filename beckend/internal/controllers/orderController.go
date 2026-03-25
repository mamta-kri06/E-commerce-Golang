package controllers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/smtp"
	"os"

	"github.com/jung-kurt/gofpdf"

	"github.com/gin-gonic/gin"
	"github.com/razorpay/razorpay-go"
	"gorm.io/gorm"

	"beckend/internal/middlewares"
	"beckend/internal/models"
)

type OrderController struct {
	DB *gorm.DB
}

func (oc *OrderController) Get(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var orders []models.Order
	if err := oc.DB.Preload("User").Preload("Items.Product").Preload("Address").Where("user_id = ?", user.ID).Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func SendEmail(to string, name string, orderID uint) error {
	from := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASSWORD")
	if from == "" || password == "" {
		return fmt.Errorf("SMTP credentials not configured")
	}

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	message := []byte(
		"Subject: Order Confirmed - ShopHub 🎉\r\n" +
			"\r\n" +
			"Hello " + name + ",\n\n" +
			"Thank you for your order! 🛍️\n\n" +
			"Your order with orderID " + fmt.Sprintf("%d", orderID) + " has been successfully placed and is being processed.\n\n" +
			"We’ll notify you once it’s shipped.\n\n" +
			"Happy Shopping with ShopHub! ❤️\n\n" +
			"- Team ShopHub",
	)

	auth := smtp.PlainAuth("", from, password, smtpHost)

	return smtp.SendMail(
		smtpHost+":"+smtpPort,
		auth,
		from,
		[]string{to},
		message,
	)
}

func (oc *OrderController) InitiatePayment(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	orderID := c.Param("id")
	var order models.Order
	if err := oc.DB.Where("id = ? AND user_id = ?", orderID, user.ID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	if order.Status == "paid" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order is already paid"})
		return
	}

	// Create new Razorpay Order for this existing local order
	keyID := os.Getenv("RAZORPAY_KEY_ID")
	keySecret := os.Getenv("RAZORPAY_KEY_SECRET")

	if keyID == "" || keySecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Razorpay credentials not configured"})
		return
	}

	client := razorpay.NewClient(keyID, keySecret)
	data := map[string]any{
		"amount":   order.TotalPaise,
		"currency": "INR",
		"receipt":  fmt.Sprintf("receipt_order_%d", order.ID),
	}
	rzOrder, err := client.Order.Create(data, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create Razorpay order: " + err.Error()})
		return
	}

	razorpayOrderID := rzOrder["id"].(string)

	// Update local order with new Razorpay Order ID
	order.RazorpayOrderID = razorpayOrderID
	oc.DB.Save(&order)

	c.JSON(http.StatusOK, gin.H{
		"razorpay_key_id":   keyID,
		"razorpay_order_id": razorpayOrderID,
		"amount":            order.TotalPaise,
	})
}

type createOrderRequest struct {
	AddressID uint `json:"addressId" binding:"required"`
}

func (oc *OrderController) Create(c *gin.Context) {
	var req createOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	var address models.Address
	if err := oc.DB.Where("id = ? AND user_id = ?", req.AddressID, user.ID).First(&address).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid address"})
		return
	}
	// Load user's cart items
	var cartItems []models.CartItem
	if err := oc.DB.Preload("Product").Where("user_id = ?", user.ID).Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load cart"})
		return
	}
	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cart is empty"})
		return
	}

	// Calculate subtotal in paise
	var subtotalPaise int64
	for _, item := range cartItems {
		subtotalPaise += int64(item.Quantity) * item.Product.PricePaise
	}

	// Add 18% GST and 40 INR shipping
	gstPaise := int64(float64(subtotalPaise) * 0.18)
	shippingPaise := int64(4000) // 40.00 INR
	totalPaise := subtotalPaise + gstPaise + shippingPaise

	// Create Razorpay Order
	keyID := os.Getenv("RAZORPAY_KEY_ID")
	keySecret := os.Getenv("RAZORPAY_KEY_SECRET")

	// Log masked keys for debugging (visible in backend terminal)
	maskedKey := ""
	if len(keyID) > 8 {
		maskedKey = keyID[:8] + "..."
	} else {
		maskedKey = "invalid/too short"
	}
	fmt.Printf("Attempting Razorpay order with Key ID: %s\n", maskedKey)

	if keyID == "" || keySecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file."})
		return
	}

	client := razorpay.NewClient(keyID, keySecret)
	data := map[string]any{
		"amount":   totalPaise,
		"currency": "INR",
		"receipt":  "receipt_id_" + user.Email,
	}
	rzOrder, err := client.Order.Create(data, nil)
	if err != nil {
		fmt.Printf("Razorpay Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create Razorpay order: " + err.Error()})
		return
	}

	razorpayOrderID := rzOrder["id"].(string)

	// Create local order
	order := models.Order{
		UserID:          user.ID,
		Status:          "pending",
		AddressID:       &req.AddressID,
		TotalPaise:      totalPaise,
		RazorpayOrderID: razorpayOrderID,
	}
	if err := oc.DB.Create(&order).Error; err != nil {
		fmt.Printf("Order Create Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create order: " + err.Error()})
		return
	}

	// Create order items
	for _, item := range cartItems {
		orderItem := models.OrderItem{
			OrderID:    order.ID,
			ProductID:  item.ProductID,
			Quantity:   item.Quantity,
			PricePaise: item.Product.PricePaise,
		}
		if err := oc.DB.Create(&orderItem).Error; err != nil {
			fmt.Printf("OrderItem Create Error: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create order item: " + err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"order":             order,
		"razorpay_key_id":   os.Getenv("RAZORPAY_KEY_ID"),
		"razorpay_order_id": razorpayOrderID,
		"amount":            totalPaise,
	})
}

func (oc *OrderController) GetAll(c *gin.Context) {
	orders := []models.Order{}
	if err := oc.DB.Preload("User").Preload("Items.Product").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load all orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func (oc *OrderController) VerifyPayment(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input struct {
		RazorpayOrderID   string `json:"razorpay_order_id"`
		RazorpayPaymentID string `json:"razorpay_payment_id"`
		RazorpaySignature string `json:"razorpay_signature"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	// Verify signature
	secret := os.Getenv("RAZORPAY_KEY_SECRET")
	data := input.RazorpayOrderID + "|" + input.RazorpayPaymentID
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(data))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	if expectedSignature != input.RazorpaySignature {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid signature"})
		return
	}

	// Update order
	var order models.Order
	if err := oc.DB.Where("razorpay_order_id = ?", input.RazorpayOrderID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	order.Status = "paid"
	order.RazorpayPaymentID = input.RazorpayPaymentID
	order.RazorpaySignature = input.RazorpaySignature
	oc.DB.Save(&order)
	// Clear cart
	oc.DB.Where("user_id = ?", user.ID).Delete(&models.CartItem{})
	go SendEmail(user.Email, user.Name, order.ID)
	c.JSON(http.StatusOK, gin.H{"message": "payment verified successfully", "order": order})
}
func (oc *OrderController) DownloadInvoice(c *gin.Context) {
	orderID := c.Param("id")

	// 1. Order fetch with relations
	var order models.Order
	if err := oc.DB.
		Preload("User").
		Preload("Items.Product").
		First(&order, orderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	// 2. Security: only paid orders
	if order.Status != "paid" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invoice only available for paid orders"})
		return
	}

	// 3. Create PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Title
	pdf.SetFont("Arial", "B", 18)
	pdf.Cell(40, 10, "Invoice")
	pdf.Ln(12)

	// User details
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(100, 8, "Customer: "+order.User.Name)
	pdf.Ln(6)
	pdf.Cell(100, 8, "Email: "+order.User.Email)
	pdf.Ln(6)
	pdf.Cell(100, 8, "Order ID: "+fmt.Sprint(order.ID))
	pdf.Ln(10)

	// Table header
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(80, 10, "Product")
	pdf.Cell(30, 10, "Qty")
	pdf.Cell(40, 10, "Price")
	pdf.Ln(10)

	// Items
	pdf.SetFont("Arial", "", 12)
	var total float64 = 0

	for _, item := range order.Items {
		name := item.Product.Name
		qty := item.Quantity
		price := float64(item.Product.PricePaise) / 100 * float64(qty)

		total += price

		pdf.Cell(80, 8, name)
		pdf.Cell(30, 8, fmt.Sprint(qty))
		pdf.Cell(40, 8, fmt.Sprintf("₹%.2f", price))
		pdf.Ln(8)
	}

	// Total
	pdf.Ln(10)
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(40, 10, fmt.Sprintf("Total: ₹%.2f", total))

	// 4. Response headers
	filename := fmt.Sprintf("invoice_%d.pdf", order.ID)
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename="+filename)

	// 5. Output
	pdf.Output(c.Writer)
}
