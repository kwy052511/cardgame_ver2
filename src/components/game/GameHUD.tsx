'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/gameLogic';
import { RotateCcw, Home } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface GameHUDProps {
  playerName: string;
  moves: number;
  elapsedTime: number;
  matchedPairs: number;
  totalPairs: number;
  onRestart: () => void;
  onGoHome: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  playerName,
  moves,
  elapsedTime,
  matchedPairs,
  totalPairs,
  onRestart,
  onGoHome,
}) => {
  return (
    <header className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/60 dark:border-white/10 mb-3 sm:mb-4 transition-all">
      {/* 상단 액션 바 */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px] sm:max-w-[200px]">
          {playerName || '플레이어'}
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            onClick={onGoHome}
            variant="outline"
            size="sm"
            className="h-8 px-2.5 rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs shadow-none"
          >
            <Home className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">처음으로</span>
          </Button>

          <Button
            onClick={onRestart}
            variant="outline"
            size="sm"
            className="h-8 px-2.5 rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs shadow-none"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">다시 시작</span>
          </Button>

          <ThemeToggle />
        </div>
      </div>

      {/* 수치 정보 (시간 / 시도 / 진행) */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="py-1 px-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/5">
          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">시간</div>
          <div className="text-sm sm:text-base font-bold font-mono text-slate-800 dark:text-slate-100">
            {formatTime(elapsedTime)}
          </div>
        </div>

        <div className="py-1 px-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/5">
          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">시도</div>
          <div className="text-sm sm:text-base font-bold font-mono text-slate-800 dark:text-slate-100">
            {moves}
          </div>
        </div>

        <div className="py-1 px-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/5">
          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">진행</div>
          <div className="text-sm sm:text-base font-bold font-mono text-slate-800 dark:text-slate-100">
            {matchedPairs}/{totalPairs}
          </div>
        </div>
      </div>
    </header>
  );
};
