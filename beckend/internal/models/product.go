package models

import "time"

type Product struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	ImageURL    string    `json:"imageUrl"`
	PricePaise  int64     `gorm:"not null" json:"pricePaise"`
	Currency    string    `gorm:"type:varchar(8);not null;default:'INR'" json:"currency"`
	Stock       int       `gorm:"not null;default:0" json:"stock"`
	Active      bool      `gorm:"not null;default:true" json:"active"`
	Category    string    `gorm:"type:varchar(64)" json:"category"`
}
