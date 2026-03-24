import { test, expect } from "@playwright/test";

test.describe("Game Page", () => {
  test("게임 페이지가 올바르게 로드됨", async ({ page }) => {
    await page.goto("/");

    // Header with game title
    await expect(page.locator("h1")).toContainText("홀짝");

    // Main game area exists
    await expect(page.locator("main")).toBeVisible();
  });

  test("코인 표시가 있음", async ({ page }) => {
    await page.goto("/");

    // Coin display with coin emoji
    await expect(page.getByText("🪙")).toBeVisible();
  });

  test("현재 라운드 섹션이 렌더링됨", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("현재 라운드")).toBeVisible();
  });

  test("라운드 비활성 시 대기 메시지 표시", async ({ page }) => {
    await page.goto("/");

    // When no active round, show waiting message
    await expect(
      page.getByText("다음 라운드를 기다리고 있습니다"),
    ).toBeVisible();
  });

  test("하단 네비게이션에 게임과 랭킹 링크 있음", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav");
    await expect(nav.getByText("게임")).toBeVisible();
    await expect(nav.getByText("랭킹")).toBeVisible();
  });

  test("랭킹 링크 클릭 시 랭킹 페이지로 이동", async ({ page }) => {
    await page.goto("/");

    await page.locator("nav").getByText("랭킹").click();
    await expect(page).toHaveURL(/\/ranking/);
  });
});
