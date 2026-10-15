export interface GameRecordPayload {
  name: string;
  score: number; // 시도 횟수 (Moves)
  finishtime: string; // 소요 시간 (mm:ss)
  timestamp?: string;
}

export interface PlayerRank {
  rank: number;
  name: string;
  score: number;
  finishtime: string;
}

// 클라이언트 레벨 중복 전송 방지를 위한 모듈 스코프 락
let isCurrentlySaving = false;

const SPREADSHEET_ID = '1i8-zuVlvKI5K_zT2GULf0SFcONz7VSE2kYpyXzxpq4U';

/**
 * 'mm:ss' 또는 숫자 형식의 문자열을 초(seconds)로 변환
 */
function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 999999;
  const parts = timeStr.trim().split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  const parsed = parseInt(timeStr, 10);
  return isNaN(parsed) ? 999999 : parsed;
}

/**
 * CSV 라인 파싱 (따옴표 처리)
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * 구글 스프레드시트의 공개 gviz API를 통해 실시간 데이터 조회 및 TOP 3 랭킹 계산
 * (Google Apps Script 배포 버전에 의존하지 않고 100% 확실하게 실시간 동작)
 */
export async function fetchTopRankings(): Promise<PlayerRank[]> {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&t=${Date.now()}`;
    const response = await fetch(csvUrl, { cache: 'no-store' });

    if (!response.ok) {
      console.warn('구글 시트 CSV 응답 실패:', response.status);
      return [];
    }

    const text = await response.text();
    const lines = text.split('\n').filter((l) => l.trim().length > 0);

    if (lines.length <= 1) {
      return [];
    }

    // 1행(헤더: "timestamp","name","score","finishtime") 제외
    const records = lines.slice(1).map((line) => {
      const cols = parseCsvLine(line);
      const name = cols[1] || '익명';
      const score = parseInt(cols[2], 10) || 0;
      const finishtime = cols[3] || '99:99';
      return {
        name,
        score,
        finishtime,
        seconds: parseTimeToSeconds(finishtime),
      };
    });

    // 1순위: finishtime 오름차순 (빠른 시간 순)
    // 2순위: finishtime 동일 시 score 오름차순 (적은 시도 횟수 순)
    records.sort((a, b) => {
      if (a.seconds !== b.seconds) {
        return a.seconds - b.seconds;
      }
      return a.score - b.score;
    });

    // 상위 3명 추출
    return records.slice(0, 3).map((rec, index) => ({
      rank: index + 1,
      name: rec.name,
      score: rec.score,
      finishtime: rec.finishtime,
    }));
  } catch (error) {
    console.error('스프레드시트 랭킹 계산 중 오류:', error);
    return [];
  }
}

/**
 * 게임 승리 시 구글 시트에 기록을 저장하고 최신 TOP 3 랭킹을 반환하는 함수
 */
export async function saveGameRecordToSheet(
  payload: GameRecordPayload
): Promise<PlayerRank[]> {
  const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

  if (isCurrentlySaving) {
    console.warn('이미 구글 시트 저장 작업이 진행 중입니다.');
    return await fetchTopRankings();
  }

  isCurrentlySaving = true;

  const timestamp = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const recordData = {
    ...payload,
    timestamp,
  };

  try {
    // 1. 구글 시트로 기록 전송 (POST)
    if (scriptUrl) {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(recordData),
      });
      console.log('구글 시트 저장 요청 전송 완료:', recordData);
    }

    // 2. 구글 시트에 반영될 때까지 1초 대기 후 최신 TOP 3 랭킹 조회
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return await fetchTopRankings();
  } catch (error) {
    console.error('구글 시트 저장 중 에러:', error);
    return await fetchTopRankings();
  } finally {
    setTimeout(() => {
      isCurrentlySaving = false;
    }, 2000);
  }
}
