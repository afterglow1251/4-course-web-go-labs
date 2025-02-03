"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";

type CalculationResult = {
  wOc: number;
  tVOc: number;
  kAOc: number;
  kPOs: number;
  wDk: number;
  wDs: number;
};

const inputFields = [
  { name: "ПЛ-110 кВ", label: "ПЛ-110 кВ" },
  { name: "ПЛ-35 кВ", label: "ПЛ-35 кВ" },
  { name: "ПЛ-10 кВ", label: "ПЛ-10 кВ" },
  { name: "КЛ-10 кВ (траншея)", label: "КЛ-10 кВ (траншея)" },
  { name: "КЛ-10 кВ (кабельний канал)", label: "КЛ-10 кВ (кабельний канал)" },
  { name: "T-110 кВ", label: "T-110 кВ" },
  { name: "T-35 кВ", label: "T-35 кВ" },
  {
    name: "T-10 кВ (кабельна мережа 10 кВ)",
    label: "T-10 кВ (кабельна мережа 10 кВ)",
  },
  {
    name: "T-10 кВ (повітряна мережа 10 кВ)",
    label: "T-10 кВ (повітряна мережа 10 кВ)",
  },
  { name: "B-110 кВ (елегазовий)", label: "B-110 кВ (елегазовий)" },
  { name: "B-10 кВ (малооливний)", label: "B-10 кВ (малооливний)" },
  { name: "B-10 кВ (вакуумний)", label: "B-10 кВ (вакуумний)" },
  {
    name: "Збірні шини 10 кВ на 1 приєднання",
    label: "Збірні шини 10 кВ на 1 приєднання",
  },
  { name: "АВ-0,38 кВ", label: "АВ-0,38 кВ" },
  { name: "ЕД 6,10 кВ", label: "ЕД 6,10 кВ" },
  { name: "ЕД 0,38 кВ", label: "ЕД 0,38 кВ" },
];

export default function Calculator1() {
  const [inputValues, setInputValues] = useState<InputValues>(
    inputFields.reduce((acc, { name }) => ({ ...acc, [name]: "" }), {})
  );

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (Object.values(inputValues).some((value) => value.trim() === "")) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    setError(null);

    const amounts = Object.keys(inputValues).reduce((acc, key) => {
      const value = parseInt(inputValues[key]);
      if (!isNaN(value) && value > 0) {
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: number });

    try {
      const response = await axios.post("/api/calculate1", { amounts });
      setResult(response.data);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || "Помилка на сервері."
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
              placeholder="Введіть значення"
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
            <li>Wос: {result.wOc.toFixed(5)} (рік^(-1))</li>
            <li>tв.ос: {result.tVOc.toFixed(5)} (год)</li>
            <li>kа.ос: {result.kAOc.toFixed(5)}</li>
            <li>kп.ос: {result.kPOs.toFixed(5)}</li>
            <li>Wдк: {result.wDk.toFixed(5)} (рік^(-1))</li>
            <li>Wдс: {result.wDs.toFixed(5)} (рік^(-1))</li>
          </ul>
        </div>
      )}
    </div>
  );
}
