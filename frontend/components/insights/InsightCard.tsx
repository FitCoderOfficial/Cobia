import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, ArrowUpRight, ArrowDownRight, Plus, Minus } from 'lucide-react';

export type InsightType = 'transfer' | 'value_change' | 'new_token' | 'warning';

interface InsightCardProps {
  type: InsightType;
  tokenSymbol: string;
  description: string;
  timestamp: Date;
  isNew?: boolean;
}

const getInsightIcon = (type: InsightType) => {
  switch (type) {
    case 'transfer':
      return <ArrowUpRight className="h-5 w-5" />;
    case 'value_change':
      return <ArrowDownRight className="h-5 w-5" />;
    case 'new_token':
      return <Plus className="h-5 w-5" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5" />;
    default:
      return null;
  }
};

const getInsightColor = (type: InsightType) => {
  switch (type) {
    case 'transfer':
      return 'bg-blue-100 text-blue-800';
    case 'value_change':
      return 'bg-green-100 text-green-800';
    case 'new_token':
      return 'bg-purple-100 text-purple-800';
    case 'warning':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function InsightCard({ type, tokenSymbol, description, timestamp, isNew = false }: InsightCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${getInsightColor(type)}`}>
            {getInsightIcon(type)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900">{tokenSymbol}</h3>
              {isNew && (
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                  New
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
} 
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, ArrowUpRight, ArrowDownRight, Plus, Minus } from 'lucide-react';

export type InsightType = 'transfer' | 'value_change' | 'new_token' | 'warning';

interface InsightCardProps {
  type: InsightType;
  tokenSymbol: string;
  description: string;
  timestamp: Date;
  isNew?: boolean;
}

const getInsightIcon = (type: InsightType) => {
  switch (type) {
    case 'transfer':
      return <ArrowUpRight className="h-5 w-5" />;
    case 'value_change':
      return <ArrowDownRight className="h-5 w-5" />;
    case 'new_token':
      return <Plus className="h-5 w-5" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5" />;
    default:
      return null;
  }
};

const getInsightColor = (type: InsightType) => {
  switch (type) {
    case 'transfer':
      return 'bg-blue-100 text-blue-800';
    case 'value_change':
      return 'bg-green-100 text-green-800';
    case 'new_token':
      return 'bg-purple-100 text-purple-800';
    case 'warning':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function InsightCard({ type, tokenSymbol, description, timestamp, isNew = false }: InsightCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${getInsightColor(type)}`}>
            {getInsightIcon(type)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900">{tokenSymbol}</h3>
              {isNew && (
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                  New
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
} 
 