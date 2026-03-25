package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/middlewares"
	"beckend/internal/models"
)

type AddressController struct {
	DB *gorm.DB
}

type addressRequest struct {
	Name         string `json:"name" `
	Phone        string `json:"phone" `
	AddressLine1 string `json:"addressLine1" `
	City         string `json:"city" binding:"required"`
	State        string `json:"state" binding:"required"`
	Pincode      string `json:"pincode" binding:"required"`
	IsDefault    bool   `json:"isDefault"`
}

// ➕ Add Address
func (ac *AddressController) Create(c *gin.Context) {
	user := middlewares.CurrentUser(c)

	var req addressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// agar new address default hai → purane default hata do
	if req.IsDefault {
		ac.DB.Model(&models.Address{}).
			Where("user_id = ?", user.ID).
			Update("is_default", false)
	}

	address := models.Address{
		UserID:       user.ID,
		Name:         req.Name,
		Phone:        req.Phone,
		AddressLine1: req.AddressLine1,
		City:         req.City,
		State:        req.State,
		Pincode:      req.Pincode,
		IsDefault:    req.IsDefault,
	}

	if err := ac.DB.Create(&address).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create address"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"address": address})
}

// 📥 Get All Addresses
func (ac *AddressController) GetAll(c *gin.Context) {
	user := middlewares.CurrentUser(c)

	var addresses []models.Address
	ac.DB.Where("user_id = ?", user.ID).Find(&addresses)

	c.JSON(http.StatusOK, gin.H{"addresses": addresses})
}

// ✏️ Update Address
func (ac *AddressController) Update(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	id := c.Param("id")

	var address models.Address
	if err := ac.DB.Where("id = ? AND user_id = ?", id, user.ID).First(&address).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "address not found"})
		return
	}

	var req addressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.IsDefault {
		ac.DB.Model(&models.Address{}).
			Where("user_id = ?", user.ID).
			Update("is_default", false)
	}

	address.Name = req.Name
	address.Phone = req.Phone
	address.AddressLine1 = req.AddressLine1
	address.City = req.City
	address.State = req.State
	address.Pincode = req.Pincode
	address.IsDefault = req.IsDefault

	ac.DB.Save(&address)

	c.JSON(http.StatusOK, gin.H{"address": address})
}

// ❌ Delete Address
func (ac *AddressController) Delete(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	id := c.Param("id")

	ac.DB.Where("id = ? AND user_id = ?", id, user.ID).
		Delete(&models.Address{})

	c.JSON(http.StatusOK, gin.H{"message": "address deleted"})
}
