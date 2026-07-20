import { PlannerClient } from "./PlannerClient";

export default async function PlannerPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  return <PlannerClient key={date ?? "today"} initialDate={date} />;
}
