package controllers

import (
	"beckend/internal/middlewares"
	"beckend/internal/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type WishlistController struct {
	DB *gorm.DB
}

// ➕ Add
func (wc *WishlistController) AddToWishlist(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input struct {
		ProductID uint `json:"product_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	wishlist := models.WishlistItem{
		UserID:    user.ID,
		ProductID: input.ProductID,
	}

	if err := wc.DB.Create(&wishlist).Error; err != nil {
		fmt.Println("🔥 DB ERROR:", err) // terminal me exact error dikhega
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "added to wishlist"})
}

// ❌ Remove
func (wc *WishlistController) RemoveFromWishlist(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	productID := c.Param("productId")

	wc.DB.Where("user_id=? AND product_id=?", user.ID, productID).
		Delete(&models.WishlistItem{})

	c.JSON(http.StatusOK, gin.H{"message": "removed"})
}

// 📥 Get
func (wc *WishlistController) GetWishlist(c *gin.Context) {
	user := middlewares.CurrentUser(c)

	var items []models.WishlistItem

	wc.DB.Preload("Product").
		Where("user_id=?", user.ID).
		Find(&items)

	c.JSON(http.StatusOK, gin.H{"wishlist": items})
}
