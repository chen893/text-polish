'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { OperationType } from '@/types/text';
import { usePolishText } from '@/hooks/usePolishText';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Copy, Check, X } from 'lucide-react';
import { SuggestionItem } from './SuggestionItem';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

export function TextEditor() {
  const [text, setText] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [acceptedOperations, setAcceptedOperations] = useState<Set<number>>(
    new Set()
  );
  const [rejectedOperations, setRejectedOperations] = useState<Set<number>>(
    new Set()
  );
  const { polish, isPolishing, operations } = usePolishText();

  // 过滤掉无变化的操作
  const validOperations = operations.filter(
    (op) => op.type !== OperationType.NoChange
  );

  const handlePolish = async () => {
    if (!text.trim()) return;
    await polish(text);
    setActiveIndex(null);
    setAcceptedOperations(new Set());
    setRejectedOperations(new Set());
  };

  const handleAccept = (index: number) => {
    setAcceptedOperations((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    setRejectedOperations((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const handleReject = (index: number) => {
    setRejectedOperations((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    setAcceptedOperations((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const handleAcceptAll = () => {
    const newAccepted = new Set(validOperations.map((_, index) => index));
    setAcceptedOperations(newAccepted);
    setRejectedOperations(new Set());
  };

  const handleRejectAll = () => {
    const newRejected = new Set(validOperations.map((_, index) => index));
    setRejectedOperations(newRejected);
    setAcceptedOperations(new Set());
  };

  const getFinalText = useCallback(() => {
    if (!validOperations.length) return text;

    let result = '';

    operations.forEach((operation) => {
      if (operation.type === OperationType.NoChange) {
        result += operation.original;
      } else {
        const validIndex = validOperations.findIndex(
          (op) => op.from === operation.from && op.to === operation.to
        );

        if (validIndex !== -1 && acceptedOperations.has(validIndex)) {
          result += operation.text;
        } else {
          result += operation.original;
        }
      }
    });

    return result;
  }, [text, operations, validOperations, acceptedOperations]);

  const handleCopy = async () => {
    const finalText = getFinalText();
    try {
      await navigator.clipboard.writeText(finalText);
      toast.success('已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败，请手动复制');
    }
  };

  const renderTextWithHighlights = () => {
    if (!validOperations.length) return text;

    const result: (string | JSX.Element)[] = [];
    // const currentIndex = 0;

    operations.forEach((operation, index) => {
      // 如果是无变化的操作，直接显示原文
      if (operation.type === OperationType.NoChange) {
        result.push(operation.original);
      } else {
        // 找到当前操作在 validOperations 中的索引
        const validIndex = validOperations.findIndex(
          (op) => op.from === operation.from && op.to === operation.to
        );

        if (validIndex !== -1) {
          const isAccepted = acceptedOperations.has(validIndex);
          const isRejected = rejectedOperations.has(validIndex);
          const isActive = activeIndex === validIndex;

          result.push(
            <span
              key={`${index}-${operation.from}-${operation.to}`}
              className={cn(
                'cursor-pointer rounded px-1',
                isActive && 'bg-yellow-200 dark:bg-yellow-900',
                isAccepted && 'bg-green-100 dark:bg-green-900/30',
                isRejected && 'bg-red-100 dark:bg-red-900/30',
                !isAccepted && !isRejected && 'bg-blue-100 dark:bg-blue-900/30'
              )}
              onClick={() => setActiveIndex(validIndex)}
            >
              {isAccepted ? operation.text : operation.original}
            </span>
          );
        } else {
          result.push(operation.original);
        }
      }
    });

    return result;
  };

  return (
    <div className="grid grid-cols-[1fr,300px] gap-6">
      <div className="space-y-6">
        <Card className="bg-white/80 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl dark:bg-gray-950/80">
          <Textarea
            placeholder="请输入需要校对的文本..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mb-4 min-h-[200px] resize-none bg-transparent text-base transition-all duration-200 focus:shadow-inner"
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              字数：{text.length}
            </div>
            <Button
              onClick={handlePolish}
              disabled={isPolishing || !text.trim()}
              className="group relative"
            >
              {isPolishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  校对中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  开始校对
                </>
              )}
            </Button>
          </div>
        </Card>

        <AnimatePresence>
          {validOperations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 p-6 shadow-lg backdrop-blur-md dark:bg-gray-950/80">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center text-lg font-semibold">
                    <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                    校对结果
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                    复制结果
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {renderTextWithHighlights()}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {validOperations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-950/80">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  修改建议 ({validOperations.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={handleAcceptAll}
                  >
                    <Check className="h-3 w-3" />
                    全部接受
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={handleRejectAll}
                  >
                    <X className="h-3 w-3" />
                    全部拒绝
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {validOperations.map((operation, index) => (
                  <SuggestionItem
                    key={index}
                    operation={operation}
                    isActive={activeIndex === index}
                    isAccepted={acceptedOperations.has(index)}
                    isRejected={rejectedOperations.has(index)}
                    onAccept={() => handleAccept(index)}
                    onReject={() => handleReject(index)}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </div>
  );
}
