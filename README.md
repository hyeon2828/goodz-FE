# Goodz (goodsmap)

## 시작

- Node.js 20.9 이상 필요 (Next.js 16 요구사항)
- 패키지 매니저는 **pnpm만 사용** (npm/yarn 사용 금지)

```bash
pnpm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 열어서 NEXT_PUBLIC_API_URL을 실제 백엔드 주소로 조정

pnpm dev
```

`http://localhost:3000`에서 확인.

기타 명령어:

```bash
pnpm build   # 프로덕션 빌드
pnpm lint    # eslint 검사
pnpm start   # 빌드 결과 실행
```

## 폴더 구조

```
src/
  app/            라우트. 각 폴더가 URL 경로에 대응 (route group ()는 URL에 미포함)
    (main)/         공개 + 로그인 필요 페이지 — /goods, /planners, /stores/[storeId]
    (auth)/         인증 페이지 — /login, /signup, /verify-email
    admin/          업체 관리자 전용 — /admin/stores, /admin/stores/[storeUid]
    page.tsx        랜딩(가이드) 페이지 — /
    layout.tsx      루트 레이아웃 (Nav, Provider 배선)
    providers.tsx   Auth/Planner/ManagedStore Context Provider 조립
  proxy.ts        로그인 필요 라우트(/planners, /admin) 접근 제어 (Next.js 16 미들웨어 컨벤션)

  features/       도메인별 로직 + 컴포넌트 (goods, store, planner, auth 4개)
    goods/          굿즈 카탈로그: api.ts, mock-data.ts, components/
    store/          업체 관리: api.ts, mock-data.ts, ManagedStoreProvider.tsx, components/
    planner/        방문 플래너: PlannerProvider.tsx, components/
    auth/           로그인 상태: AuthProvider.tsx, components/

  components/     여러 feature에서 공유하는 컴포넌트
    layout/         Nav 등 레이아웃 컴포넌트
    common/         LoginPromptModal 등 범용 컴포넌트
    map/            MockMap (추후 카카오맵으로 교체 예정)
    ui/             shadcn/ui 컴포넌트 (프로토타입에서 복사, 아직 미사용)

  lib/            범용 유틸
    env.ts          API_BASE_URL 등 환경변수 접근 지점
    helpers.ts      genUid, fmtPrice, isValidEmail

  types/
    domain.ts       도메인 타입 전체 (GoodsData, StoreData, Plan 등)
```

## 컨벤션

- **패키지 매니저는 pnpm만 사용.** `pnpm add`/`pnpm dlx`로 통일 (npm install, npx 사용 금지)
- **API 호출은 `features/*/api.ts`에서만.** 페이지·컴포넌트가 mock 데이터나 향후 fetch 호출을 직접 import하지 않고, 반드시 해당 feature의 `api.ts`를 거칠 것 (백엔드 교체 시 변경 범위를 이 파일들로 한정하기 위함)
- **`'use client'`는 상호작용(hook, 이벤트 핸들러)이 있는 컴포넌트에만.** 데이터만 fetch해서 내려주는 페이지는 async Server Component로 유지 (`app/(main)/goods/page.tsx` 등 참고)
