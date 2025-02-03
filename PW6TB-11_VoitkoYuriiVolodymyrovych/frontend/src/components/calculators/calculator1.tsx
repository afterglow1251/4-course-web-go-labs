"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { equipmentListData } from "./data/equipment";

type Equipment = {
  name: string;
  efficiency: string;
  powerFactor: string;
  voltage: string;
  quantity: string;
  nominalPower: string;
  usageCoefficient: string;
  reactivePowerFactor: string;
};

type EquipmentCalculationResponse = {
  groupUtilizationCoefficient: number;
  effectiveEquipmentCount: number;
  totalActivePowerDept: number;
  totalReactivePowerDept: number;
  totalApparentPowerDept: number;
  totalCurrentDept: number;
  totalDeptUtilizationCoef: number;
  effectiveEquipmentDeptAmount: number;
  totalActivePowerDept1: number;
  totalReactivePowerDept1: number;
  totalApparentPowerDept1: number;
  totalCurrentDept1: number;
};

export default function Calculator1() {
  const [equipmentList, setEquipmentList] =
    useState<Equipment[]>(equipmentListData);

  const [kr, setKr] = useState<string>("");
  const [kr2, setKr2] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EquipmentCalculationResponse | null>(
    null
  );

  const validateFields = () => {
    const isFieldsValid = equipmentList.every((equipment) =>
      Object.values(equipment).every((value) => value !== "")
    );

    return isFieldsValid && kr && kr2;
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      setError("Будь ласка, заповніть всі поля коректно.");
      return;
    }

    setError(null);

    try {
      const data = {
        equipmentList: equipmentList.map((equipment) => ({
          name: equipment.name,
          efficiency: parseFloat(equipment.efficiency),
          powerFactor: parseFloat(equipment.powerFactor),
          voltage: parseFloat(equipment.voltage),
          quantity: parseFloat(equipment.quantity),
          nominalPower: parseFloat(equipment.nominalPower),
          usageCoefficient: parseFloat(equipment.usageCoefficient),
          reactivePowerFactor: parseFloat(equipment.reactivePowerFactor),
        })),
        kr: parseFloat(kr),
        kr2: parseFloat(kr2),
      };

      const response = await axios.post("/api/calculate1", data);

      setResults(response.data);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || "Сталася помилка на сервері."
        : "Невідома помилка.";
      setError(errorMessage);
    }
  };

  return (
    <div className="p-8 mx-auto pt-20">
      <Button
        onClick={() =>
          setEquipmentList([
            ...equipmentList,
            {
              name: "",
              efficiency: "",
              powerFactor: "",
              voltage: "",
              quantity: "",
              nominalPower: "",
              usageCoefficient: "",
              reactivePowerFactor: "",
            },
          ])
        }
      >
        Додати ЕП
      </Button>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipmentList.map((equipment, index) => (
          <div
            key={index}
            className="space-y-4 p-4 border rounded-lg shadow-md"
          >
            <div>
              <Label>Найменування ЕП</Label>
              <Input
                type="text"
                value={equipment.name}
                onChange={(e) => {
                  const updatedList = [...equipmentList];
                  updatedList[index] = {
                    ...updatedList[index],
                    name: e.target.value,
                  };
                  setEquipmentList(updatedList);
                }}
                placeholder="введіть значення"
                className="w-full"
              />
            </div>

            <div>
              <Label>Номінальне значення ККД (ηн)</Label>
              <Input
                type="number"
                value={equipment.efficiency}
                onChange={(e) => {
                  const updatedList = [...equipmentList];
                  updatedList[index] = {
                    ...updatedList[index],
                    efficiency: e.target.value,
                  };
                  setEquipmentList(updatedList);
                }}
                placeholder="введіть значення"
                className="w-full"
              />
            </div>

            <div>
              <Label>Коефіцієнт потужності навантаження (cos φ)</Label>
              <Input
                type="number"
                value={equipment.powerFactor}
                onChange={(e) => {
                  const updatedList = [...equipmentList];
                  updatedList[index] = {
                    ...updatedList[index],
                    powerFactor: e.target.value,
                  };
                  setEquipmentList(updatedList);
                }}
                placeholder="введіть значення"
                className="w-full"
              />
            </div>

            <div>
              <Label>Напруга навантаження (Uн, кВ)</Label>
              <Input
                type="number"
                value={equipment.voltage}
                onChange={(e) => {
                  const updatedList = [...equipmentList];
                  updatedList[index] = {
                    ...updatedList[index],
                    voltage: e.target.value,
                  };
                  setEquipmentList(updatedList);
                }}
                placeholder="введіть значення"
                className="w-full"
              />
            </div>

            <div>
              <Label>Кількість ЕП (n, шт)</Label>
              <Input
                type="number"
                value={equipment.quantity}
                onChange={(e) => {
                  const updatedList = [...equipmentList];
                  updatedList[index] = {
                    ...updatedList[index],
                    quantity: e.target.value,
                  };
                  setEquipmentList(updatedList);
                }}
                placeholder="введіть значення"
                className="w-full"
              />
            </div>

            <div>
              <Label>Номінальна потужність ЕП (Рн, кВт)</Label>
              <Input
                type="number"
                value={equipment.nominalPower}
                onChange={(e) => {
                  const updatedList = [...equipmentList];
                  updatedList[index] = {
                    ...updatedList[index],
                    nominalPower: e.target.value,
                  };
                  setEquipmentList(updatedList);
                }}
                placeholder="введіть значення"
                className="w-full"
              />
            </div>

            <div>
              <Label>Коефіцієнт використання (КВ)</Label>
              <Input
                type="number"
                value={equipment.usageCoefficient}
                onChange={(e) => {
                  const updatedList = [...equipmentList];
                  updatedList[index] = {
                    ...updatedList[index],
                    usageCoefficient: e.target.value,
                  };
                  setEquipmentList(updatedList);
                }}
                placeholder="введіть значення"
                className="w-full"
              />
            </div>

            <div>
              <Label>Коефіцієнт реактивної потужності (tg φ)</Label>
              <Input
                type="number"
                value={equipment.reactivePowerFactor}
                onChange={(e) => {
                  const updatedList = [...equipmentList];
                  updatedList[index] = {
                    ...updatedList[index],
                    reactivePowerFactor: e.target.value,
                  };
                  setEquipmentList(updatedList);
                }}
                placeholder="введіть значення"
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Label>Розрахунковий коеф. активної потужності (Kr)</Label>
        <Input
          type="number"
          value={kr}
          onChange={(e) => setKr(e.target.value)}
          placeholder="введіть значення"
          className="w-full"
        />
      </div>

      <div className="mt-4">
        <Label>Розрахунковий коеф. активної потужності (Kr2)</Label>
        <Input
          type="number"
          value={kr2}
          onChange={(e) => setKr2(e.target.value)}
          placeholder="введіть значення"
          className="w-full"
        />
      </div>

      <div className="mt-6">
        <Button onClick={handleSubmit}>Обчислити</Button>
      </div>

      <div className="mt-4">
        {error && <div className="text-red-600">{error}</div>}
      </div>

      <div className="mt-6">
        {results && (
          <ul>
            <li>
              Груповий коефіцієнт використання:{" "}
              {results.groupUtilizationCoefficient.toFixed(5)}
            </li>
            <li>
              Ефективна кількість ЕП:{" "}
              {results.effectiveEquipmentCount.toFixed(5)}
            </li>
            <li>
              Розрахункове активне навантаження:{" "}
              {results.totalActivePowerDept.toFixed(5)} (кВт)
            </li>
            <li>
              Розрахункове реактивне навантаження:{" "}
              {results.totalReactivePowerDept.toFixed(5)} (квар)
            </li>
            <li>
              Повна потужність: {results.totalApparentPowerDept.toFixed(5)}{" "}
              (кВ*А)
            </li>
            <li>
              Розрахунковий груповий струм ШР1:{" "}
              {results.totalCurrentDept.toFixed(5)} (А)
            </li>
            <li>
              Коефіцієнт використання цеху в цілому:{" "}
              {results.totalDeptUtilizationCoef.toFixed(5)}
            </li>
            <li>
              Ефективна кількість ЕП цеху в цілому:{" "}
              {results.effectiveEquipmentDeptAmount.toFixed(5)}
            </li>
            <li>
              Розрахункове активне навантаження на шинах 0,38 кВ:{" "}
              {results.totalActivePowerDept1.toFixed(5)} (кВт)
            </li>
            <li>
              Розрахункове реактивне навантаження на шинах 0,38 кВ:{" "}
              {results.totalReactivePowerDept1.toFixed(5)} (квар)
            </li>
            <li>
              Повна потужність на шинах 0,38 кВ:{" "}
              {results.totalApparentPowerDept1.toFixed(5)} (кв*А)
            </li>
            <li>
              Розрахунковий груповий струм на шинах 0,38 кВ:{" "}
              {results.totalCurrentDept1.toFixed(5)} (А)
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
