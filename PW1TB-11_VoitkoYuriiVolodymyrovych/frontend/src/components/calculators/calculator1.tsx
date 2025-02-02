"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";

type CalculationResult = {
  krs: number;
  krg: number;
  dryMassComposition: {
    hp: number;
    cp: number;
    sp: number;
    np: number;
    op: number;
    ap: number;
  };
  combustibleMassComposition: {
    hp: number;
    cp: number;
    sp: number;
    np: number;
    op: number;
  };
  qph: number;
  qch: number;
  qgh: number;
};

const inputFields = [
  { name: "hp", label: "Водень (H)%" },
  { name: "cp", label: "Вуглець (C)%" },
  { name: "sp", label: "Сірка (S)%" },
  { name: "np", label: "Азот (N)%" },
  { name: "op", label: "Кисень (O)%" },
  { name: "wp", label: "Волога (W)%" },
  { name: "ap", label: "Зола (A)%" },
];

export default function Calculator1() {
  const [inputValues, setInputValues] = useState<InputValues>({
    hp: "",
    cp: "",
    sp: "",
    np: "",
    op: "",
    wp: "",
    ap: "",
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

  const calculate = async () => {
    if (Object.values(inputValues).some((val) => val === "")) {
      setError("Будь ласка, заповніть всі поля коректно.");
      return;
    }

    const numericValues = Object.fromEntries(
      Object.entries(inputValues).map(([key, value]) => [
        key,
        parseFloat(value),
      ])
    );

    const totalSum = Object.values(numericValues).reduce(
      (acc, val) => acc + val,
      0
    );

    if (totalSum !== 100) {
      setError("Сума всіх компонентів повинна складати 100%");
      return;
    }

    setError(null);

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

      <Button onClick={calculate} className="mt-4">
        Обчислити
      </Button>

      {result && (
        <div className="mt-6">
          <div>
            <ul>
              <li>
                Коефіцієнт переходу від робочої до сухої маси:{" "}
                {result.krs.toFixed(2)}
              </li>
              <li>
                Коефіцієнт переходу від робочої до горючої маси:{" "}
                {result.krg.toFixed(2)}
              </li>
            </ul>

            <h4 className="mt-2">Склад сухої маси палива:</h4>
            <ul>
              <li>HC: {result.dryMassComposition.hp.toFixed(2)}%</li>
              <li>CC: {result.dryMassComposition.cp.toFixed(2)}%</li>
              <li>SC: {result.dryMassComposition.sp.toFixed(2)}%</li>
              <li>NC: {result.dryMassComposition.np.toFixed(2)}%</li>
              <li>OC: {result.dryMassComposition.op.toFixed(2)}%</li>
              <li>AC: {result.dryMassComposition.ap.toFixed(2)}%</li>
            </ul>

            <h4 className="mt-2">Склад горючої маси палива:</h4>
            <ul>
              <li>HГ: {result.combustibleMassComposition.hp.toFixed(2)}%</li>
              <li>CГ: {result.combustibleMassComposition.cp.toFixed(2)}%</li>
              <li>SГ: {result.combustibleMassComposition.sp.toFixed(2)}%</li>
              <li>NГ: {result.combustibleMassComposition.np.toFixed(2)}%</li>
              <li>OГ: {result.combustibleMassComposition.op.toFixed(2)}%</li>
            </ul>

            <ul className="mt-2">
              <li>
                Нижча теплота згоряння для робочої маси: {result.qph.toFixed(2)}{" "}
                МДж/кг
              </li>
              <li>
                Нижча теплота згоряння для сухої маси: {result.qch.toFixed(2)}{" "}
                МДж/кг
              </li>
              <li>
                Нижча теплота згоряння для горючої маси: {result.qgh.toFixed(2)}{" "}
                МДж/кг
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
