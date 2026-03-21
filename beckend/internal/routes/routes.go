package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterRoutes wires all route groups under /api.
func RegisterRoutes(api *gin.RouterGroup, db *gorm.DB) {
	RegisterAuthRoutes(api, db)
	RegisterProductRoutes(api, db)
	RegisterCartRoutes(api, db)
	RegisterOrderRoutes(api, db)
	RegisterDashboardRoutes(api, db)
	RegisterReviewRoutes(api, db)
	RegisterWishlistRoutes(api, db)
}
