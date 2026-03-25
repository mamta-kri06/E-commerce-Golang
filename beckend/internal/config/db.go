package config

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"beckend/internal/models"
)

func ConnectDB() (*gorm.DB, error) {

	// ✅ Load .env from root (beckend/)
	err := godotenv.Load("../../.env")
	if err != nil {
		fmt.Println("⚠️ No .env file found, using system env")
	}

	// ✅ Read DB URL from env
	dsn := os.Getenv("DATABASE_URL")

	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxOpenConns(20)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)

	if err := db.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
		&models.Review{},
		&models.WishlistItem{},
		&models.Address{},
	); err != nil {
		return nil, err
	}

	return db, nil
}
