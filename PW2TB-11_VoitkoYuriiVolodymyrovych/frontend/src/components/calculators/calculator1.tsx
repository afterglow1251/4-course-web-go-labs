"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";

type CalculationResult = {
  emissionIndex: number;
  grossEmission: number;
};

const inputFields = [
  { name: "Q_i_r", label: "Q_i_r" },
  { name: "a_vun", label: "a_vun" },
  { name: "A_r", label: "A_r" },
  { name: "G_vun", label: "G_vun" },
  { name: "eta_z_y", label: "eta_z_y" },
  { name: "k_tv_s", label: "k_tv_s" },
  { name: "B", label: "B" },
];

export default function Calculator1() {
  const [inputValues, setInputValues] = useState<InputValues>({
    Q_i_r: "",
    a_vun: "",
    A_r: "",
    G_vun: "",
    eta_z_y: "",
    k_tv_s: "",
    B: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (Object.values(inputValues).some((val) => val === "")) {
      setError("Будь ласка, заповніть всі поля коректно.");
      return;
    }

    setError(null);

    const numericValues = Object.fromEntries(
      Object.entries(inputValues).map(([key, value]) => [
        key,
        parseFloat(value),
      ])
    );

    try {
      const response = await axios.post("/api/calculate1", numericValues);
      setResult(response.data);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || "Сталася помилка на сервері."
        : "Невідома помилка.";
      setError(errorMessage);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto pt-20">
      <div className="space-y-4">
        {inputFields.map((field) => (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              placeholder={"введіть значення"}
              value={inputValues[field.name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        {error && <div className="text-red-600">{error}</div>}
      </div>

      <Button onClick={handleSubmit} className="mt-4">
        Обчислити
      </Button>

      {result && (
        <div className="mt-6">
          <div>
            <h4 className="mt-2">Склад робочої маси мазуту:</h4>
            <ul>
              <li>Індекс викидів: {result.emissionIndex.toFixed(2)} г/ГДж</li>
              <li>Валовий викид: {result.grossEmission.toFixed(2)} т</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
