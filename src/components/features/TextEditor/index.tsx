'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { usePolishText } from '@/hooks/usePolishText';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Copy, Check, X } from 'lucide-react';
import { SuggestionItem } from './SuggestionItem';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DiffOperation, PolishStyle, PolishTone } from '@/types/text';

export function TextEditor() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  const {
    text,
    setText,
    polish,
    isPolishing,
    isCustomizing,
    diffOperations,
    diffs,
    groupedOperations,
    acceptedOperations,
    rejectedOperations,
    handleAccept,
    handleReject,
    handleAcceptAll,
    handleRejectAll,
    handleCustomize,
    getFinalText,
    isPolishMode,
    setIsPolishMode,
    polishStyle,
    setPolishStyle,
    polishTone,
    setPolishTone,
    resetState,
    highlightedGroupId,
    handleHighlight,
  } = usePolishText();

  const scrollToSuggestion = (index: number) => {
    if (!suggestionsContainerRef.current) return;

    const suggestionElements = suggestionsContainerRef.current.children;
    if (index >= 0 && index < suggestionElements.length) {
      suggestionElements[index].scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      });
    }
  };

  const handlePolish = async () => {
    if (!text.trim()) return;

    resetState();
    setActiveIndex(null);
    await polish(text);
  };

  const handleCopy = async () => {
    const finalText = getFinalText();
    try {
      await navigator.clipboard.writeText(finalText);
      toast.success('已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败，请手动复制');
    }
  };

  // 处理润色模式切换
  const handlePolishModeChange = (checked: boolean) => {
    // resetState();
    setIsPolishMode(checked);
  };

  // 处理风格切换
  const handleStyleChange = (value: string) => {
    // resetState();
    setPolishStyle(value as PolishStyle);
  };

  // 处理语气切换
  const handleToneChange = (value: string) => {
    // resetState();
    setPolishTone(value as PolishTone);
  };

  // 根据当前接受/拒绝状态生成实时的文本差异
  const renderCurrentDiff = () => {
    const renderDiff = diffOperations.length > 0 ? diffOperations : diffs;

    if (!renderDiff) return null;

    return renderDiff.map((diff, index) => {
      const [type, value, id] = Array.isArray(diff)
        ? [...diff, index]
        : [diff.type, diff.text, diff.id];

      if (value.trim().length === 0) return null;

      const isRejected = rejectedOperations.has(id);
      const groupId =
        diffOperations.length > 0
          ? (diff as DiffOperation).replaceId
            ? 'r-' + (diff as DiffOperation).replaceId
            : id.toString()
          : '';
      const isHighlighted = highlightedGroupId === groupId;

      const handleClick = () => {
        if (type === 0 || !groupId) return; // 不处理未修改的文本
        // 找到对应的建议项索引
        const groupIndex = groupedOperations.findIndex((group) => {
          const mainOp = group[0];
          const opGroupId = mainOp.replaceId
            ? 'r-' + mainOp.replaceId
            : mainOp.id.toString();
          return opGroupId === groupId;
        });
        if (groupIndex !== -1) {
          handleHighlight(groupIndex);
          scrollToSuggestion(groupIndex);
        }
      };

      switch (type) {
        case -1: // 删除的文本
          if (isRejected) {
            // 被拒绝的删除操作，直接显示原文本，不添加任何样式
            return <span key={index}>{value}</span>;
          }
          // 被接受的删除操作，显示删除状态
          return (
            <motion.del
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={index}
              onClick={handleClick}
              className={cn(
                'cursor-pointer rounded bg-red-100 px-1 text-red-900 dark:bg-red-900/30 dark:text-red-300',
                isHighlighted && 'ring-2 ring-red-500'
              )}
            >
              {value}
            </motion.del>
          );
        case 1: // 插入的文本
          if (isRejected) {
            // 被拒绝的插入操作，不显示
            return null;
          }
          // 被接受的插入操作，显示新增状态
          return (
            <motion.ins
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={index}
              onClick={handleClick}
              className={cn(
                'cursor-pointer rounded bg-green-100 px-1 text-green-900 no-underline dark:bg-green-900/30 dark:text-green-300',
                isHighlighted && 'ring-2 ring-green-500'
              )}
            >
              {value}
            </motion.ins>
          );
        default: // 未变化的文本
          return <span key={index}>{value}</span>;
      }
    });
  };

  return (
    <div className={cn('container mx-auto min-h-screen px-4 py-6', 'lg:px-6')}>
      <div
        className={cn(
          'grid gap-6',
          diffOperations.length > 0 ? 'lg:grid-cols-[1fr,320px]' : 'grid-cols-1'
        )}
      >
        <div className="space-y-6">
          <Card className="bg-white/80 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl dark:bg-gray-950/80 lg:p-6">
            <div className="mb-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="polish-mode" className="text-base">
                  润色模式
                </Label>
                <Switch
                  id="polish-mode"
                  checked={isPolishMode}
                  onCheckedChange={handlePolishModeChange}
                />
              </div>

              {isPolishMode && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>文本风格</Label>
                    <Select
                      value={polishStyle}
                      onValueChange={handleStyleChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择文本风格" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="简单">简单</SelectItem>
                        <SelectItem value="商业">商业</SelectItem>
                        <SelectItem value="学术">学术</SelectItem>
                        <SelectItem value="非正式">非正式</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>语气</Label>
                    <Select value={polishTone} onValueChange={handleToneChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择语气" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="热情">热情</SelectItem>
                        <SelectItem value="亲切">亲切</SelectItem>
                        <SelectItem value="自信">自信</SelectItem>
                        <SelectItem value="外交">外交</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <Textarea
              placeholder="请输入需要校对的文本..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mb-4 min-h-[200px] resize-none bg-transparent text-base transition-all duration-200 focus:shadow-inner lg:min-h-[250px]"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                字数：{text.length}
                {text.length > 2000 && (
                  <span className="text-red-500">
                    （体验版，字数限制2000字）
                  </span>
                )}
              </div>
              <Button
                onClick={handlePolish}
                disabled={isPolishing || !text.trim() || text.length > 2000}
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
                    开始{isPolishMode ? '润色' : '校对'}
                  </>
                )}
              </Button>
            </div>
          </Card>

          <AnimatePresence>
            {diffs && diffs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-950/80 lg:p-6">
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="flex items-center text-lg font-semibold">
                        <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                        润色结果
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 sm:flex-none"
                          onClick={handleCopy}
                        >
                          <Copy className="h-4 w-4" />
                          复制润色文本
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCustomize}
                          disabled={
                            isPolishing || isCustomizing || !text.trim()
                          }
                          className="group relative flex-1 sm:flex-none"
                        >
                          {isCustomizing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              处理中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                              自定义修改
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert">
                        {getFinalText()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-base font-medium text-muted-foreground">
                        文本对比
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        红色表示删除，绿色表示新增
                      </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed dark:prose-invert">
                        {renderCurrentDiff()}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {diffOperations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Card className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-950/80">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold">
                    修改建议 (
                    {diffOperations.filter((op) => op.type !== 0).length})
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 sm:flex-none"
                      onClick={handleAcceptAll}
                    >
                      <Check className="h-3 w-3" />
                      全部接受
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 sm:flex-none"
                      onClick={handleRejectAll}
                    >
                      <X className="h-3 w-3" />
                      全部拒绝
                    </Button>
                  </div>
                </div>
                <div className="space-y-4" ref={suggestionsContainerRef}>
                  {groupedOperations.map((group, index) => {
                    const mainOp = group[0];
                    const isAccepted = group.every((op: DiffOperation) =>
                      acceptedOperations.has(op.id)
                    );
                    const isRejected = group.every((op: DiffOperation) =>
                      rejectedOperations.has(op.id)
                    );
                    const groupId = mainOp.replaceId
                      ? 'r-' + mainOp.replaceId
                      : mainOp.id.toString();
                    const isHighlighted = highlightedGroupId === groupId;

                    return (
                      <SuggestionItem
                        key={mainOp.replaceId ?? mainOp.id}
                        operations={group}
                        isActive={activeIndex === index}
                        isAccepted={isAccepted}
                        isRejected={isRejected}
                        onAccept={() => handleAccept(index)}
                        onReject={() => handleReject(index)}
                        onClick={() => {
                          setActiveIndex(index);
                          handleHighlight(index);
                          scrollToSuggestion(index);
                        }}
                        isHighlighted={isHighlighted}
                      />
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toaster />
    </div>
  );
}
