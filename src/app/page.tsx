import { TrendingDown, TrendingUp } from "lucide-react";

import { PriceChart } from "@/components/price-chart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
};

type ChartPoint = {
  time: string;
  price: number;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

async function getMarketData() {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,chainlink,sui&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h";

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to load market data");
  return (await res.json()) as MarketCoin[];
}

async function getBtcChart(): Promise<ChartPoint[]> {
  const url =
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily";

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error("Failed to load BTC chart");

  const json = (await res.json()) as { prices: [number, number][] };
  return json.prices.map(([ts, price]) => ({
    time: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: Number(price.toFixed(2)),
  }));
}

export default async function Home() {
  const [coins, btcChart] = await Promise.all([getMarketData(), getBtcChart()]);
  const btc = coins.find((c) => c.id === "bitcoin");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 bg-background px-4 py-6 sm:max-w-2xl sm:px-6 lg:max-w-5xl">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Crypto Pulse</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Mobile-first crypto dashboard with real-time market snapshots.
        </p>
      </header>

      {btc && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>Bitcoin · 7D trend</CardDescription>
            <div className="flex items-end justify-between gap-3">
              <CardTitle className="text-2xl sm:text-3xl">{currency.format(btc.current_price)}</CardTitle>
              <Badge variant={btc.price_change_percentage_24h >= 0 ? "default" : "destructive"}>
                {btc.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="mr-1 h-3.5 w-3.5" />
                )}
                {btc.price_change_percentage_24h.toFixed(2)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <PriceChart data={btcChart} />
          </CardContent>
        </Card>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coins.map((coin) => {
          const up = coin.price_change_percentage_24h >= 0;
          return (
            <Card key={coin.id} className="transition-colors hover:bg-muted/40">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between">
                  <span className="uppercase">{coin.symbol}</span>
                  <span>#{coin.market_cap_rank}</span>
                </CardDescription>
                <CardTitle className="text-xl">{coin.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-lg font-medium">{currency.format(coin.current_price)}</p>
                <Badge variant={up ? "default" : "destructive"}>
                  {up ? (
                    <TrendingUp className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="mr-1 h-3.5 w-3.5" />
                  )}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
