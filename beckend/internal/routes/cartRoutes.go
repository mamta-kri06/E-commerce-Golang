package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/controllers"
	"beckend/internal/middlewares"
)

func RegisterCartRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	cc := &controllers.CartController{DB: db}

	cart := rg.Group("/cart")
	cart.Use(middlewares.AuthRequired(db))
	cart.GET("", cc.Get)
	cart.POST("", cc.Add)
	cart.DELETE("", cc.Clear)
	cart.PUT("/:productId", cc.Update)
	cart.DELETE("/:productId", cc.Delete)
}
