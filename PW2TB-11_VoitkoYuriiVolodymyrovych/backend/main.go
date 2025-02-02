package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
)

type CalculationRequest1 struct {
	Qir     float64 `json:"Q_i_r"`
	Avun    float64 `json:"a_vun"`
	Ar      float64 `json:"A_r"`
	Gvun    float64 `json:"G_vun"`
	EtaZy   float64 `json:"eta_z_y"`
	KtvS    float64 `json:"k_tv_s"`
	B       float64 `json:"B"`
}

func calculate1(c *gin.Context) {
	var req CalculationRequest1
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	kTv := (1e6 / req.Qir) * (req.Avun * (req.Ar / (100 - req.Gvun)) * (1 - req.EtaZy)) + req.KtvS

	E_tv := 1e-6 * kTv * req.Qir * req.B

	c.JSON(http.StatusOK, gin.H{
		"emissionIndex": kTv,
		"grossEmission": E_tv,
	})
}

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.POST("/api/calculate1", calculate1)

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Server startup error: %v", err)
	}
}
