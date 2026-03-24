# 홀짝 게임 아키텍처

## 게임 규칙
- 참여자는 1~100 숫자를 입력하고 베팅 금액을 건다
- 어드민이 설정한 secret_number가 홀수면 → 참여자 WIN (베팅금액만큼 코인 획득)
- secret_number가 짝수면 → 참여자 LOSE (베팅금액만큼 코인 차감)
- 기본 코인: 100개
- 공정성: 베팅금액 = 획득/차감금액 (1:1)

## 기술 스택
- Framework: NextJS 15 App Router
- Language: TypeScript
- DB: Supabase
- Auth: Clerk
- State: Tanstack Query + Zustand
- UI: TailwindCSS + Shadcn/UI
- Toast: react-hot-toast (상단, 흰색)
- Animation: framer-motion (모달), GSAP (스크롤)

## DB 스키마 (Supabase SQL)

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  coins INTEGER DEFAULT 100 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 게임 라운드 테이블
CREATE TABLE game_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  secret_number INTEGER NOT NULL CHECK (secret_number BETWEEN 1 AND 100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- 베팅 테이블
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  round_id UUID REFERENCES game_rounds(id) NOT NULL,
  bet_amount INTEGER NOT NULL CHECK (bet_amount > 0),
  result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'win', 'loss')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, round_id)
);
```

## API 엔드포인트

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | /api/game/current-round | 현재 활성 라운드 조회 | 불필요 |
| POST | /api/game/bet | 베팅 제출 | Clerk |
| GET | /api/ranking | 랭킹 조회 (coins DESC) | 불필요 |
| POST | /api/admin/create-round | 새 라운드 생성 | Admin |
| POST | /api/admin/close-round | 라운드 종료 + 결과 처리 | Admin |

## 페이지 구조
- / (메인 게임 페이지)
- /ranking (랭킹 페이지)
- /admin (어드민 페이지, Clerk 보호)

## 폴더 구조
```
src/
  app/
    api/
      game/
        current-round/route.ts
        bet/route.ts
      ranking/route.ts
      admin/
        create-round/route.ts
        close-round/route.ts
      docs/
        route.ts (Swagger JSON)
    (home)/
      page.tsx
    ranking/
      page.tsx
    admin/
      page.tsx
  components/
    ui/ (shadcn)
    game/
      bet-form.tsx
      round-status.tsx
      coin-display.tsx
      result-modal.tsx
    ranking/
      ranking-table.tsx
  lib/
    supabase.ts
    providers.tsx
    store.ts
    utils.ts
  hooks/
    useGame.ts
    useRanking.ts
  types/
    game.ts
  __tests__/
  e2e/
docs/
  architecture.md
```
