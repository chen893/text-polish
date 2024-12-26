'use client';

import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="fixed right-0 top-0 z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-md transition-all hover:scale-110 hover:bg-white dark:bg-gray-950/80 dark:hover:bg-gray-950"
          asChild
        >
          <a
            href="https://github.com/chen893/text-polish"
            target="_blank"
            rel="noopener noreferrer"
            title="访问 GitHub 仓库"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub 仓库</span>
          </a>
        </Button>
      </motion.div>
    </header>
  );
}
