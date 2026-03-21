package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/controllers"
	"beckend/internal/middlewares"
)

func RegisterDashboardRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	dc := &controllers.DashboardController{DB: db}

	dashboard := rg.Group("/dashboard")
	dashboard.Use(middlewares.AuthRequired(db), middlewares.AdminOnly())
	
	dashboard.GET("/stats", dc.GetStats)
}
