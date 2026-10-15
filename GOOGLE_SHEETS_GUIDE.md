# Google Apps Script 배포 및 설정 가이드

본 가이드는 제공해주신 구글 스프레드시트([시트 링크](https://docs.google.com/spreadsheets/d/1i8-zuVlvKI5K_zT2GULf0SFcONz7VSE2kYpyXzxpq4U/edit?usp=sharing))에 게임 결과를 자동 기록하기 위한 앱스 스크립트 배포 절차입니다.

---

## 1. 구글 스프레드시트 설정

1. [구글 시트 링크](https://docs.google.com/spreadsheets/d/1i8-zuVlvKI5K_zT2GULf0SFcONz7VSE2kYpyXzxpq4U/edit?usp=sharing)를 브라우저로 엽니다.
2. 1행에 아래와 같이 4개의 열 헤더를 작성합니다 (소문자):
   - **A1**: `timestamp`
   - **B1**: `name`
   - **C1**: `score`
   - **D1**: `finishtime`

---

## 2. Google Apps Script 생성 및 코드 붙여넣기

1. 스프레드시트 상단 메뉴에서 **확장 프로그램** > **Apps Script**를 클릭합니다.
2. 편집기 창의 기존 내용을 모두 지우고, 프로젝트 루트의 [google-apps-script.js](file:///Users/youngkwon/Documents/2026/AI/cardgame_ver2/google-apps-script.js) 파일 내용을 그대로 복사하여 붙여넣습니다:

```javascript
const SPREADSHEET_ID = "1i8-zuVlvKI5K_zT2GULf0SFcONz7VSE2kYpyXzxpq4U";
const SHEET_NAME = "시트1"; 

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.getSheets()[0];
    }

    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    const name = data.name || "익명";
    const score = Number(data.score ?? data.moves ?? 0);
    const finishtime = data.finishtime || data.time || "00:00";

    sheet.appendRow([timestamp, name, score, finishtime]);

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "데이터가 성공적으로 구글 시트에 저장되었습니다.",
        savedData: { timestamp, name, score, finishtime }
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

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "ok",
      message: "카드 맞추기 게임 Google Apps Script 서비스가 정상 실행 중입니다."
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

3. `Ctrl + S` (또는 `Cmd + S`)를 눌러 저장합니다.

---

## 3. 웹 앱(Web App)으로 배포 (가장 중요한 단계)

1. Apps Script 편집기 우측 상단의 **[배포]** > **[새 배포]** 버튼을 클릭합니다.
2. 좌측 톱니바퀴 아이콘 옆 **유형 선택**을 클릭하고 **[웹 앱(Web app)]**을 선택합니다.
3. 다음 옵션을 정확하게 지정합니다:
   - **설명**: `카드 게임 기록 연동`
   - **다음 사용자로 실행 (Execute as)**: **`나 (내 계정)`**
   - **액세스 권한이 있는 사용자 (Who has access)**: **`모든 사용자 (Anyone)`** *(로그인 없이 웹에서 데이터 전송 가능하도록)*
4. **[배포]** 버튼을 누릅니다.
5. 계정 접근 승인(Review Permissions) 창이 뜨면 승인합니다.
   *(경고 문구가 나올 경우 [고급] > [이름(안전하지 않음)으로 이동] 클릭 후 [허용])*
6. 배포가 완료되면 생성된 **웹 앱 URL** (`https://script.google.com/macros/s/.../exec`)을 복사합니다.

---

## 4. Next.js 프로젝트 연동

발급받은 웹 앱 URL을 프로젝트의 `.env.local` 파일에 등록하거나 말씀해 주시면 프론트엔드에서 승리 시 자동 저장되도록 즉시 연결됩니다:

```bash
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/발급받은_배포ID/exec
```
