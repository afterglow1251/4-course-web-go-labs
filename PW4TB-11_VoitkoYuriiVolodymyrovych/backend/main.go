package main

import (
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"math"
	"net/http"
	"time"
)

type ConductorType int

const (
	UNSHIELDED ConductorType = iota
	PAPER_AND_RUBBER_CABLES
	RUBBER_AND_PLASTIC_CABLES
)

type ConductorMaterial int

const (
	COPPER ConductorMaterial = iota
	ALUMINUM
)

type CalculationRequest1 struct {
	Unom              float64 `json:"Unom"`
	Sm                float64 `json:"Sm"`
	Ik                float64 `json:"Ik"`
	P_TP              float64 `json:"P_TP"`
	Tf                float64 `json:"Tf"`
	Tm                float64 `json:"Tm"`
	Ct                float64 `json:"Ct"`
	ConductorType     int     `json:"ConductorType"`
	ConductorMaterial int     `json:"ConductorMaterial"`
}

type JekRange struct {
	MinTemp  float64
	MaxTemp  float64
	JekValue float64
}

type CalculationRequest2 struct {
	Ucn    float64 `json:"Ucn"`
	Sk     float64 `json:"Sk"`
	UkPerc float64 `json:"UkPerc"`
	SNomT  float64 `json:"SNomT"`
}

type CalculationRequest3 struct {
	Uk_max float64 `json:"Uk_max"`
	Uv_n   float64 `json:"Uv_n"`
	Un_n   float64 `json:"Un_n"`
	Snom_t float64 `json:"Snom_t"`
	Rc_n   float64 `json:"Rc_n"`
	Rc_min float64 `json:"Rc_min"`
	Xc_n   float64 `json:"Xc_n"`
	Xc_min float64 `json:"Xc_min"`
	L_l    float64 `json:"L_l"`
	R_0    float64 `json:"R_0"`
	X_0    float64 `json:"X_0"`
}

func getJek(conductorType ConductorType, conductorMaterial ConductorMaterial, Tm float64) (float64, error) {
	jekValues := map[ConductorType]map[ConductorMaterial][]JekRange{
		UNSHIELDED: {
			COPPER: {
				{1000.0, 3000.0, 2.5},
				{3000.0, 5000.0, 2.1},
				{5000.0, math.MaxFloat64, 1.8},
			},
			ALUMINUM: {
				{1000.0, 3000.0, 1.3},
				{3000.0, 5000.0, 1.1},
				{5000.0, math.MaxFloat64, 1.0},
			},
		},
		PAPER_AND_RUBBER_CABLES: {
			COPPER: {
				{1000.0, 3000.0, 3.0},
				{3000.0, 5000.0, 2.5},
				{5000.0, math.MaxFloat64, 2.0},
			},
			ALUMINUM: {
				{1000.0, 3000.0, 1.6},
				{3000.0, 5000.0, 1.4},
				{5000.0, math.MaxFloat64, 1.2},
			},
		},
		RUBBER_AND_PLASTIC_CABLES: {
			COPPER: {
				{1000.0, 3000.0, 3.5},
				{3000.0, 5000.0, 3.1},
				{5000.0, math.MaxFloat64, 2.7},
			},
			ALUMINUM: {
				{1000.0, 3000.0, 1.9},
				{3000.0, 5000.0, 1.7},
				{5000.0, math.MaxFloat64, 1.6},
			},
		},
	}

	if ranges, ok := jekValues[conductorType]; ok {
		if materialRanges, ok := ranges[conductorMaterial]; ok {
			for _, r := range materialRanges {
				if Tm >= r.MinTemp && Tm <= r.MaxTemp {
					return r.JekValue, nil
				}
			}
		}
	}

	return 0.0, fmt.Errorf("no jek value found for the given parameters")
}

func calculate1(c *gin.Context) {
	var req CalculationRequest1
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	Im := req.Sm / 2.0 / math.Sqrt(3.0) / req.Unom
	Im_pa := 2 * Im

	jek, err := getJek(ConductorType(req.ConductorType), ConductorMaterial(req.ConductorMaterial), req.Tm)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	Sek := 0.0
	if jek > 0.0 {
		Sek = Im / jek
	}
	Smin := req.Ik * 1000 * math.Sqrt(req.Tf) / req.Ct

	c.JSON(http.StatusOK, gin.H{
		"Im":    Im,
		"Im_pa": Im_pa,
		"Sek":   Sek,
		"Smin":  Smin,
	})
}

