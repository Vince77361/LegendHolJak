/**
 * Bet API Route Tests
 *
 * Tests POST /api/game/bet with mocked Supabase.
 */

import { NextRequest } from "next/server";

// Mock Supabase admin client
const mockFrom = jest.fn();
jest.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

// Mock Supabase auth (server client)
const mockGetUser = jest.fn();
jest.mock("@/lib/supabase-server", () => ({
  createSupabaseServerClient: () =>
    Promise.resolve({
      auth: { getUser: () => mockGetUser() },
    }),
}));

import { POST } from "@/app/api/game/bet/route";

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/game/bet", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function createQueryChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.update = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue({ data: null, error: null });

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
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createRequest({ guess: "odd", bet_amount: 10 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toContain("로그인");
  });

  test("유효하지 않은 요청 시 400 에러 반환", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
    });

    const req = createRequest({ guess: "", bet_amount: 0 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  test("코인 부족 시 400 에러 반환", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
    });

    mockFrom.mockImplementation(() => {
      const chain = createQueryChain();
      chain.single = jest.fn().mockResolvedValue({
        data: { id: "db-user-1", coins: 5 },
        error: null,
      });
      return chain;
    });

    const req = createRequest({ guess: "odd", bet_amount: 50 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("코인");
  });

  test("정상 베팅 시 200 응답 반환", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
    });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // users - get user
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "db-user-1", coins: 100 },
          error: null,
        });
        return chain;
      }
      if (callCount === 2) {
        // users - update coins
        const chain = createQueryChain();
        chain.eq = jest.fn().mockResolvedValue({ error: null });
        return chain;
      }
      if (callCount === 3) {
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

    const req = createRequest({ guess: "odd", bet_amount: 10 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.secret_number).toBeDefined();
    expect(body.data.result).toMatch(/^(win|loss)$/);
  });
});
