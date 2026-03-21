package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/controllers"
	"beckend/internal/middlewares"
)

func RegisterReviewRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	rc := &controllers.ReviewController{DB: db}

	reviews := rg.Group("/reviews")
	
	// Public route to get reviews for a product
	reviews.GET("/product/:productId", rc.GetByProduct)

	// Protected route to create a review
	protected := reviews.Group("")
	protected.Use(middlewares.AuthRequired(db))
	protected.POST("", rc.Create)
}
