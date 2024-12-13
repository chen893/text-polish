'use client';
import { useState } from 'react';
import diff_match_patch from 'diff-match-patch';
import { polishText } from '@/lib/openai';

export function usePolishText() {
  const [isPolishing, setIsPolishing] = useState(false);
  const [diffs, setDiffs] = useState<diff_match_patch.Diff[]>();

  const polish = async (text: string) => {
    try {
      setIsPolishing(true);
      const polishedText = await polishText(text);

      const dmp = new diff_match_patch();
      const computedDiffs = dmp.diff_main(text, polishedText);
      dmp.diff_cleanupSemantic(computedDiffs);

      setDiffs(computedDiffs);
    } catch (error) {
      console.error('Error polishing text:', error);
    } finally {
      setIsPolishing(false);
    }
  };

  return {
    polish,
    isPolishing,
    diffs,
  };
}
