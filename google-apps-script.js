/**
 * ========================================================
 * 카드 맞추기 게임 - Google Apps Script (GAS) 웹 앱 코드
 * 스프레드시트 URL: https://docs.google.com/spreadsheets/d/1i8-zuVlvKI5K_zT2GULf0SFcONz7VSE2kYpyXzxpq4U/edit
 * ========================================================
 */

function getTargetSheet() {
  let spreadsheet;
  try {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {}

  if (!spreadsheet) {
    const SPREADSHEET_ID = "1i8-zuVlvKI5K_zT2GULf0SFcONz7VSE2kYpyXzxpq4U";
    spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  return spreadsheet.getActiveSheet() || spreadsheet.getSheets()[0];
}

/**
 * 'mm:ss' 문자열 또는 숫자 형식의 시간을 비교를 위해 초(seconds) 단위로 변환
 */
function parseTimeToSeconds(timeStr) {
  if (typeof timeStr === 'number') return timeStr;
  if (!timeStr) return 999999;
  const parts = String(timeStr).split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  const parsed = parseInt(timeStr, 10);
  return isNaN(parsed) ? 999999 : parsed;
}

/**
 * 시트 전체 데이터에서 finishtime 기준 오름차순(가장 빠른 시간) 상위 3명 추출
 */
function getTopRankings() {
  const sheet = getTargetSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return []; // 헤더만 있거나 데이터가 없는 경우
  }

  // 2행부터 전체 데이터 가져오기: [timestamp, name, score, finishtime]
  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();

  const records = data
    .filter(row => row[1] && row[3]) // 이름과 finishtime이 있는 행만
    .map(row => {
      const timeStr = String(row[3]).trim();
      return {
        timestamp: row[0] ? String(row[0]) : '',
        name: String(row[1]).trim(),
        score: Number(row[2]) || 0,
        finishtime: timeStr,
        seconds: parseTimeToSeconds(timeStr)
      };
    });

  // 1순위: finishtime 오름차순 (더 적은 시간)
  // 2순위: finishtime이 같으면 score 오름차순 (더 적은 시도 횟수)
  records.sort((a, b) => {
    if (a.seconds !== b.seconds) {
      return a.seconds - b.seconds;
    }
    return a.score - b.score;
  });

  // 상위 최대 3명 추출 및 랭킹 부여
  return records.slice(0, 3).map((rec, index) => ({
    rank: index + 1,
    name: rec.name,
    score: rec.score,
    finishtime: rec.finishtime
  }));
}

/**
 * GET 요청 핸들러: 상위 3명 랭킹 조회 지원
 * 예: ?action=rankings
 */
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};

  // 랭킹 조회 요청
  if (params.action === 'rankings') {
    const top3 = getTopRankings();
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        rankings: top3
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // 헬스 체크
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "ok",
      message: "Google Apps Script Server Running"
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST 요청 핸들러: 게임 기록 저장 후 최신 상위 3명 랭킹 반환
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheet = getTargetSheet();

    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    const name = data.name || "익명";
    const score = Number(data.score ?? data.moves ?? 0);
    const finishtime = data.finishtime || "00:00";

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["timestamp", "name", "score", "finishtime"]);
    }

    // 기록 추가
    sheet.appendRow([timestamp, name, score, finishtime]);

    // 저장 직후 최신 TOP 3 랭킹 계산
    const top3 = getTopRankings();

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "저장 완료",
        savedData: { timestamp, name, score, finishtime },
        rankings: top3
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
