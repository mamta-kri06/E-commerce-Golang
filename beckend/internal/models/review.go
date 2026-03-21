package models

import "time"

type Review struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	ProductID uint    `gorm:"not null;index" json:"productId"`
	Product   Product `gorm:"foreignKey:ProductID" json:"-"`

	UserID uint `gorm:"not null;index" json:"userId"`
	User   User `gorm:"foreignKey:UserID" json:"user"`

	Rating  int    `gorm:"not null;check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment string `gorm:"type:text" json:"comment"`
}
