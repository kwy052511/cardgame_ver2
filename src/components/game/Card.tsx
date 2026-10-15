'use client';

import React from 'react';
import { CardItem } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface CardProps {
  card: CardItem;
  onClick: () => void;
  disabled: boolean;
  isShaking?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, disabled, isShaking }) => {
  const isRevealed = card.isFlipped || card.isMatched;

  return (
    <div
      className={cn(
        'relative aspect-square w-full select-none perspective-1000 cursor-pointer group',
        (disabled || card.isMatched) && 'cursor-default pointer-events-none',
        isShaking && 'animate-shake'
      )}
      onClick={() => {
        if (!disabled && !isRevealed) {
          onClick();
        }
      }}
      role="button"
      tabIndex={isRevealed || disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isRevealed) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={isRevealed ? `카드 ${card.emoji}` : '뒤집히지 않은 카드'}
    >
      <div
        className={cn(
          'w-full h-full duration-500 transform-style-3d transition-transform rounded-xl sm:rounded-2xl',
          isRevealed ? 'rotate-y-180' : ''
        )}
      >
        {/* 뒷면: 프로스티드 글래스모피즘 */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full backface-hidden rounded-xl sm:rounded-2xl',
            'flex items-center justify-center',
            'bg-white/40 dark:bg-slate-800/40 backdrop-blur-md',
            'border border-white/60 dark:border-white/10',
            'shadow-[0_4px_16px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgb(0,0,0,0.25)]',
            'hover:bg-white/55 dark:hover:bg-slate-800/60 hover:border-white/80 dark:hover:border-white/20',
            'transition-all duration-300'
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-400/15 dark:via-purple-400/5 border border-white/40 dark:border-white/10">
            <span className="text-base sm:text-lg md:text-xl font-bold text-indigo-500/80 dark:text-indigo-300">
              ?
            </span>
          </div>
        </div>

        {/* 앞면: 심플한 과일 아이콘 표시 */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl sm:rounded-2xl',
            'flex items-center justify-center',
            'backdrop-blur-md transition-colors duration-300',
            card.isMatched
              ? 'bg-emerald-500/15 dark:bg-emerald-500/20 border-2 border-emerald-400/70 dark:border-emerald-500/50 shadow-[0_2px_12px_rgba(16,185,129,0.15)]'
              : 'bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/15 shadow-[0_4px_16px_rgb(0,0,0,0.04)]'
          )}
        >
          <span
            className={cn(
              'text-2xl sm:text-3xl md:text-4xl lg:text-5xl transition-transform duration-200 select-none',
              card.isMatched ? 'scale-110' : ''
            )}
          >
            {card.emoji}
          </span>
        </div>
      </div>
    </div>
  );
};
