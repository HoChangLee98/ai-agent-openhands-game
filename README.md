# ai-agent-openhands-game

간단한 **가위바위보(rock-paper-scissors)** 웹 게임입니다.

## GitHub Pages (공개 링크)

GitHub Pages를 켜면 다른 사람도 브라우저에서 바로 접속해서 플레이할 수 있습니다.

1. GitHub → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / **(root)**
4. Save

설정이 완료되면 아래 URL로 접근 가능합니다:

- `https://HoChangLee98.github.io/ai-agent-openhands-game/`

## 기능

- 가위/바위/보 버튼으로 플레이
- 1명 모드에서는 컴퓨터가 랜덤 선택
- 결과 표시(승리/패배/무승부) (플레이어 1 기준)
- 점수판(승/패/무) 누적 + 총 경기 수 표시
- 승률/무승부율 표시
- 플레이어 수(1명/2명) 선택
  - 1명: 나 vs 컴퓨터
  - 2명: 플레이어 1 vs 플레이어 2 (로컬)
- 경기 히스토리(최근 30판) 기록/표시 (모드 포함)
- 점수/히스토리는 `localStorage`에 저장되어 새로고침해도 유지

> 참고: 플레이어 수(모드)를 변경하면 점수/히스토리가 초기화됩니다.

## 실행 방법

### 1) 그냥 열기(가장 간단)

`index.html`을 브라우저로 열면 됩니다.

### 2) 로컬 서버로 실행(권장)

일부 환경에서 파일 직접 열기(`file://`)가 불편하면 아래처럼 로컬 서버를 띄우세요.

```bash
cd ai-agent-openhands-game
python -m http.server 8000
```

> 만약 `OSError: [Errno 98] Address already in use`가 나오면 포트를 바꿔서 실행하세요:
>
> ```bash
> python -m http.server 8002
> ```

브라우저에서 접속:

- http://localhost:8000 (또는 실행한 포트)

## 파일 구조

- `index.html` : 화면(UI)
- `style.css` : 스타일
- `script.js` : 게임 로직/모드/점수/히스토리 저장
