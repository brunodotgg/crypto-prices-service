import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Coin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  circulating_supply: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d?: { price: number[] };
};

type GlobalData = {
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
  };
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

function pct(v?: number | null) {
  if (v === undefined || v === null || Number.isNaN(v)) return "—";
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function tone(v?: number | null) {
  if (v === undefined || v === null || Number.isNaN(v)) return "text-zinc-400";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-red-400";
  return "text-zinc-300";
}

async function getCoins() {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=80&page=1&sparkline=true&price_change_percentage=1h,24h,7d";
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch coins");
  return (await res.json()) as Coin[];
}

async function getGlobal() {
  const res = await fetch("https://api.coingecko.com/api/v3/global", {
    next: { revalidate: 120 },
  });
  if (!res.ok) throw new Error("Failed to fetch global");
  return (await res.json()) as GlobalData;
}

export default async function Home() {
  const [coins, global] = await Promise.all([getCoins(), getGlobal()]);

  const topGainers = [...coins]
    .filter((c) => c.price_change_percentage_24h !== null)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5);

  const topLosers = [...coins]
    .filter((c) => c.price_change_percentage_24h !== null)
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-[#07090d] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 p-3 sm:p-4">
        <header className="rounded-md border border-zinc-800 bg-[#0e1117] p-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-mono text-xs tracking-widest text-zinc-400">BRUCE TERMINAL // CRYPTO</p>
              <h1 className="font-mono text-lg sm:text-xl">MARKET BOARD</h1>
            </div>
            <Badge variant="outline" className="border-zinc-700 font-mono text-xs text-zinc-300">
              80 ASSETS · 60s REFRESH
            </Badge>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <StatCard label="Total Mkt Cap" value={`$${compact.format(global.data.total_market_cap.usd)}`} />
          <StatCard label="24h Volume" value={`$${compact.format(global.data.total_volume.usd)}`} />
          <StatCard
            label="BTC Dominance"
            value={`${(global.data.market_cap_percentage?.btc ?? 0).toFixed(2)}%`}
          />
          <StatCard
            label="Mkt Cap 24h"
            value={pct(global.data.market_cap_change_percentage_24h_usd)}
            className={tone(global.data.market_cap_change_percentage_24h_usd)}
          />
        </section>

        <section className="grid gap-2 lg:grid-cols-2">
          <Card className="border-zinc-800 bg-[#0e1117]">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm text-emerald-400">TOP GAINERS 24H</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 font-mono text-xs">
              {topGainers.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b border-zinc-800/60 py-1">
                  <span>{c.symbol.toUpperCase()}</span>
                  <span className="text-emerald-400">{pct(c.price_change_percentage_24h)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#0e1117]">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm text-red-400">TOP LOSERS 24H</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 font-mono text-xs">
              {topLosers.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b border-zinc-800/60 py-1">
                  <span>{c.symbol.toUpperCase()}</span>
                  <span className="text-red-400">{pct(c.price_change_percentage_24h)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <div className="overflow-hidden rounded-md border border-zinc-800 bg-[#0e1117]">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full min-w-[920px] border-collapse font-mono text-xs">
              <thead className="sticky top-0 z-10 bg-[#111827] text-zinc-300">
                <tr className="border-b border-zinc-700">
                  <th className="px-2 py-2 text-left">#</th>
                  <th className="px-2 py-2 text-left">Asset</th>
                  <th className="px-2 py-2 text-right">Price</th>
                  <th className="px-2 py-2 text-right">1h</th>
                  <th className="px-2 py-2 text-right">24h</th>
                  <th className="px-2 py-2 text-right">7d</th>
                  <th className="px-2 py-2 text-right">Mkt Cap</th>
                  <th className="px-2 py-2 text-right">Vol 24h</th>
                  <th className="px-2 py-2 text-right">Supply</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-800/70 hover:bg-zinc-900/40">
                    <td className="px-2 py-1.5 text-zinc-400">{c.market_cap_rank}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-100">{c.symbol.toUpperCase()}</span>
                        <span className="text-zinc-500">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right text-zinc-100">{usd.format(c.current_price)}</td>
                    <td className={`px-2 py-1.5 text-right ${tone(c.price_change_percentage_1h_in_currency)}`}>
                      {pct(c.price_change_percentage_1h_in_currency)}
                    </td>
                    <td className={`px-2 py-1.5 text-right ${tone(c.price_change_percentage_24h)}`}>
                      <span className="inline-flex items-center gap-1">
                        {c.price_change_percentage_24h > 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {pct(c.price_change_percentage_24h)}
                      </span>
                    </td>
                    <td className={`px-2 py-1.5 text-right ${tone(c.price_change_percentage_7d_in_currency)}`}>
                      {pct(c.price_change_percentage_7d_in_currency)}
                    </td>
                    <td className="px-2 py-1.5 text-right text-zinc-300">${compact.format(c.market_cap)}</td>
                    <td className="px-2 py-1.5 text-right text-zinc-300">${compact.format(c.total_volume)}</td>
                    <td className="px-2 py-1.5 text-right text-zinc-400">{compact.format(c.circulating_supply)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  className = "text-zinc-100",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <Card className="border-zinc-800 bg-[#0e1117]">
      <CardHeader className="pb-1">
        <CardTitle className="font-mono text-[11px] text-zinc-400">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`font-mono text-sm sm:text-base ${className}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
