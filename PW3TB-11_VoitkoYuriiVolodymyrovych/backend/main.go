package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"math"
	"net/http"
	"time"
)

type CalculationRequest struct {
	Pc    float64 `json:"Pc"`
	Sigma float64 `json:"Sigma"`
	B     float64 `json:"B"`
}

// Нормальний розподіл
func calculateNormalDistribution(power, averagePower, standardDeviation float64) float64 {
	return (1 / (standardDeviation * math.Sqrt(2*math.Pi))) * math.Exp(-math.Pow(power-averagePower, 2)/(2*math.Pow(standardDeviation, 2)))
}

// Інтеграція за допомогою методу трапецій
func integrateEnergyShare(function func(float64, float64, float64) float64, averagePower, sigma, totalSteps, deviationFactor float64) float64 {
	lowerLimit := averagePower * (1 - deviationFactor)
	upperLimit := averagePower * (1 + deviationFactor)
	stepSize := (upperLimit - lowerLimit) / totalSteps
	var result float64

	totalStepsInt := int(totalSteps)

	// Виконання інтеграції
	for i := 0; i < totalStepsInt; i++ {
		currentPoint := lowerLimit + float64(i)*stepSize
		nextPoint := currentPoint + stepSize
		result += 0.5 * (function(currentPoint, averagePower, sigma) + function(nextPoint, averagePower, sigma)) * stepSize
	}

	return result
}

func calculate(c *gin.Context) {
	var req CalculationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Частка енергії, що генерується без небалансів
	balancedEnergyShare := integrateEnergyShare(calculateNormalDistribution, req.Pc, req.Sigma, 10000, 0.05)

	// Обчислення доходу, штрафу та прибутку
	revenue := req.Pc * 24 * balancedEnergyShare * req.B
	fine := req.Pc * 24 * (1 - balancedEnergyShare) * req.B
	profit := revenue - fine

	c.JSON(http.StatusOK, gin.H{
		"revenue": revenue,
		"fine":    fine,
		"profit":  profit,
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

	r.POST("/api/calculate1", calculate)

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Server startup error: %v", err)
	}
}
