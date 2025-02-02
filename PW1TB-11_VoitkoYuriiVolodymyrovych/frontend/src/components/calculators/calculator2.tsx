"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";

type CalculationResult = {
  composition: {
    CP: number;
    HP: number;
    SP: number;
    OP: number;
    AP: number;
    VP: number;
  };
  qR: number;
};

const inputFields = [
  { name: "h", label: "Водень (H)%" },
  { name: "c", label: "Вуглець (C)%" },
  { name: "s", label: "Сірка (S)%" },
  { name: "o", label: "Кисень (O)%" },
  { name: "w", label: "Волога (W)%" },
  { name: "a", label: "Зола (A)%" },
  { name: "v", label: "Ванадій (V) мг/кг" },
  { name: "qfo", label: "Q мазуту (Q Fuel oil) МДж/кг" },
];

export default function Calculator2() {
  const [inputValues, setInputValues] = useState<InputValues>({
    h: "",
    c: "",
    s: "",
    o: "",
    w: "",
    a: "",
    v: "",
    qfo: "",
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
              <li>CP: {result.composition.CP.toFixed(2)}%</li>
              <li>HP: {result.composition.HP.toFixed(2)}%</li>
              <li>SP: {result.composition.SP.toFixed(2)}%</li>
              <li>OP: {result.composition.OP.toFixed(2)}%</li>
              <li>AP: {result.composition.AP.toFixed(2)}%</li>
              <li>VP: {result.composition.VP.toFixed(2)}%</li>
            </ul>

            <ul className="mt-2">
              <li>Нижча теплота згоряння: {result.qR.toFixed(2)} МДж/кг</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
