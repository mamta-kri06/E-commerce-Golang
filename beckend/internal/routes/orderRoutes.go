package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/controllers"
	"beckend/internal/middlewares"
)

func RegisterOrderRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	oc := &controllers.OrderController{DB: db}

	orders := rg.Group("/orders")
	orders.Use(middlewares.AuthRequired(db))
	orders.GET("", oc.Get)
	orders.POST("", oc.Create)
	orders.POST("/:id/initiate-payment", oc.InitiatePayment)
	orders.POST("/verify-payment", oc.VerifyPayment)
	orders.GET("/invoice/:orderId", oc.DownloadInvoice)

	// Admin only
	admin := orders.Group("/all")
	admin.Use(middlewares.AdminOnly())
	admin.GET("", oc.GetAll)
}
