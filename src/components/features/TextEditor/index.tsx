'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import diff_match_patch from 'diff-match-patch';
import { usePolishText } from '@/hooks/usePolishText';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export function TextEditor() {
  const [text, setText] = useState('');
  const { polish, isPolishing, diffs } = usePolishText();

  const handlePolish = async () => {
    if (!text.trim()) return;
    await polish(text);
  };

  const renderDiff = (diffs: diff_match_patch.Diff[]) => {
    return diffs.map((diff, index) => {
      const [type, value] = diff;
      switch (type) {
        case -1:
          return (
            <motion.del
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={index}
              className="rounded bg-red-100 px-1 text-red-900 dark:bg-red-900/30 dark:text-red-300"
            >
              {value}
            </motion.del>
          );
        case 1:
          return (
            <motion.ins
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={index}
              className="rounded bg-green-100 px-1 text-green-900 no-underline dark:bg-green-900/30 dark:text-green-300"
            >
              {value}
            </motion.ins>
          );
        case 0:
        default:
          return <span key={index}>{value}</span>;
      }
    });
  };

  return (
    <div className="m-auto w-full max-w-4xl space-y-6">
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
        {diffs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 p-6 shadow-lg backdrop-blur-md dark:bg-gray-950/80">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                校对结果
              </h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {renderDiff(diffs)}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
