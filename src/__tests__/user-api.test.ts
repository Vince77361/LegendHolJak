/**
 * User API Route Tests
 *
 * Tests GET /api/user with mocked Supabase and Clerk.
 */

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

import { GET } from "@/app/api/user/route";

function createQueryChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
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

describe("GET /api/user", () => {
  test("미인증 시 401 에러 반환", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toContain("로그인");
  });

  test("사용자 조회 성공 시 200 + 사용자 정보 반환", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk-user-1" });

    mockFrom.mockImplementation(() => {
      const chain = createQueryChain();
      chain.single = jest.fn().mockResolvedValue({
        data: { id: "db-user-1", username: "TestUser", coins: 100 },
        error: null,
      });
      return chain;
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.username).toBe("TestUser");
    expect(body.data.coins).toBe(100);
  });

  test("사용자 없을 때 404 에러 반환", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk-user-1" });

    mockFrom.mockImplementation(() => {
      const chain = createQueryChain();
      chain.single = jest.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });
      return chain;
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error).toContain("사용자");
  });
});
