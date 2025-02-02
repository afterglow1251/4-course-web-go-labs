import { notFound } from "next/navigation";
import Calculator1 from "@/components/calculators/calculator1";

export type CalculatorParams = {
  params: {
    calculatorId: string;
  };
};

export default async function Calculator({ params }: CalculatorParams) {
  const { calculatorId } = await params;

  switch (calculatorId) {
    case "1":
      return <Calculator1 />;
    default:
      return notFound();
  }
}
