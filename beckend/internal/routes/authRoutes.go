package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beckend/internal/controllers"
	"beckend/internal/middlewares"
)

func RegisterAuthRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	uc := &controllers.UserController{DB: db}

	auth := rg.Group("/auth")
	auth.POST("/signup", uc.Signup)
	auth.POST("/login", uc.Login)

	users := rg.Group("/users")
	users.Use(middlewares.AuthRequired(db))
	users.GET("/me", uc.Me)
	users.PUT("/profile", uc.UpdateProfile)
	users.GET("", middlewares.AdminOnly(), uc.List)
}
