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
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {status && (
          <Badge variant={getStatusVariant(status)} className="text-xs">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
} 