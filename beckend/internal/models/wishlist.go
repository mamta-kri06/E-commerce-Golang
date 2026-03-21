package models

import "time"

type WishlistItem struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint
	ProductID uint

	Product   Product `gorm:"foreignKey:ProductID"`
	CreatedAt time.Time
}
