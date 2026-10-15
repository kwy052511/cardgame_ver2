'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/gameLogic';
import { PlayerRank } from '@/lib/sheetService';
import { Timer, Footprints, RotateCcw, Home, Trophy, Medal } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  playerName: string;
  moves: number;
  elapsedTime: number;
  rankings: PlayerRank[];
  isLoadingRankings?: boolean;
  onRestart: () => void;
  onGoHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  playerName,
  moves,
  elapsedTime,
  rankings,
  isLoadingRankings = false,
  onRestart,
  onGoHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      const duration = 2 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm p-6 overflow-hidden bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/10 text-center animate-in zoom-in-95 duration-300">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          {playerName ? `${playerName}님 완료!` : '게임 완료!'}
        </h2>

        {/* 내 기록 통계 (시간, 시도 횟수) */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white/60 dark:border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">
              <Timer className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>종료시간</span>
            </div>
            <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
              {formatTime(elapsedTime)}
            </span>
          </div>

          <div className="p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white/60 dark:border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">
              <Footprints className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>시도 횟수</span>
            </div>
            <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
              {moves}회
            </span>
          </div>
        </div>

        {/* 명예의 전당 (종료시간 오름차순 TOP 3 랭킹) */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>명예의 전당 (TOP 3)</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
              빠른 시간순
            </span>
          </div>

          {isLoadingRankings ? (
            <div className="py-3 text-center text-xs text-slate-400 animate-pulse">
              랭킹 불러오는 중...
            </div>
          ) : rankings.length > 0 ? (
            <div className="space-y-1.5">
              {rankings.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-white/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        item.rank === 1
                          ? 'bg-amber-400 text-amber-950'
                          : item.rank === 2
                          ? 'bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100'
                          : 'bg-amber-700/70 text-amber-100'
                      }`}
                    >
                      {item.rank}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {item.finishtime}
                    </span>
                    <span className="text-slate-400 text-[10px]">({item.score}회)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2 text-center text-xs text-slate-400">
              기록된 랭킹이 없습니다.
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={onRestart}
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            다시 하기
          </Button>

          <Button
            onClick={onGoHome}
            variant="outline"
            className="w-full h-10 rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm"
          >
            <Home className="w-3.5 h-3.5 mr-1.5" />
            처음으로
          </Button>
        </div>
      </div>
    </div>
  );
};
