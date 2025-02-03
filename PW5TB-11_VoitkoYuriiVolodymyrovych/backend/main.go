package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
)

type ReliabilityIndicators struct {
	Omega float64
	TV    float64
	Mu    float64
	TP    float64
}

var dataIndicators = map[string]ReliabilityIndicators{
	"ПЛ-110 кВ":                         {Omega: 0.007, TV: 10.0, Mu: 0.167, TP: 35.0},
	"ПЛ-35 кВ":                          {Omega: 0.02, TV: 8.0, Mu: 0.167, TP: 35.0},
	"ПЛ-10 кВ":                          {Omega: 0.02, TV: 10.0, Mu: 0.167, TP: 35.0},
	"КЛ-10 кВ (траншея)":                {Omega: 0.03, TV: 44.0, Mu: 1.0, TP: 9.0},
	"КЛ-10 кВ (кабельний канал)":        {Omega: 0.005, TV: 17.5, Mu: 1.0, TP: 9.0},
	"T-110 кВ":                          {Omega: 0.015, TV: 100.0, Mu: 1.0, TP: 43.0},
	"T-35 кВ":                           {Omega: 0.02, TV: 80.0, Mu: 1.0, TP: 28.0},
	"T-10 кВ (кабельна мережа 10 кВ)":   {Omega: 0.005, TV: 60.0, Mu: 0.5, TP: 10.0},
	"T-10 кВ (повітряна мережа 10 кВ)":  {Omega: 0.05, TV: 60.0, Mu: 0.5, TP: 10.0},
	"B-110 кВ (елегазовий)":             {Omega: 0.01, TV: 30.0, Mu: 0.1, TP: 30.0},
	"B-10 кВ (малооливний)":             {Omega: 0.02, TV: 15.0, Mu: 0.33, TP: 15.0},
	"B-10 кВ (вакуумний)":               {Omega: 0.01, TV: 15.0, Mu: 0.33, TP: 15.0},
	"Збірні шини 10 кВ на 1 приєднання": {Omega: 0.03, TV: 2.0, Mu: 0.167, TP: 5.0},
	"АВ-0,38 кВ":                        {Omega: 0.05, TV: 4.0, Mu: 0.33, TP: 10.0},
	"ЕД 6,10 кВ":                        {Omega: 0.1, TV: 160.0, Mu: 0.5, TP: 0.0},
	"ЕД 0,38 кВ":                        {Omega: 0.1, TV: 50.0, Mu: 0.5, TP: 0.0},
}

type CalculationRequest1 struct {
	Amounts map[string]int `json:"amounts"`
}

func calculate1(c *gin.Context) {
	var req CalculationRequest1
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var wOc, tVOc float64
	for key, amount := range req.Amounts {
		indicator, ok := dataIndicators[key]
		if !ok {
			continue
		}

		if amount > 0 {
			wOc += float64(amount) * indicator.Omega
			tVOc += float64(amount) * indicator.TV * indicator.Omega
		}
	}

	tVOc /= wOc
	kAOc := (tVOc * wOc) / 8760
	kPOs := 1.2 * 43 / 8760
	wDk := 2 * wOc * (kAOc + kPOs)

	c.JSON(http.StatusOK, gin.H{
		"wOc":  wOc,
		"tVOc": tVOc,
		"kAOc": kAOc,
		"kPOs": kPOs,
		"wDk":  wDk,
		"wDs":  wDk + 0.02,
	})
}

type CalculationRequest2 struct {
	Omega float64 `json:"omega"`
	TV    float64 `json:"tV"`
	PM    float64 `json:"pM"`
	TM    float64 `json:"tM"`
	KP    float64 `json:"kP"`
	ZPerA float64 `json:"zPerA"`
	ZPerP float64 `json:"zPerP"`
}

func calculate2(c *gin.Context) {
	var req CalculationRequest2
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	mWnedA := req.Omega * req.TV * req.PM * req.TM
	mWnedP := req.KP * req.PM * req.TM
	mZper := req.ZPerA*mWnedA + req.ZPerP*mWnedP

	c.JSON(http.StatusOK, gin.H{
		"mWnedA": mWnedA,
		"mWnedP": mWnedP,
		"mZper":  mZper,
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
	r.POST("/api/calculate2", calculate2)

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Server startup error: %v", err)
	}
}
