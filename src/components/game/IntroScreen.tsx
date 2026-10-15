'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EMOJI_LIST } from '@/lib/gameLogic';

interface IntroScreenProps {
  onStartGame: (name: string) => void;
  initialName?: string;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onStartGame,
  initialName = '',
}) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('이름을 입력해 주세요.');
      return;
    }
    setError('');
    onStartGame(trimmed);
  };

  return (
    <div className="w-full max-w-sm mx-auto my-auto animate-in fade-in duration-300">
      <div className="relative pt-10 pb-7 px-6 sm:pt-12 sm:pb-8 sm:px-8 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/60 dark:border-white/10 text-center">
        {/* 상단 테마 토글 버튼 */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
          <ThemeToggle />
        </div>

        {/* 메인 화면 심플한 과일 이모지 모음 (게임 카드와 동일한 8종) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 mt-2 sm:mt-1">
          {EMOJI_LIST.map((emoji, index) => (
            <span
              key={index}
              className="text-xl sm:text-2xl transform transition-transform duration-200 hover:scale-125 select-none"
              title="게임 과일"
            >
              {emoji}
            </span>
          ))}
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-6">
          카드 맞추기 게임
        </h1>

        {/* 이름 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              maxLength={12}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm font-medium backdrop-blur-sm"
              autoFocus
            />
            {error && (
              <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5 ml-1 font-medium">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all text-sm"
          >
            <Play className="w-4 h-4 mr-1.5 fill-current" />
            게임 시작
          </Button>
        </form>
      </div>
    </div>
  );
};
