import { useEffect, useState } from "react";
import { Portfolio } from "@/types/portfolio";
import { PortfolioAPI } from "@/lib/api/portfolio";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { formatCurrency } from "@/lib/utils";

interface PortfolioSummaryProps {
  address: string;
}

export function PortfolioSummary({ address }: PortfolioSummaryProps) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setLoading(true);
        setError(null);
        const data = await PortfolioAPI.getPortfolio(address);
        setPortfolio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
    // 5분마다 데이터 갱신
    const interval = setInterval(fetchPortfolio, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [address]);

  if (loading) {
    return <div>Loading portfolio data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!portfolio) {
    return null;
  }

  const { totalValue, totalProfitLoss, profitLossPercentage, tokens } = portfolio;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InsightCard
        title="총 포트폴리오 가치"
        value={formatCurrency(totalValue, "USD")}
        description="모든 보유 자산의 현재 평가 금액"
        status="info"
      />
      
      <InsightCard
        title="총 수익/손실"
        value={formatCurrency(totalProfitLoss, "USD")}
        description={`전체 수익률: ${profitLossPercentage.toFixed(2)}%`}
        status={totalProfitLoss >= 0 ? "success" : "error"}
      />

      {tokens.map((token, index) => (
        <InsightCard
          key={token.symbol}
          title={`${token.symbol} 보유량`}
          value={`${token.amount.toFixed(4)} ${token.symbol}`}
          description={`현재가: ${formatCurrency(token.price, "USD")} (24h: ${token.priceChange24h?.toFixed(2)}%)`}
          status={token.priceChange24h && token.priceChange24h >= 0 ? "success" : "error"}
        />
      ))}
    </div>
  );
} 