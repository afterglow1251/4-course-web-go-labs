"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";

type CalculationResult = {
  Xt: number;
  Rsh: number;
  Xsh: number;
  Zsh: number;
  Rsh_min: number;
  Xsh_min: number;
  Zsh_min: number;
  Ish3: number;
  Ish2: number;
  Ish_min3: number;
  Ish_min2: number;
  kpr: number;
  Rsh_n: number;
  Xsh_n: number;
  Zsh_n: number;
  Rsh_n_min: number;
  Xsh_n_min: number;
  Zsh_n_min: number;
  Ish_n3: number;
  Ish_n2: number;
  Ish_n_min3: number;
  Ish_n_min2: number;
  R_l: number;
  X_l: number;
  R_sum_n: number;
  X_sum_n: number;
  Z_sum_n: number;
  R_sum_n_min: number;
  X_sum_n_min: number;
  Z_sum_n_min: number;
  I_l_n3: number;
  I_l_n2: number;
  I_l_n_min3: number;
  I_l_n_min2: number;
};

const inputFields = [
  { name: "Uk_max", label: "Uk_max (кВ)" },
  { name: "Uv_n", label: "Uv_n (кВ)" },
  { name: "Un_n", label: "Un_n (кВ)" },
  { name: "Snom_t", label: "Snom_t (МВ*А)" },
  { name: "Rc_n", label: "Rc_n (Ом)" },
  { name: "Rc_min", label: "Rc_min (Ом)" },
  { name: "Xc_n", label: "Xc_n (Ом)" },
  { name: "Xc_min", label: "Xc_min (Ом)" },
  { name: "L_l", label: "L_l (км)" },
  { name: "R_0", label: "R_0 (Ом)" },
  { name: "X_0", label: "X_0 (Ом)" },
];

export default function Calculator3() {
  const [inputValues, setInputValues] = useState<InputValues>({
    Uk_max: "",
    Uv_n: "",
    Un_n: "",
    Snom_t: "",
    Rc_n: "",
    Rc_min: "",
    Xc_n: "",
    Xc_min: "",
    L_l: "",
    R_0: "",
    X_0: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prev: any) => ({
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
      const response = await axios.post("/api/calculate3", numericValues);
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
              autoComplete="on"
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
            <li>Xт: {result.Xt.toFixed(2)} (Ом)</li>
            <li>Rш: {result.Rsh.toFixed(2)} (Ом)</li>
            <li>Xш: {result.Xsh.toFixed(2)} (Ом)</li>
            <li>Zщ: {result.Zsh.toFixed(2)} (Ом)</li>
            <li>Rщ_min: {result.Rsh_min.toFixed(2)} (Ом)</li>
            <li>Xш_min: {result.Xsh_min.toFixed(2)} (Ом)</li>
            <li>Zш_min: {result.Zsh_min.toFixed(2)} (Ом)</li>
            <li>I3ш: {result.Ish3.toFixed(2)} (А)</li>
            <li>I2ш: {result.Ish2.toFixed(2)} (А)</li>
            <li>I3ш_min: {result.Ish_min3.toFixed(2)} (А)</li>
            <li>I2ш_min: {result.Ish_min2.toFixed(2)} (А)</li>
            <li>kпр: {result.kpr.toFixed(2)}</li>
            <li>Rшн: {result.Rsh_n.toFixed(2)} (Ом)</li>
            <li>Xшн: {result.Xsh_n.toFixed(2)} (Ом)</li>
            <li>Zшн: {result.Zsh_n.toFixed(2)} (Ом)</li>
            <li>Rшн_min: {result.Rsh_n_min.toFixed(2)} (Ом)</li>
            <li>Xшн_min: {result.Xsh_n_min.toFixed(2)} (Ом)</li>
            <li>Zшн_min: {result.Zsh_n_min.toFixed(2)} (Ом)</li>
            <li>I3шн: {result.Ish_n3.toFixed(2)} (А)</li>
            <li>I2шн: {result.Ish_n2.toFixed(2)} (А)</li>
            <li>I3шн_min: {result.Ish_n_min3.toFixed(2)} (А)</li>
            <li>I2шн_min: {result.Ish_n_min2.toFixed(2)} (А)</li>
            <li>Rл: {result.R_l.toFixed(2)} (Ом)</li>
            <li>Xл: {result.X_l.toFixed(2)} (Ом)</li>
            <li>RΣн: {result.R_sum_n.toFixed(2)} (Ом)</li>
            <li>XΣн: {result.X_sum_n.toFixed(2)} (Ом)</li>
            <li>ZΣн: {result.Z_sum_n.toFixed(2)} (Ом)</li>
            <li>RΣн_min: {result.R_sum_n_min.toFixed(2)} (Ом)</li>
            <li>XΣн_min: {result.X_sum_n_min.toFixed(2)} (Ом)</li>
            <li>ZΣн_min: {result.Z_sum_n_min.toFixed(2)} (Ом)</li>
            <li>I3лн: {result.I_l_n3.toFixed(2)} (А)</li>
            <li>I2лн: {result.I_l_n2.toFixed(2)} (А)</li>
            <li>I3лн_min: {result.I_l_n_min3.toFixed(2)} (А)</li>
            <li>I2лн_min: {result.I_l_n_min2.toFixed(2)} (А)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
