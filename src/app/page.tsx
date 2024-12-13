'use client';

import { TextEditor } from '@/components/features/TextEditor';
import { motion } from 'framer-motion';
// import './globals.css'
export default function Home() {
  return (
    <div className="container relative mx-auto px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-purple-50 opacity-50 dark:from-blue-950/20 dark:to-purple-950/20" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center space-y-8"
      >
        <div className="mb-8 space-y-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400 md:text-5xl"
          >
            智能文本校对助手
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground dark:text-gray-400"
          >
            基于 AI 的智能文本校对和优化工具，帮助您提升写作质量
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full backdrop-blur-sm"
        >
          <TextEditor />
        </motion.div>
      </motion.div>
    </div>
  );
}
