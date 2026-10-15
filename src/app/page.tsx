'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CardItem, generateInitialCards, formatTime } from '@/lib/gameLogic';
import { GameHUD } from '@/components/game/GameHUD';
import { GameBoard } from '@/components/game/GameBoard';
import { VictoryModal } from '@/components/game/VictoryModal';
import { IntroScreen } from '@/components/game/IntroScreen';
import { saveGameRecordToSheet, PlayerRank } from '@/lib/sheetService';

const TOTAL_PAIRS = 8;

export default function Home() {
  // 화면 단계: 'intro' (이름 작성) | 'playing' (게임 진행)
  const [screen, setScreen] = useState<'intro' | 'playing'>('intro');
  const [playerName, setPlayerName] = useState<string>('');

  // 게임 보드 상태
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [shakingIndices, setShakingIndices] = useState<number[]>([]);

  // 타이머 및 결과 상태
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [rankings, setRankings] = useState<PlayerRank[]>([]);
  const [isLoadingRankings, setIsLoadingRankings] = useState<boolean>(false);

  // 불일치 시 원복 타이머 ref 및 중복 저장 방지 ref
  const mismatchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSavedRef = useRef<boolean>(false);

  // 게임 초기화
  const resetGame = useCallback(() => {
    if (mismatchTimeoutRef.current) {
      clearTimeout(mismatchTimeoutRef.current);
    }
    hasSavedRef.current = false; // 새로운 게임 시작 시 저장 플래그 리셋
    setCards(generateInitialCards());
    setFlippedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsLocked(false);
    setShakingIndices([]);
    setElapsedTime(0);
    setIsTimerRunning(false);
    setIsVictory(false);
    setRankings([]);
    setIsLoadingRankings(false);
  }, []);

  // 게임 시작 (이름 입력 완료 시)
  const handleStartGame = (name: string) => {
    setPlayerName(name);
    resetGame();
    setScreen('playing');
  };

  // '처음으로' 버튼 (이름 입력 화면으로 복귀)
  const handleGoHome = useCallback(() => {
    if (mismatchTimeoutRef.current) {
      clearTimeout(mismatchTimeoutRef.current);
    }
    setIsTimerRunning(false);
    setIsVictory(false);
    setScreen('intro');
  }, []);

  // 타이머 인터벌
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && !isVictory && screen === 'playing') {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isVictory, screen]);

  // 카드 클릭 핸들러
  const handleCardClick = (clickedIndex: number) => {
    if (isLocked || flippedIndices.length >= 2) return;
    const clickedCard = cards[clickedIndex];
    if (clickedCard.isFlipped || clickedCard.isMatched) return;

    // 첫 조작 시 타이머 자동 시작
    if (!isTimerRunning && matchedPairs < TOTAL_PAIRS) {
      setIsTimerRunning(true);
    }

    // 카드 앞면 뒤집기
    const newCards = [...cards];
    newCards[clickedIndex] = { ...clickedCard, isFlipped: true };
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, clickedIndex];
    setFlippedIndices(newFlippedIndices);

    // 2장이 뒤집혔을 때 매칭 판정
    if (newFlippedIndices.length === 2) {
      setMoves((prev) => prev + 1);
      setIsLocked(true);

      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = newCards[firstIndex];
      const secondCard = newCards[secondIndex];

      if (firstCard.pairId === secondCard.pairId) {
        // 일치: 완료 처리
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c, idx) =>
              idx === firstIndex || idx === secondIndex
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setFlippedIndices([]);
          setIsLocked(false);

          setMatchedPairs((prevMatched) => {
            const nextMatched = prevMatched + 1;
            if (nextMatched === TOTAL_PAIRS) {
              setIsTimerRunning(false);
              setIsVictory(true);

              // 중복 저장 방지: 한 판의 게임에서 딱 1번만 구글 시트에 전송 후 최신 TOP 3 랭킹 수신
              if (!hasSavedRef.current) {
                hasSavedRef.current = true;
                setIsLoadingRankings(true);
                saveGameRecordToSheet({
                  name: playerName || '익명',
                  score: moves + 1,
                  finishtime: formatTime(elapsedTime),
                }).then((top3) => {
                  setRankings(top3);
                  setIsLoadingRankings(false);
                });
              }
            }
            return nextMatched;
          });
        }, 300);
      } else {
        // 불일치: 0.7초 후 셰이크 애니메이션과 함께 원복
        mismatchTimeoutRef.current = setTimeout(() => {
          setShakingIndices([firstIndex, secondIndex]);

          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((c, idx) =>
                idx === firstIndex || idx === secondIndex
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setShakingIndices([]);
            setFlippedIndices([]);
            setIsLocked(false);
          }, 380);
        }, 700);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-3 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 selection:bg-indigo-100">
      {/* 배경 은은한 빛 효과 (글래스모피즘 분위기 강조) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/20 dark:bg-indigo-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-300/20 dark:bg-purple-600/10 blur-[100px]" />
      </div>

      {/* 중앙 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto py-2">
        {screen === 'intro' ? (
          <IntroScreen
            onStartGame={handleStartGame}
            initialName={playerName}
          />
        ) : (
          <div className="w-full max-w-[420px] sm:max-w-[440px] flex flex-col items-center animate-in fade-in duration-300">
            {/* 상단 HUD (이름, 처음으로, 타이머, 시도 횟수, 다크모드) */}
            <GameHUD
              playerName={playerName}
              moves={moves}
              elapsedTime={elapsedTime}
              matchedPairs={matchedPairs}
              totalPairs={TOTAL_PAIRS}
              onRestart={resetGame}
              onGoHome={handleGoHome}
            />

            {/* 4x4 게임 보드 (글래스 카드 디자인) */}
            <GameBoard
              cards={cards}
              onCardClick={handleCardClick}
              isLocked={isLocked}
              shakingIndices={shakingIndices}
            />
          </div>
        )}
      </div>

      {/* 메인 페이지 하단 Footer */}
      <footer className="w-full text-center py-3 text-xs text-slate-400 dark:text-slate-500 font-normal border-t border-slate-200/50 dark:border-slate-800/50 mt-4">
        Copyright INU 카드 맞추기 게임 by Wooyoung Kwon
      </footer>

      {/* 승리 모달 */}
      <VictoryModal
        isOpen={isVictory}
        playerName={playerName}
        moves={moves}
        elapsedTime={elapsedTime}
        rankings={rankings}
        isLoadingRankings={isLoadingRankings}
        onRestart={resetGame}
        onGoHome={handleGoHome}
      />
    </div>
  );
}
