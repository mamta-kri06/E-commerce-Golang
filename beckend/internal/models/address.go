package models

import "time"

type Address struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	UserID uint   `gorm:"not null;index" json:"userId"`
	Name   string `gorm:"not null" json:"name"`
	Phone  string `gorm:"not null" json:"phone"`

	AddressLine1 string `gorm:"not null" json:"addressLine1"`
	City         string `gorm:"not null" json:"city"`
	State        string `gorm:"not null" json:"state"`
	Pincode      string `gorm:"not null" json:"pincode"`

	IsDefault bool `gorm:"default:false" json:"isDefault"`
}
