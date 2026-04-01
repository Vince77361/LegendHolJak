# 홀짝 게임 아키텍처

## 게임 규칙
- 참여자는 홀수 또는 짝수를 선택하고 베팅 금액을 건다
- 베팅 시 서버가 1~100 랜덤 숫자를 생성
- 선택한 홀/짝이 랜덤 숫자와 일치하면 → WIN (베팅금액만큼 코인 획득)
- 불일치하면 → LOSE (베팅금액만큼 코인 차감, 최소 0)
- 기본 코인: 100개
- 공정성: 베팅금액 = 획득/차감금액 (1:1)

## 기술 스택
- Framework: NextJS 15 App Router
- Language: TypeScript
- DB: Supabase
- Auth: Supabase Auth
- State: Tanstack Query + Zustand
- UI: TailwindCSS + Shadcn/UI
- Toast: react-hot-toast (상단, 흰색)
- Animation: framer-motion (모달), GSAP (스크롤)

## DB 스키마 (Supabase SQL)

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID UNIQUE NOT NULL,
  username TEXT NOT NULL,
  coins INTEGER DEFAULT 100 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 베팅 테이블 (라운드 없음, 베팅마다 즉시 결과)
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  bet_amount INTEGER NOT NULL CHECK (bet_amount > 0),
  guess TEXT NOT NULL CHECK (guess IN ('odd', 'even')),
  secret_number INTEGER NOT NULL CHECK (secret_number BETWEEN 1 AND 100),
  result TEXT NOT NULL CHECK (result IN ('win', 'loss')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 키-값 설정 테이블 (계좌 정보 등)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 입금 신청 테이블
CREATE TABLE payment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  package_id TEXT NOT NULL,
  coins INTEGER NOT NULL,
  amount_usd NUMERIC NOT NULL,
  depositor_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API 엔드포인트

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | /api/game/bet | 홀/짝 베팅 (즉시 결과 반환) | Supabase Auth |
| GET | /api/user | 내 코인 조회 | Supabase Auth |
| GET | /api/ranking | 랭킹 조회 (coins DESC) | 불필요 |
| GET | /api/admin/bank-info | 계좌 정보 조회 | 없음 |
| PUT | /api/admin/bank-info | 계좌 정보 저장 | Supabase Auth |
| POST | /api/payment/request | 입금 신청 제출 | Supabase Auth |
| GET | /api/payment/request | 내 신청 내역 조회 | Supabase Auth |
| GET | /api/admin/payments | 전체 신청 목록 | Supabase Auth |
| POST | /api/admin/payments/[id] | 승인/거절 처리 | Supabase Auth |

## 페이지 구조
- / (메인 게임 페이지)
- /ranking (랭킹 페이지)
- /admin (어드민 페이지, Supabase Auth 보호)
- /sign-in (Google OAuth 로그인)

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
