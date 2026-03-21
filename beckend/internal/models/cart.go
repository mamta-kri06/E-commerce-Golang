package models

import "time"

// CartItem represents a product added to a user's shopping cart.
// Quantity is the number of units the user intends to purchase.
// Product is preloaded to allow returning product details with the cart item.
type CartItem struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	UserID    uint `gorm:"not null;index;index:idx_user_product,unique" json:"userId"`
	ProductID uint `gorm:"not null;index;index:idx_user_product,unique" json:"productId"`
	Quantity  int  `gorm:"not null;default:1" json:"quantity"`

	Product Product `gorm:"foreignKey:ProductID" json:"product"`
}
