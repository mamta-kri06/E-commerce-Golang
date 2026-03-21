package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/middlewares"
	"beckend/internal/models"
)

type CartController struct {
	DB *gorm.DB
}

type addToCartRequest struct {
	ProductID uint `json:"productId" binding:"required"`
	Quantity  int  `json:"quantity" binding:"omitempty,min=1"`
}

type updateCartRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}

func (cc *CartController) Get(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var items []models.CartItem
	if err := cc.DB.Preload("Product").Where("user_id = ?", user.ID).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (cc *CartController) Add(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var req addToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Quantity == 0 {
		req.Quantity = 1
	}

	// Ensure the product exists.
	var prod models.Product
	if err := cc.DB.First(&prod, req.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	var item models.CartItem
	if err := cc.DB.Where("user_id = ? AND product_id = ?", user.ID, req.ProductID).First(&item).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			item = models.CartItem{
				UserID:    user.ID,
				ProductID: req.ProductID,
				Quantity:  req.Quantity,
			}
			if err := cc.DB.Create(&item).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add to cart"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load cart item"})
			return
		}
	} else {
		item.Quantity += req.Quantity
		if err := cc.DB.Save(&item).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update cart"})
			return
		}
	}

	// reload with product details
	cc.DB.Preload("Product").First(&item, item.ID)
	c.JSON(http.StatusOK, item)
}

func (cc *CartController) Update(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	productID, err := strconv.ParseUint(c.Param("productId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var req updateCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var item models.CartItem
	if err := cc.DB.Where("user_id = ? AND product_id = ?", user.ID, uint(productID)).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart item not found"})
		return
	}

	item.Quantity = req.Quantity
	if err := cc.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update cart item"})
		return
	}

	cc.DB.Preload("Product").First(&item, item.ID)
	c.JSON(http.StatusOK, item)
}

func (cc *CartController) Delete(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	productID, err := strconv.ParseUint(c.Param("productId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	if err := cc.DB.Where("user_id = ? AND product_id = ?", user.ID, uint(productID)).Delete(&models.CartItem{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove cart item"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (cc *CartController) Clear(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	if err := cc.DB.Where("user_id = ?", user.ID).Delete(&models.CartItem{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to clear cart"})
		return
	}

	c.Status(http.StatusNoContent)
}
