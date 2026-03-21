package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/models"
)

type ProductController struct {
	DB *gorm.DB
}

type productUpsertRequest struct {
	Name        string `json:"name" binding:"required,min=2"`
	Description string `json:"description"`
	ImageURL    string `json:"imageUrl"`
	PricePaise  int64  `json:"pricePaise" binding:"required,gt=0"`
	Currency    string `json:"currency"`
	Stock       int    `json:"stock"`
	Active      *bool  `json:"active"`
	Category    string `json:"category"`
}

func (pc *ProductController) List(c *gin.Context) {
	var items []models.Product
	q := pc.DB.Model(&models.Product{})
	if c.Query("all") != "1" {
		q = q.Where("active = true")
	}
	if cat := c.Query("category"); cat != "" {
		q = q.Where("category = ?", cat)
	}
	if err := q.Order("id desc").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load products"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (pc *ProductController) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var p models.Product
	if err := pc.DB.First(&p, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (pc *ProductController) Create(c *gin.Context) {
	var req productUpsertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	p := models.Product{
		Name:        req.Name,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		PricePaise:  req.PricePaise,
		Currency:    pick(req.Currency, "INR"),
		Stock:       req.Stock,
		Active:      true,
		Category:    req.Category,
	}
	if req.Active != nil {
		p.Active = *req.Active
	}

	if err := pc.DB.Create(&p).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create product"})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (pc *ProductController) BulkCreate(c *gin.Context) {
	var req []productUpsertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var products []models.Product
	for _, r := range req {
		p := models.Product{
			Name:        r.Name,
			Description: r.Description,
			ImageURL:    r.ImageURL,
			PricePaise:  r.PricePaise,
			Currency:    pick(r.Currency, "INR"),
			Stock:       r.Stock,
			Active:      true,
			Category:    r.Category,
		}
		if r.Active != nil {
			p.Active = *r.Active
		}
		products = append(products, p)
	}

	if err := pc.DB.Create(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to bulk create products"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"count": len(products), "items": products})
}

func (pc *ProductController) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req productUpsertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var p models.Product
	if err := pc.DB.First(&p, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	p.Name = req.Name
	p.Description = req.Description
	p.ImageURL = req.ImageURL
	p.PricePaise = req.PricePaise
	p.Currency = pick(req.Currency, p.Currency)
	p.Stock = req.Stock
	p.Category = req.Category
	if req.Active != nil {
		p.Active = *req.Active
	}

	if err := pc.DB.Save(&p).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update product"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (pc *ProductController) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := pc.DB.Delete(&models.Product{}, uint(id)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete product"})
		return
	}
	c.Status(http.StatusNoContent)
}
