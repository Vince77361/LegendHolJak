import { test, expect } from "@playwright/test";

test.describe("Ranking Page", () => {
  test("랭킹 페이지 접근 가능", async ({ page }) => {
    await page.goto("/ranking");

    // Page loads with ranking title
    await expect(page.locator("h1")).toContainText("랭킹");
  });

  test("랭킹 테이블이 렌더링됨", async ({ page }) => {
    await page.goto("/ranking");

    // Table headers
    await expect(page.getByText("순위")).toBeVisible();
    await expect(page.getByText("유저")).toBeVisible();
    await expect(page.getByText("코인")).toBeVisible();
  });

  test("상위 50명 텍스트 표시", async ({ page }) => {
    await page.goto("/ranking");

    await expect(page.getByText("상위 50명")).toBeVisible();
  });

  test("게임으로 돌아가기 링크 있음", async ({ page }) => {
    await page.goto("/ranking");

    const backLink = page.getByText("게임으로 돌아가기");
    await expect(backLink).toBeVisible();
  });

  test("게임으로 돌아가기 클릭 시 홈으로 이동", async ({ page }) => {
    await page.goto("/ranking");

    await page.getByText("게임으로 돌아가기").click();
    await expect(page).toHaveURL("/");
  });

  test("하단 네비게이션이 렌더링됨", async ({ page }) => {
    await page.goto("/ranking");

    const nav = page.locator("nav");
    await expect(nav.getByText("게임")).toBeVisible();
    await expect(nav.getByText("랭킹")).toBeVisible();
  });
});
