/**
 * Admin API Route Tests
 *
 * Tests POST /api/admin/create-round and POST /api/admin/close-round
 * with mocked Supabase.
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

import { POST as createRound } from "@/app/api/admin/create-round/route";
import { POST as closeRound } from "@/app/api/admin/close-round/route";

function createRequest(
  url: string,
  body: Record<string, unknown>,
): NextRequest {
  return new NextRequest(url, {
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

// ========== create-round ==========
describe("POST /api/admin/create-round", () => {
  test("미인증 시 401 에러 반환", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createRequest(
      "http://localhost:3000/api/admin/create-round",
      { secret_number: 7 },
    );
    const res = await createRound(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  test("유효하지 않은 secret_number 시 400 에러", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
    });

    const req = createRequest(
      "http://localhost:3000/api/admin/create-round",
      { secret_number: 0 },
    );
    const res = await createRound(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  test("101 이상의 secret_number 시 400 에러", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
    });

    const req = createRequest(
      "http://localhost:3000/api/admin/create-round",
      { secret_number: 101 },
    );
    const res = await createRound(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  test("이미 active 라운드 있을 때 400 에러", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
    });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "existing-round" },
          error: null,
        });
        return chain;
      }
      return createQueryChain();
    });

    const req = createRequest(
      "http://localhost:3000/api/admin/create-round",
      { secret_number: 42 },
    );
    const res = await createRound(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("활성 라운드");
  });

  test("라운드 생성 성공", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
    });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        });
        return chain;
      }
      if (callCount === 2) {
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "new-round-1" },
          error: null,
        });
        return chain;
      }
      return createQueryChain();
    });

    const req = createRequest(
      "http://localhost:3000/api/admin/create-round",
      { secret_number: 42 },
    );
    const res = await createRound(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.round_id).toBe("new-round-1");
  });
});

// ========== close-round ==========
describe("POST /api/admin/close-round", () => {
  test("미인증 시 401 에러 반환", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = createRequest(
      "http://localhost:3000/api/admin/close-round",
      { round_id: "round-1" },
    );
    const res = await closeRound(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  test("라운드 없을 때 404 에러", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
    });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
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

    const req = createRequest(
      "http://localhost:3000/api/admin/close-round",
      { round_id: "nonexistent" },
    );
    const res = await closeRound(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });

  test("이미 종료된 라운드 시 400 에러", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
    });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "round-1", secret_number: 7, is_active: false },
          error: null,
        });
        return chain;
      }
      return createQueryChain();
    });

    const req = createRequest(
      "http://localhost:3000/api/admin/close-round",
      { round_id: "round-1" },
    );
    const res = await closeRound(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("종료");
  });

  test("라운드 종료 시 모든 bet 결과 처리 (홀수 = win)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
    });

    const mockBets = [
      { id: "bet-1", user_id: "user-1", bet_amount: 10 },
      { id: "bet-2", user_id: "user-2", bet_amount: 20 },
    ];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "round-1", secret_number: 7, is_active: true },
          error: null,
        });
        return chain;
      }
      if (callCount === 2) {
        const chain = createQueryChain();
        chain.eq = jest.fn().mockReturnValue(chain);
        chain.eq = jest.fn().mockResolvedValue({
          data: mockBets,
          error: null,
        });
        return chain;
      }
      const chain = createQueryChain();
      chain.single = jest.fn().mockResolvedValue({
        data: { coins: 100 },
        error: null,
      });
      chain.eq = jest.fn().mockResolvedValue({ error: null });
      return chain;
    });

    const req = createRequest(
      "http://localhost:3000/api/admin/close-round",
      { round_id: "round-1" },
    );
    const res = await closeRound(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.winners).toBe(2);
    expect(body.data.losers).toBe(0);
  });

  test("라운드 종료 시 모든 bet 결과 처리 (짝수 = loss)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
    });

    const mockBets = [
      { id: "bet-1", user_id: "user-1", bet_amount: 10 },
    ];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        const chain = createQueryChain();
        chain.single = jest.fn().mockResolvedValue({
          data: { id: "round-1", secret_number: 42, is_active: true },
          error: null,
        });
        return chain;
      }
      if (callCount === 2) {
        const chain = createQueryChain();
        chain.eq = jest.fn().mockResolvedValue({
          data: mockBets,
          error: null,
        });
        return chain;
      }
      const chain = createQueryChain();
      chain.eq = jest.fn().mockResolvedValue({ error: null });
      return chain;
    });

    const req = createRequest(
      "http://localhost:3000/api/admin/close-round",
      { round_id: "round-1" },
    );
    const res = await closeRound(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.winners).toBe(0);
    expect(body.data.losers).toBe(1);
  });
});
