package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/controllers"
	"beckend/internal/middlewares"
)

func RegisterProductRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	pc := &controllers.ProductController{DB: db}

	products := rg.Group("/products")
	products.GET("", pc.List)
	products.GET("/:id", pc.Get)

	admin := products.Group("")
	admin.Use(middlewares.AuthRequired(db), middlewares.AdminOnly())
	admin.POST("", pc.Create)
	admin.POST("/bulk", pc.BulkCreate)
	admin.PUT("/:id", pc.Update)
	admin.DELETE("/:id", pc.Delete)
}

