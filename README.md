# PickGo Portfolio Demo

사용자의 긴급도와 컨디션에 따라 단 하나의 이동 경로를 제안하는 PickGo의 인터랙티브 포트폴리오입니다. 모든 경로와 교통 상황은 로컬 Mock Data로 동작하며 실제 위치나 개인정보를 전송하지 않습니다.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run check
```

## Deployment

GitHub `main` 브랜치가 Vercel 프로덕션 환경과 연결되어 있습니다.

```text
local commit → git push origin main → Vercel automatic production deployment
```

기능 브랜치나 Pull Request의 커밋은 Preview Deployment로 생성되고, `main` 브랜치에 반영된 커밋은 Production Deployment로 자동 배포됩니다.

서비스 기획 근거는 상위 디렉터리의 `1_Research`, `2_Discovery`, `3_Planning` 문서를 참고합니다.
