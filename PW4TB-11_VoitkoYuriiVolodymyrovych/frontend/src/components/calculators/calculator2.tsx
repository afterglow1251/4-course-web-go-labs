"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";

type CalculationResult = {
  Xc: number;
  Xt: number;
  XSum: number;
  Ip0: number;
};

const inputFields = [
  { name: "Ucn", label: "Ucn (кВ)" },
  { name: "Sk", label: "Sk (МВ*А)" },
  { name: "UkPerc", label: "Uk_perc (кВ)" },
  { name: "SNomT", label: "S_nom_t (МВ*А)" },
];

export default function Calculator2() {
  const [inputValues, setInputValues] = useState<InputValues>({
    Ucn: "",
    Sk: "",
    UkPerc: "",
    SNomT: "",
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
      const response = await axios.post("/api/calculate2", numericValues);
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
              placeholder="введіть значення"
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
          <ul>
            <li>Xс: {result.Xc.toFixed(2)} (Ом)</li>
            <li>Xт: {result.Xt.toFixed(2)} (Ом)</li>
            <li>XΣ: {result.XSum.toFixed(2)} (Ом)</li>
            <li>Iп0: {result.Ip0.toFixed(2)} (кА)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