func calculate2(c *gin.Context) {
	var req CalculationRequest2
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	Xc := math.Pow(req.Ucn, 2) / req.Sk
	Xt := req.UkPerc * math.Pow(req.Ucn, 2) / req.SNomT / 100
	XSum := Xc + Xt
	Ip0 := req.Ucn / (math.Sqrt(3.0) * XSum)

	c.JSON(http.StatusOK, gin.H{
		"Xc":   Xc,
		"Xt":   Xt,
		"XSum": XSum,
		"Ip0":  Ip0,
	})
}

func calculate3(c *gin.Context) {
	var req CalculationRequest3

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	Xt := req.Uk_max * math.Pow(req.Uv_n, 2) / 100 / req.Snom_t
	Rsh := req.Rc_n
	Xsh := req.Xc_n + Xt
	Zsh := math.Sqrt(math.Pow(Rsh, 2) + math.Pow(Xsh, 2))
	Rsh_min := req.Rc_min
	Xsh_min := req.Xc_min + Xt
	Zsh_min := math.Sqrt(math.Pow(Rsh_min, 2) + math.Pow(Xsh_min, 2))
	Ish3 := req.Uv_n * 1000 / math.Sqrt(3.0) / Zsh
	Ish2 := Ish3 * math.Sqrt(3.0) / 2
	Ish_min3 := req.Uv_n * 1000 / math.Sqrt(3.0) / Zsh_min
	Ish_min2 := Ish_min3 * math.Sqrt(3.0) / 2
	kpr := math.Pow(req.Un_n, 2) / math.Pow(req.Uv_n, 2)

	Rsh_n := Rsh * kpr
	Xsh_n := Xsh * kpr
	Zsh_n := math.Sqrt(math.Pow(Rsh_n, 2) + math.Pow(Xsh_n, 2))
	Rsh_n_min := Rsh_min * kpr
	Xsh_n_min := Xsh_min * kpr
	Zsh_n_min := math.Sqrt(math.Pow(Rsh_n_min, 2) + math.Pow(Xsh_n_min, 2))
	Ish_n3 := req.Un_n * 1000 / math.Sqrt(3.0) / Zsh_n
	Ish_n2 := Ish_n3 * math.Sqrt(3.0) / 2
	Ish_n_min3 := req.Un_n * 1000 / math.Sqrt(3.0) / Zsh_n_min
	Ish_n_min2 := Ish_n_min3 * math.Sqrt(3.0) / 2

	R_l := req.L_l * req.R_0
	X_l := req.L_l * req.X_0
	R_sum_n := R_l + Rsh_n
	X_sum_n := X_l + Xsh_n
	Z_sum_n := math.Sqrt(math.Pow(R_sum_n, 2) + math.Pow(X_sum_n, 2))
	R_sum_n_min := R_l + Rsh_n_min
	X_sum_n_min := X_l + Xsh_n_min
	Z_sum_n_min := math.Sqrt(math.Pow(R_sum_n_min, 2) + math.Pow(X_sum_n_min, 2))
	I_l_n3 := req.Un_n * 1000 / math.Sqrt(3.0) / Z_sum_n
	I_l_n2 := I_l_n3 * math.Sqrt(3.0) / 2
	I_l_n_min3 := req.Un_n * 1000 / math.Sqrt(3.0) / Z_sum_n_min
	I_l_n_min2 := I_l_n_min3 * math.Sqrt(3.0) / 2

	c.JSON(http.StatusOK, gin.H{
		"Xt": Xt, "Rsh": Rsh, "Xsh": Xsh, "Zsh": Zsh, "Rsh_min": Rsh_min,
		"Xsh_min": Xsh_min, "Zsh_min": Zsh_min, "Ish3": Ish3, "Ish2": Ish2,
		"Ish_min3": Ish_min3, "Ish_min2": Ish_min2, "kpr": kpr, "Rsh_n": Rsh_n,
		"Xsh_n": Xsh_n, "Zsh_n": Zsh_n, "Rsh_n_min": Rsh_n_min, "Xsh_n_min": Xsh_n_min,
		"Zsh_n_min": Zsh_n_min, "Ish_n3": Ish_n3, "Ish_n2": Ish_n2, "Ish_n_min3": Ish_n_min3,
		"Ish_n_min2": Ish_n_min2, "R_l": R_l, "X_l": X_l, "R_sum_n": R_sum_n,
		"X_sum_n": X_sum_n, "Z_sum_n": Z_sum_n, "R_sum_n_min": R_sum_n_min,
		"X_sum_n_min": X_sum_n_min, "Z_sum_n_min": Z_sum_n_min, "I_l_n3": I_l_n3,
		"I_l_n2": I_l_n2, "I_l_n_min3": I_l_n_min3, "I_l_n_min2": I_l_n_min2,
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
	r.POST("/api/calculate3", calculate3)

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Server startup error: %v", err)
	}
}
