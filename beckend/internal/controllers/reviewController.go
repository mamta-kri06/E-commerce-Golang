package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/middlewares"
	"beckend/internal/models"
)

type ReviewController struct {
	DB *gorm.DB
}

type createReviewRequest struct {
	ProductID uint   `json:"productId" binding:"required"`
	Rating    int    `json:"rating" binding:"required,min=1,max=5"`
	Comment   string `json:"comment"`
}

func (rc *ReviewController) Create(c *gin.Context) {
	user := middlewares.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var req createReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Optional: Check if user has already reviewed this product
	var existingReview models.Review
	if err := rc.DB.Where("user_id = ? AND product_id = ?", user.ID, req.ProductID).First(&existingReview).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "you have already reviewed this product"})
		return
	}

	review := models.Review{
		UserID:    user.ID,
		ProductID: req.ProductID,
		Rating:    req.Rating,
		Comment:   req.Comment,
	}

	if err := rc.DB.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create review"})
		return
	}

	// Preload user for the response
	rc.DB.Preload("User").First(&review, review.ID)

	c.JSON(http.StatusCreated, review)
}

func (rc *ReviewController) GetByProduct(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("productId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var reviews []models.Review
	if err := rc.DB.Preload("User").Where("product_id = ?", uint(productID)).Order("created_at desc").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reviews"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}
