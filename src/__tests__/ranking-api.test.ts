/**
 * Ranking API Route Tests
 *
 * Tests GET /api/ranking with mocked Supabase.
 */

// Mock Supabase
const mockFrom = jest.fn();
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { GET } from "@/app/api/ranking/route";

function createQueryChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.order = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockResolvedValue({ data: [], error: null });

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

describe("GET /api/ranking", () => {
  test("ranking 조회 성공 시 200 + 배열 반환", async () => {
    const mockUsers = [
      { username: "Alice", coins: 500 },
      { username: "Bob", coins: 300 },
      { username: "Charlie", coins: 100 },
    ];

    mockFrom.mockImplementation(() => {
      const chain = createQueryChain();
      chain.limit = jest.fn().mockResolvedValue({
        data: mockUsers,
        error: null,
      });
      return chain;
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(3);
    expect(body.data[0]).toEqual({
      username: "Alice",
      coins: 500,
      rank: 1,
    });
    expect(body.data[1]).toEqual({
      username: "Bob",
      coins: 300,
      rank: 2,
    });
    expect(body.data[2]).toEqual({
      username: "Charlie",
      coins: 100,
      rank: 3,
    });
  });

  test("빈 랭킹 시 빈 배열 반환", async () => {
    mockFrom.mockImplementation(() => {
      const chain = createQueryChain();
      chain.limit = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });
      return chain;
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  test("data가 null일 때 빈 배열 반환", async () => {
    mockFrom.mockImplementation(() => {
      const chain = createQueryChain();
      chain.limit = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      return chain;
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  test("Supabase 에러 시 500 반환", async () => {
    mockFrom.mockImplementation(() => {
      const chain = createQueryChain();
      chain.limit = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });
      return chain;
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toContain("랭킹");
  });
});
