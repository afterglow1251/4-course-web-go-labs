"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import axios from "axios";

type CalculationResult = {
  Im: number;
  Im_pa: number;
  Sek: number;
  Smin: number;
};

const inputFields = [
  { name: "Unom", label: "Unom (кВ)" },
  { name: "Sm", label: "Sm (кВ*А)" },
  { name: "Ik", label: "Ik (кА)" },
  { name: "P_TP", label: "P_TP (кВ*А)" },
  { name: "Tf", label: "Tf (с)" },
  { name: "Tm", label: "Tm (год)" },
  { name: "Ct", label: "Cт" },
];

const conductorMaterialOptions = {
  Мідь: 0,
  Алюміній: 1,
};

const conductorTypeOptions = {
  "Неізольовані проводи та шини": 0,
  "Кабелі з паперовою і проводи з гумовою та полівінілхлоридною ізоляцією з жилами": 1,
  "Кабелі з гумовою та пластмасовою ізоляцією з жилами": 2,
};

export default function Calculator1() {
  const [inputValues, setInputValues] = useState<InputValues>({
    Unom: "",
    Sm: "",
    Ik: "",
    P_TP: "",
    Tf: "",
    Tm: "",
    Ct: "",
  });

  const [conductorMaterial, setConductorMaterial] = useState<string>("");
  const [conductorType, setConductorType] = useState<string>("");

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

    const numericConductorMaterial =
      conductorMaterialOptions[
        conductorMaterial as keyof typeof conductorMaterialOptions
      ];
    const numericConductorType =
      conductorTypeOptions[conductorType as keyof typeof conductorTypeOptions];

    try {
      const response = await axios.post("/api/calculate1", {
        ...numericValues,
        ConductorMaterial: numericConductorMaterial,
        ConductorType: numericConductorType,
      });

      setResult(response.data);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || "Сталася помилка на сервері."
        : "Невідома помилка.";
      setError(errorMessage);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto pt-20">
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

        <div>
          <Label htmlFor="conductorType">Тип провідника</Label>
          <Select value={conductorType} onValueChange={setConductorType}>
            <SelectTrigger>
              <div>{conductorType || "Виберіть тип провідника"}</div>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(conductorTypeOptions).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="conductorMaterial">Матеріал провідника</Label>
          <Select
            value={conductorMaterial}
            onValueChange={setConductorMaterial}
          >
            <SelectTrigger>
              <div>{conductorMaterial || "Виберіть матеріал провідника"}</div>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(conductorMaterialOptions).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            <li>Iм: {result.Im.toFixed(2)} (А)</li>
            <li>Iм.па: {result.Im_pa.toFixed(2)} (А)</li>
            <li>Sек: {result.Sek.toFixed(2)} (мм²)</li>
            <li>Smin: {result.Smin.toFixed(2)} (мм²)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
