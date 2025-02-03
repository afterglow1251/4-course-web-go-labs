package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"math"
	"net/http"
	"time"
)

type Equipment struct {
	Name                string  `json:"name"`
	Efficiency          float64 `json:"efficiency"`
	PowerFactor         float64 `json:"powerFactor"`
	Voltage             float64 `json:"voltage"`
	Quantity            float64 `json:"quantity"`
	NominalPower        float64 `json:"nominalPower"`
	UsageCoefficient    float64 `json:"usageCoefficient"`
	ReactivePowerFactor float64 `json:"reactivePowerFactor"`
	TotalNominalPower   string  `json:"totalNominalPower,omitempty"`
	Current             string  `json:"current,omitempty"`
}

type RequestData struct {
	EquipmentList []Equipment `json:"equipmentList"`
	Kr            float64     `json:"kr"`
	Kr2           float64     `json:"kr2"`
}

type EquipmentCalculationResponse struct {
	GroupUtilizationCoefficient  float64 `json:"groupUtilizationCoefficient"`
	EffectiveEquipmentCount      float64 `json:"effectiveEquipmentCount"`
	TotalActivePowerDept         float64 `json:"totalActivePowerDept"`
	TotalReactivePowerDept       float64 `json:"totalReactivePowerDept"`
	TotalApparentPowerDept       float64 `json:"totalApparentPowerDept"`
	TotalCurrentDept             float64 `json:"totalCurrentDept"`
	TotalDeptUtilizationCoef     float64 `json:"totalDeptUtilizationCoef"`
	EffectiveEquipmentDeptAmount float64 `json:"effectiveEquipmentDeptAmount"`
	TotalActivePowerDept1        float64 `json:"totalActivePowerDept1"`
	TotalReactivePowerDept1      float64 `json:"totalReactivePowerDept1"`
	TotalApparentPowerDept1      float64 `json:"totalApparentPowerDept1"`
	TotalCurrentDept1            float64 `json:"totalCurrentDept1"`
}

func calculateEquipment(c *gin.Context) {
	var req RequestData
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Обчислення загальної номінальної потужності та струму для кожного обладнання
	var totalNominalPowerCoeffProduct, totalNominalPowerProduct, totalNominalPowerSquared float64
	for _, equipment := range req.EquipmentList {
		// Обчислення загальної номінальної потужності
		equipmentTotalNominalPower := equipment.Quantity * equipment.NominalPower
		totalNominalPowerCoeffProduct += equipmentTotalNominalPower * equipment.UsageCoefficient
		totalNominalPowerProduct += equipmentTotalNominalPower
		totalNominalPowerSquared += equipment.Quantity * math.Pow(equipment.NominalPower, 2)
	}

	// Коефіцієнт групового використання
	groupUtilizationCoefficient := totalNominalPowerCoeffProduct / totalNominalPowerProduct

	// Ефективна кількість ЕП
	effectiveEquipmentCount := math.Ceil(totalNominalPowerProduct * totalNominalPowerProduct / totalNominalPowerSquared)

	// Розрахунок потужності для системи
	activePower := req.Kr * totalNominalPowerCoeffProduct
	reactivePower := groupUtilizationCoefficient * 26 * 1.62 // константи за варіантом 7
	apparentPower := math.Sqrt(math.Pow(activePower, 2) + math.Pow(reactivePower, 2))
	groupCurrent := activePower / 0.38

	// Розрахунок коефіцієнта використання цеху
	totalDeptUtilizationCoef := 752.0 / 2330.0
	effectiveEquipmentDeptAmount := 2330.0 * 2330.0 / 96399.0

	// Розрахунки для шини
	activePowerBus := req.Kr2 * 752.0
	reactivePowerBus := req.Kr2 * 657.0
	apparentPowerBus := math.Sqrt(math.Pow(activePowerBus, 2) + math.Pow(reactivePowerBus, 2))
	busCurrent := activePowerBus / 0.38

	response := EquipmentCalculationResponse{
		GroupUtilizationCoefficient:  groupUtilizationCoefficient,
		EffectiveEquipmentCount:      effectiveEquipmentCount,
		TotalActivePowerDept:         activePower,
		TotalReactivePowerDept:       reactivePower,
		TotalApparentPowerDept:       apparentPower,
		TotalCurrentDept:             groupCurrent,
		TotalDeptUtilizationCoef:     totalDeptUtilizationCoef,
		EffectiveEquipmentDeptAmount: effectiveEquipmentDeptAmount,
		TotalActivePowerDept1:        activePowerBus,
		TotalReactivePowerDept1:      reactivePowerBus,
		TotalApparentPowerDept1:      apparentPowerBus,
		TotalCurrentDept1:            busCurrent,
	}

	c.JSON(http.StatusOK, response)
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

	r.POST("/api/calculate1", calculateEquipment)

	// Запуск серверу
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Server startup error: %v", err)
	}
}
