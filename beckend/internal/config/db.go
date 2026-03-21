package config

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"beckend/internal/models"
)

func ConnectDB() (*gorm.DB, error) {
	dsn := "postgresql://neondb_owner:npg_V9kvlzT7JjuH@ep-misty-frost-a4hg4fn1-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

	if dsn == "" {
		host := env("DB_HOST", "localhost")
		port := env("DB_PORT", "5432")
		user := env("DB_USER", "postgres")
		pass := env("DB_PASS", "postgres")
		name := env("DB_NAME", "ecommerce")
		ssl := env("DB_SSLMODE", "disable")
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC", host, user, pass, name, port, ssl)
	} else {
		// Neon provides a URL DSN like:
		// postgresql://user:pass@host/db?sslmode=require&...
		// GORM's postgres driver accepts it directly.
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
	); err != nil {
		return nil, err
	}

	return db, nil
}

func env(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}
