/**
 * Bet API Route Tests
 *
 * Tests POST /api/game/bet with mocked Supabase and Clerk.
 */

import { NextRequest } from "next/server";

// Mock Supabase
const mockFrom = jest.fn();
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

// Mock Clerk auth
const mockAuth = jest.fn();
jest.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

import { POST } from "@/app/api/game/bet/route";

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/game/bet", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// Helper to build chainable Supabase query mock
function createQueryChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.update = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue({ data: null, error: null });

  // Apply overrides
  for (const [key, value] of Object.entries(overrides)) {
    if (typeof value === "function") {
      chain[key] = value as jest.Mock;
    }
  }

  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/game/bet", () => {
  test("미인증 시 401 에러 반환", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const req = createRequest({ round_id: "round-1", bet_amount: 10 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toContain("로그인");
  });

  test("유효하지 않은 요청 시 400 에러 반환", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });

    const req = createRequest({ round_id: "", bet_amount: 0 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  test("라운드 없을 때 404 에러 반환", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      // First call: game_rounds lookup
      if (callCount === 1) {
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "Not found" },
        });
        return chain;
      }
      return createQueryChain();
    });

    const req = createRequest({ round_id: "nonexistent", bet_amount: 10 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error).toContain("라운드");
  });

  test("코인 부족 시 400 에러 반환", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // game_rounds - active round found
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "round-1", is_active: true },
          error: null,
        });
        return chain;
      }
      if (callCount === 2) {
        // users - user with low coins
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "db-user-1", coins: 5 },
          error: null,
        });
        return chain;
      }
      return createQueryChain();
    });

    const req = createRequest({ round_id: "round-1", bet_amount: 50 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("코인");
  });

  test("정상 베팅 시 201 또는 200 응답과 bet_id 반환", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // game_rounds - active round
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "round-1", is_active: true },
          error: null,
        });
        return chain;
      }
      if (callCount === 2) {
        // users - user with enough coins
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "db-user-1", coins: 100 },
          error: null,
        });
        return chain;
      }
      if (callCount === 3) {
        // bets - check existing bet (none)
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        });
        return chain;
      }
      if (callCount === 4) {
        // users - deduct coins
        const chain = createQueryChain();
        chain.eq = jest.fn().mockResolvedValue({ error: null });
        return chain;
      }
      if (callCount === 5) {
        // bets - insert bet
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "bet-1" },
          error: null,
        });
        return chain;
      }
      return createQueryChain();
    });

    const req = createRequest({ round_id: "round-1", bet_amount: 10 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.bet_id).toBe("bet-1");
    expect(body.data.remaining_coins).toBe(90);
  });
});
