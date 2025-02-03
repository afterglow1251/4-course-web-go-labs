import { notFound } from "next/navigation";
import Calculator1 from "@/components/calculators/calculator1";
import Calculator2 from "@/components/calculators/calculator2";

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
    case "2":
      return <Calculator2 />;
    default:
      return notFound();
  }
}
