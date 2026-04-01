/**
 * User API Route Tests
 *
 * Tests GET /api/user with mocked Supabase.
 */

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
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toContain("로그인");
  });

  test("사용자 조회 성공 시 200 + 사용자 정보 반환", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "supabase-user-1", email: "test@example.com" } },
    });

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
});
