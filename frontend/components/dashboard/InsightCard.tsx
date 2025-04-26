import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  title: string;
  value: string | number;
  description?: string;
  status?: "success" | "warning" | "error" | "info";
  className?: string;
}

export function InsightCard({
  title,
  value,
  description,
  status,
  className,
}: InsightCardProps) {
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      case "info":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "success":
        return "성공";
      case "warning":
        return "주의";
      case "error":
        return "위험";
      case "info":
        return "정보";
      default:
        return "";
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') {
      // SHIB나 다른 토큰 단위가 있는 경우
      const match = val.match(/^([\d,]+)\s*(.+)$/);
      if (match) {
        const [_, numPart, unit] = match;
        // 이미 포맷된 숫자는 다시 포맷하지 않음
        if (!numPart.includes(',')) {
          const formatted = new Intl.NumberFormat('ko-KR').format(Number(numPart));
          return `${formatted} ${unit}`;
        }
      }
    }
    return val;
  };

  return (
    <Card className={cn("w-full h-[220px] flex flex-col", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0">
        <CardTitle className="text-base font-semibold leading-tight max-w-[75%]">{title}</CardTitle>
        {status && (
          <Badge 
            variant={getStatusVariant(status)} 
            className={cn(
              "text-sm font-medium px-2.5 py-0.5 shrink-0 ml-2",
              status === "info" && "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            {getStatusLabel(status)}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pb-6">
        <div>
          <div className="text-2xl font-bold mb-3 break-words">
            {formatValue(value)}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground break-words line-clamp-2 leading-normal">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 