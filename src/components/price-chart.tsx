"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type Point = {
  time: string;
  price: number;
};

const chartConfig = {
  price: {
    label: "Price",
    color: "oklch(0.62 0.2 255)",
  },
} satisfies ChartConfig;

export function PriceChart({ data }: { data: Point[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <defs>
          <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.06} />
          </linearGradient>
        </defs>
        <Area
          dataKey="price"
          type="monotone"
          fill="url(#fillPrice)"
          fillOpacity={1}
          stroke="var(--color-price)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
