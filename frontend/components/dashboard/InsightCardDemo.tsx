import { InsightCard } from "./InsightCard";

export function InsightCardDemo() {
  const mockInsights = [
    {
      title: "이더리움 잔액 변동",
      value: "+2.5 ETH",
      description: "지난 24시간 동안 지갑 잔액이 크게 증가했습니다",
      status: "success",
    },
    {
      title: "대규모 거래 감지",
      value: "500,000 USDT",
      description: "모니터링 중인 지갑에서 비정상적인 거래량이 감지되었습니다",
      status: "warning",
    },
    {
      title: "가스비 급등",
      value: "150 Gwei",
      description: "네트워크 수수료가 평소보다 매우 높습니다",
      status: "error",
    },
    {
      title: "신규 토큰 추가",
      value: "PEPE",
      description: "관심 지갑에서 새로운 토큰이 감지되었습니다",
      status: "info",
    },
    {
      title: "포트폴리오 가치 하락",
      value: "₩1,543,678,900",
      description: "여러 연결된 지갑에서 총 자산 가치가 크게 감소했습니다. 시장 전반적인 하락세...",
      status: "error",
    },
    {
      title: "토큰 소각 발생",
      value: "1,234,567,890,123 SHIB",
      description: "대규모 토큰 소각이 감지되었습니다",
      status: "warning",
    },
  ];

  return (
    <>
      {mockInsights.map((insight, index) => (
        <InsightCard
          key={index}
          title={insight.title}
          value={insight.value}
          description={insight.description}
          status={insight.status}
        />
      ))}
    </>
  );
} 