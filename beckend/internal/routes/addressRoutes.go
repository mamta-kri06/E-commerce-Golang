package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/controllers"
	"beckend/internal/middlewares"
)

func RegisterAddressRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	ac := &controllers.AddressController{DB: db}

	address := rg.Group("/address")
	address.Use(middlewares.AuthRequired(db))

	address.POST("", ac.Create)
	address.GET("", ac.GetAll)
	address.PUT("/:id", ac.Update)
	address.DELETE("/:id", ac.Delete)
}
