"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";

type CalculationResult = {
  mWnedA: number;
  mWnedP: number;
  mZper: number;
};

const inputFields = [
  { name: "omega", label: "Omega" },
  { name: "TV", label: "TV" },
  { name: "PM", label: "PM" },
  { name: "TM", label: "TM" },
  { name: "KP", label: "KP" },
  { name: "ZPerA", label: "ZPerA" },
  { name: "ZPerP", label: "ZPerP" },
];

export default function Calculator2() {
  const [inputValues, setInputValues] = useState<InputValues>(
    inputFields.reduce((acc, { name }) => ({ ...acc, [name]: "" }), {})
  );

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
            <li>mWnedA: {result.mWnedA.toFixed(2)} (кВт*год)</li>
            <li>mWnedP: {result.mWnedP.toFixed(2)} (кВт*год)</li>
            <li>mZper: {result.mZper.toFixed(2)} (грн)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
