import { expect, test } from "@playwright/test";

test("signup, food creation, and logout use the secure session", async ({
  page,
}) => {
  const email = `browser-${Date.now()}@example.com`;

  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByText("Account created. You’re signed in.")).toBeVisible();

  await page.goto("/foods");
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  await page.getByPlaceholder("Food name").fill("Browser tacos");
  await page.getByRole("button", { name: "Add food" }).click();
  await expect(page.getByRole("heading", { name: "Browser tacos" })).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByText("Log in to view and add foods.")).toBeVisible();
});

test("Swagger UI is available through the Next.js proxy", async ({ page }) => {
  await page.goto("/api/docs");
  await expect(
    page.getByRole("heading", { name: /Hungr API 1\.0\.0/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "GET /api/v1/foods List your foods",
    }),
  ).toBeVisible();
});
