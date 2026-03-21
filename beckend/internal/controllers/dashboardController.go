package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/models"
)

type DashboardController struct {
	DB *gorm.DB
}

func (dc *DashboardController) GetStats(c *gin.Context) {
	var totalRevenue int64
	var totalOrders int64
	var totalProducts int64
	var totalUsers int64

	// 1. Total Revenue (from paid orders)
	dc.DB.Model(&models.Order{}).Where("status = ?", "paid").Select("COALESCE(SUM(total_paise), 0)").Scan(&totalRevenue)

	// 2. Total Orders
	dc.DB.Model(&models.Order{}).Count(&totalOrders)

	// 3. Total Products
	dc.DB.Model(&models.Product{}).Count(&totalProducts)

	// 4. Total Users
	dc.DB.Model(&models.User{}).Count(&totalUsers)

	// 5. Recent Orders (limit 5)
	var recentOrders []models.Order
	dc.DB.Preload("User").Order("created_at desc").Limit(5).Find(&recentOrders)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"totalRevenue":  totalRevenue,
			"totalOrders":   totalOrders,
			"totalProducts": totalProducts,
			"totalUsers":    totalUsers,
		},
		"recentOrders": recentOrders,
	})
}
