# Rider–Waite–Smith 타로 이미지 출처

이 프로젝트의 타로 화면은 원본 Rider–Waite–Smith 계열 78장 카드 스캔을 로컬 정적 자산으로 사용합니다.

- 원본 작품: Rider–Waite–Smith Tarot, Pamela Colman Smith 그림, 1909년 초판 계열
- 동기화 소스 저장소: `metabismuth/tarot-json`
- 소스 저장소 라이선스: MIT
- 소스 저장소 설명: 78장의 Rider–Waite 카드 스캔을 제공하며 원본 덱은 미국에서 퍼블릭 도메인으로 안내됨
- 런타임 경로: `/tarot-rws/*.jpg`

`npm run dev`, `npm run build`, `npm run preview` 전에 `scripts/sync-rws-assets.js`가 누락된 카드 이미지를 `public/tarot-rws`에 내려받습니다. 따라서 브라우저에서 사주 또는 타로를 사용하는 동안 외부 이미지 서버에 접속하지 않습니다.

카드 해설은 A. E. Waite의 전통적 RWS 의미 체계와 널리 쓰이는 정·역방향 독법을 참고해 이 프로젝트용 한국어 생활 언어로 새로 작성한 요약이며, 원문을 그대로 복제하지 않습니다. 타로 결과는 미래를 확정하는 예언이 아니라 자기성찰을 위한 상징적 참고 정보로 표시합니다.
