import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type MonthlyRevenueProps = {
  monthly: { month: string; revenue: number }[];
};

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#013DC0",
  },
} satisfies ChartConfig;

export function MonthlyRevenueComponent({ monthly }: MonthlyRevenueProps) {
  return (
    <Card className=" h-96 overflow-hidden">
      <CardTitle className="text-[#013DC0] ml-10 mt-4 font-semibold text-lg mb-2">Revenue</CardTitle>
      <CardContent className="mt-2">
        <ChartContainer config={chartConfig}>
          <div style={{ width: '650px', height: '305px' }}>
            <BarChart data={monthly} width={650} height={305}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)} // Shorten month names
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default MonthlyRevenueComponent;
