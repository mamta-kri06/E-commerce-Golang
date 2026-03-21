package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"beckend/internal/config"
	"beckend/internal/routes"
)

func main() {
	// Load environment variables from .env for local/dev runs.
	if err := loadDotEnv(); err != nil {
		log.Printf("Warning: .env file not loaded: %v", err)
	} else {
		log.Println(".env file loaded successfully")
	}

	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("db connection failed: %v", err)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{getEnv("CORS_ORIGIN", "*")},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	routes.RegisterRoutes(api, db)

	addr := getEnv("ADDR", ":8080")
	log.Printf("listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func getEnv(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}

func loadDotEnv() error {
	// Try loading from current directory, one level up, and two levels up.
	// This covers running from project root, beckend root, or beckend/cmd/api.
	candidates := []string{
		".env",
		"../.env",
		"../../.env",
		"../../../.env",
	}

	for _, f := range candidates {
		if _, err := os.Stat(f); err == nil {
			return godotenv.Load(f)
		}
	}
	return godotenv.Load() // fallback to default
}
