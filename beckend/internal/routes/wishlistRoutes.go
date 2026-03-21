package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/controllers"
	"beckend/internal/middlewares"
)

func RegisterWishlistRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	wc := &controllers.WishlistController{DB: db}

	wishlist := rg.Group("/wishlist")

	// 🔐 Protected routes (wishlist is always user-specific)
	protected := wishlist.Group("")
	protected.Use(middlewares.AuthRequired(db))

	// ➕ Add to wishlist
	protected.POST("", wc.AddToWishlist)

	// ❌ Remove from wishlist
	protected.DELETE("/:productId", wc.RemoveFromWishlist)

	// 📥 Get user's wishlist
	protected.GET("", wc.GetWishlist)
}
