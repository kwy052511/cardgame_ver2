export interface CardItem {
  id: string;
  emoji: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export const EMOJI_LIST = [
  '🍎', // 사과
  '🍌', // 바나나
  '🍇', // 포도
  '🍓', // 딸기
  '🍉', // 수박
  '🍒', // 체리
  '🍍', // 파인애플
  '🥝', // 키위
];

/**
 * Fisher-Yates 알고리즘을 사용한 셔플 함수
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 8쌍(총 16장)의 무작위 카드 덱 생성
 */
export function generateInitialCards(): CardItem[] {
  const deck: CardItem[] = [];

  EMOJI_LIST.forEach((emoji, pairIndex) => {
    // 각 이모지별 2장씩 카드 생성
    deck.push({
      id: `card-${pairIndex}-1`,
      emoji,
      pairId: pairIndex,
      isFlipped: false,
      isMatched: false,
    });
    deck.push({
      id: `card-${pairIndex}-2`,
      emoji,
      pairId: pairIndex,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(deck);
}

/**
 * 초 단위 시간을 mm:ss 형식으로 포맷팅
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
