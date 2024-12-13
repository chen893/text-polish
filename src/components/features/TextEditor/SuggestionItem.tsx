import { Operation, OperationType } from '@/types/text';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionItemProps {
  operation: Operation;
  isActive: boolean;
  isAccepted?: boolean;
  isRejected?: boolean;
  onAccept: () => void;
  onReject: () => void;
  onClick: () => void;
}

export function SuggestionItem({
  operation,
  isActive,
  isAccepted = false,
  isRejected = false,
  onAccept,
  onReject,
  onClick,
}: SuggestionItemProps) {
  const getOperationTypeText = (type: OperationType) => {
    switch (type) {
      case OperationType.Insert:
        return '插入';
      case OperationType.Delete:
        return '删除';
      case OperationType.Replace:
        return '替换';
      default:
        return '无变化';
    }
  };

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded-lg border p-4 transition-all hover:bg-accent',
        isActive && 'bg-accent',
        isAccepted && 'border-green-500/50',
        isRejected && 'border-red-500/50'
      )}
      onClick={onClick}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            {getOperationTypeText(operation.type)}
          </span>
          {(isAccepted || isRejected) && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                isAccepted &&
                  'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
                isRejected &&
                  'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isAccepted && 'bg-green-500',
                  isRejected && 'bg-red-500'
                )}
              />
              {isAccepted ? '已接受' : '已拒绝'}
            </span>
          )}
        </div>
        <div className="space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              'h-8 w-8 p-0',
              isAccepted
                ? 'bg-green-500/20 text-green-500'
                : 'hover:bg-green-500/20 hover:text-green-500'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              'h-8 w-8 p-0',
              isRejected
                ? 'bg-red-500/20 text-red-500'
                : 'hover:bg-red-500/20 hover:text-red-500'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">原文：</span>
          <span className="text-muted-foreground">{operation.original}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium">建议：</span>
          <span
            className={cn(
              isAccepted
                ? 'text-green-500'
                : isRejected
                  ? 'text-red-500/50 line-through'
                  : 'text-green-500'
            )}
          >
            {operation.text}
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium">原因：</span>
          <span className="text-muted-foreground">{operation.reason}</span>
        </div>
      </div>
    </div>
  );
}
