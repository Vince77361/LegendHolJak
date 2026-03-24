/**
 * Game Logic Tests
 *
 * Tests the core odd/even game logic:
 * - Odd secret_number → win
 * - Even secret_number → loss
 * - Coin calculation after win/loss
 * - Edge cases (0 coins, boundary numbers)
 */

function determineResult(secretNumber: number): "win" | "loss" {
  return secretNumber % 2 !== 0 ? "win" : "loss";
}

function calculateCoins(
  currentCoins: number,
  betAmount: number,
  result: "win" | "loss",
): number {
  if (result === "win") {
    return currentCoins + betAmount;
  }
  const newCoins = currentCoins - betAmount;
  return Math.max(0, newCoins);
}

describe("Game Logic - determineResult", () => {
  test("secret_number가 홀수(1)일 때 win 반환", () => {
    expect(determineResult(1)).toBe("win");
  });

  test("secret_number가 홀수(3)일 때 win 반환", () => {
    expect(determineResult(3)).toBe("win");
  });

  test("secret_number가 홀수(99)일 때 win 반환", () => {
    expect(determineResult(99)).toBe("win");
  });

  test("secret_number가 짝수(2)일 때 loss 반환", () => {
    expect(determineResult(2)).toBe("loss");
  });

  test("secret_number가 짝수(4)일 때 loss 반환", () => {
    expect(determineResult(4)).toBe("loss");
  });

  test("secret_number가 짝수(100)일 때 loss 반환", () => {
    expect(determineResult(100)).toBe("loss");
  });
});

describe("Game Logic - calculateCoins", () => {
  test("100코인에서 10 베팅 후 win이면 110코인", () => {
    expect(calculateCoins(100, 10, "win")).toBe(110);
  });

  test("100코인에서 10 베팅 후 loss면 90코인", () => {
    expect(calculateCoins(100, 10, "loss")).toBe(90);
  });

  test("100코인에서 100 베팅 후 win이면 200코인", () => {
    expect(calculateCoins(100, 100, "win")).toBe(200);
  });

  test("100코인에서 100 베팅 후 loss면 0코인", () => {
    expect(calculateCoins(100, 100, "loss")).toBe(0);
  });

  test("코인이 0 미만이 될 때 0으로 처리", () => {
    expect(calculateCoins(5, 10, "loss")).toBe(0);
  });

  test("0코인에서 베팅 후 loss면 0코인", () => {
    expect(calculateCoins(0, 10, "loss")).toBe(0);
  });

  test("1코인에서 1 베팅 후 win이면 2코인", () => {
    expect(calculateCoins(1, 1, "win")).toBe(2);
  });
});
