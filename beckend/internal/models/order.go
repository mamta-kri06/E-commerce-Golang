package models

import "time"

// Order represents a user's purchase order.
type Order struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	UserID uint `gorm:"not null;index" json:"userId"`
	User   User `gorm:"foreignKey:UserID" json:"user"`

	Status     string `gorm:"not null;default:'pending'" json:"status"` // e.g., pending, completed, cancelled
	TotalPaise int64  `gorm:"not null;default:0" json:"totalPaise"`

	RazorpayOrderID   string `json:"razorpayOrderId"`
	RazorpayPaymentID string `json:"razorpayPaymentId"`
	RazorpaySignature string `json:"razorpaySignature"`

	Items []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
}

// OrderItem represents an item in an order.
type OrderItem struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	OrderID   uint    `gorm:"not null;index" json:"orderId"`
	ProductID uint    `gorm:"not null" json:"productId"`
	Product   Product `gorm:"foreignKey:ProductID" json:"product"`

	Quantity   int   `gorm:"not null;default:1" json:"quantity"`
	PricePaise int64 `gorm:"not null" json:"pricePaise"` // Price at time of order
}
