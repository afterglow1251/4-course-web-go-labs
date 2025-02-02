"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";

type CalculationResult = {
  revenue: number;
  fine: number;
  profit: number;
};

const inputFields = [
  { name: "Pc", label: "Середньодобова потужність (МВт)" },
  { name: "Sigma", label: "Середньоквадратичне відхилення (МВт)" },
  { name: "B", label: "Вартість електроенергії (грн/кВт*год)" },
];

export default function Calculator1() {
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({
    Pc: "",
    Sigma: "",
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
      console.log(response.data);
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
            <ul>
              <li>Дохід: {result.revenue.toFixed(1)} тис. грн</li>
              <li>Штраф: {result.fine.toFixed(1)} тис. грн</li>
              <li>
                Прибуток{result.profit < 0 ? " (збиток)" : ""}:{" "}
                {result.profit.toFixed(1)} тис. грн
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
