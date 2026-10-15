'use client';

import React from 'react';
import { CardItem } from '@/lib/gameLogic';
import { Card } from './Card';

interface GameBoardProps {
  cards: CardItem[];
  onCardClick: (index: number) => void;
  isLocked: boolean;
  shakingIndices: number[];
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  onCardClick,
  isLocked,
  shakingIndices,
}) => {
  return (
    <main className="w-full aspect-square p-2.5 sm:p-3.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/60 dark:border-white/10 transition-all flex items-center justify-center">
      <div className="grid grid-cols-4 grid-rows-4 gap-2 sm:gap-3 w-full h-full">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            onClick={() => onCardClick(index)}
            disabled={isLocked || card.isMatched || card.isFlipped}
            isShaking={shakingIndices.includes(index)}
          />
        ))}
      </div>
    </main>
  );
};
