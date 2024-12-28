import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Operation {
  id: number;
  type: number; // -1: 删除, 0: 保持不变, 1: 插入
  text: string;
  reason: string;
  replaceId?: number;
}

interface SuggestionItemProps {
  operations: Operation[];
  isActive: boolean;
  isAccepted?: boolean;
  isRejected?: boolean;
  onAccept: () => void;
  onReject: () => void;
  onClick: () => void;
  isHighlighted?: boolean;
}

export function SuggestionItem({
  operations,
  isActive,
  isAccepted = false,
  isRejected = false,
  onAccept,
  onReject,
  onClick,
  isHighlighted = false,
}: SuggestionItemProps) {
  const mainOperation = operations[0];
  const isReplaceOperation = operations.length > 1;

  const getOperationTypeText = () => {
    if (isReplaceOperation) {
      return '替换';
    }

    switch (mainOperation.type) {
      case 1:
        return '插入';
      case -1:
        return '删除';
      default:
        return '无变化';
    }
  };

  const getOriginalText = () => {
    return operations
      .filter((op) => op.type === -1)
      .map((op) => op.text)
      .join('');
  };

  const getNewText = () => {
    return operations
      .filter((op) => op.type === 1)
      .map((op) => op.text)
      .join('');
  };

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded-lg border p-3 transition-all hover:bg-accent lg:p-4',
        isActive && 'bg-accent',
        isAccepted && 'border-green-500/50',
        isRejected && 'border-red-500/50',
        isHighlighted && 'ring-2 ring-primary'
      )}
      onClick={onClick}
      data-group-id={
        operations[0].replaceId
          ? 'r-' + operations[0].replaceId
          : operations[0].id.toString()
      }
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {getOperationTypeText()}
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
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              'h-8 flex-1 sm:w-8 sm:flex-none sm:p-0',
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
            <span className="ml-2 sm:hidden">接受</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              'h-8 flex-1 sm:w-8 sm:flex-none sm:p-0',
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
            <span className="ml-2 sm:hidden">拒绝</span>
          </Button>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        {(isReplaceOperation || mainOperation.type === -1) && (
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
            <span className="shrink-0 font-medium">原文：</span>
            <span className="break-all text-muted-foreground">
              {getOriginalText()}
            </span>
          </div>
        )}
        {(isReplaceOperation || mainOperation.type === 1) && (
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
            <span className="shrink-0 font-medium">建议：</span>
            <span
              className={cn(
                'break-all',
                isAccepted
                  ? 'text-green-500'
                  : isRejected
                    ? 'text-red-500/50 line-through'
                    : 'text-green-500'
              )}
            >
              {getNewText()}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
          <span className="shrink-0 font-medium">原因：</span>
          <span className="break-all text-muted-foreground">
            {mainOperation.reason}
          </span>
        </div>
      </div>
    </div>
  );
}
