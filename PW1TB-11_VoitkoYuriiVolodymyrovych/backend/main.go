package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
)

type CalculationRequest1 struct {
	HP float64 `json:"hp"`
	CP float64 `json:"cp"`
	SP float64 `json:"sp"`
	NP float64 `json:"np"`
	OP float64 `json:"op"`
	WP float64 `json:"wp"`
	AP float64 `json:"ap"`
}

type CalculationRequest2 struct {
	H   float64 `json:"h"`
	C   float64 `json:"c"`
	S   float64 `json:"s"`
	O   float64 `json:"o"`
	W   float64 `json:"w"`
	A   float64 `json:"a"`
	V   float64 `json:"v"`
	QFO float64 `json:"qFO"`
}

func calculate1(c *gin.Context) {
	var req CalculationRequest1
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	total := req.HP + req.CP + req.SP + req.NP + req.OP + req.WP + req.AP
	if total != 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Сума всіх компонентів повинна складати 100%"})
		return
	}

	krs := 100 / (100 - req.WP)
	krg := 100 / (100 - req.WP - req.AP)

	dryMassComposition := map[string]float64{
		"hp": req.HP * krs,
		"cp": req.CP * krs,
		"sp": req.SP * krs,
		"np": req.NP * krs,
		"op": req.OP * krs,
		"ap": req.AP * krs,
	}

	combustibleMassComposition := map[string]float64{
		"hp": req.HP * krg,
		"cp": req.CP * krg,
		"sp": req.SP * krg,
		"np": req.NP * krg,
		"op": req.OP * krg,
	}

	qph := (339*req.CP + 1030*req.HP - 108.8*(req.OP-req.SP) - 25*req.WP) / 1000
	qch := (qph + 0.025*req.WP) * krs
	qgh := (qph + 0.025*req.WP) * krg

	c.JSON(http.StatusOK, gin.H{
		"krs":                        krs,
		"krg":                        krg,
		"dryMassComposition":         dryMassComposition,
		"combustibleMassComposition": combustibleMassComposition,
		"qph":                        qph,
		"qch":                        qch,
		"qgh":                        qgh,
	})
}

func calculate2(c *gin.Context) {
	var req CalculationRequest2
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	krs := (100 - req.W - req.A) / 100
	hWork := req.H * krs
	cWork := req.C * krs
	sWork := req.S * krs
	oWork := req.O * krs
	vWork := req.V * (100 - req.W) / 100
	qR := req.QFO*krs - 0.025*req.W

	c.JSON(http.StatusOK, gin.H{
		"composition": gin.H{
			"CP": cWork,
			"HP": hWork,
			"SP": sWork,
			"OP": oWork,
			"AP": req.A,
			"VP": vWork,
		},
		"qR": qR,
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
