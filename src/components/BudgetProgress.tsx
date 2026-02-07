import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { formatARS } from '@/lib/format';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { BudgetStatus } from '@/hooks/useBudgets';

interface BudgetProgressProps {
  category: string;
  spent: number;
  limit: number;
  showLabel?: boolean;
  compact?: boolean;
}

const statusConfig: Record<BudgetStatus, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  safe: {
    color: 'bg-emerald-500',
    icon: CheckCircle,
  },
  warning: {
    color: 'bg-amber-500',
    icon: AlertTriangle,
  },
  danger: {
    color: 'bg-destructive',
    icon: AlertCircle,
  },
};

export const BudgetProgress = ({ 
  category, 
  spent, 
  limit, 
  showLabel = true,
  compact = false 
}: BudgetProgressProps) => {
  const { t } = useLanguage();
  
  const { percentage, status, remaining, isExceeded } = useMemo(() => {
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    const rem = limit - spent;
    
    let stat: BudgetStatus = 'safe';
    if (pct >= 90) stat = 'danger';
    else if (pct >= 70) stat = 'warning';
    
    return {
      percentage: Math.min(pct, 100),
      status: stat,
      remaining: rem,
      isExceeded: rem < 0,
    };
  }, [spent, limit]);

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const content = (
    <div className={cn("w-full", compact ? "space-y-1" : "space-y-2")}>
      {showLabel && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn(
              "font-medium truncate",
              compact ? "text-xs" : "text-sm"
            )}>
              {category}
            </span>
            {(status === 'warning' || status === 'danger') && (
              <StatusIcon className={cn(
                status === 'warning' ? 'text-amber-500' : 'text-destructive',
                compact ? 'h-3 w-3' : 'h-4 w-4'
              )} />
            )}
          </div>
          <span className={cn(
            "text-muted-foreground tabular-nums whitespace-nowrap",
            compact ? "text-xs" : "text-sm"
          )}>
            {formatARS(spent)} / {formatARS(limit)}
          </span>
        </div>
      )}
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className={cn(
            "bg-secondary",
            compact ? "h-2" : "h-3"
          )}
        />
        <div 
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-300",
            config.color
          )}
          style={{ 
            width: `${percentage}%`,
            height: '100%',
          }}
        />
      </div>
      
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-muted-foreground",
            compact ? "text-[10px]" : "text-xs"
          )}>
            {Math.round(percentage)}%
          </span>
          <span className={cn(
            "tabular-nums",
            compact ? "text-[10px]" : "text-xs",
            isExceeded ? "text-destructive font-medium" : "text-muted-foreground"
          )}>
            {isExceeded 
              ? `${t('budget.exceeded')}: ${formatARS(Math.abs(remaining))}`
              : `${t('budget.remaining')}: ${formatARS(remaining)}`
            }
          </span>
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-default">{content}</div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{category}</p>
            <p>{formatARS(spent)} / {formatARS(limit)}</p>
            <p className={isExceeded ? "text-destructive" : ""}>
              {isExceeded 
                ? `${t('budget.exceeded')}: ${formatARS(Math.abs(remaining))}`
                : `${t('budget.remaining')}: ${formatARS(remaining)}`
              }
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

export default BudgetProgress;
