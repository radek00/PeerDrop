import { expect, Page } from "@playwright/test";

export async function getClientName(page: Page): Promise<string> {
  const nameElement = page.getByTestId("client-name").first();
  await expect(nameElement).toBeVisible();
  const name = await nameElement.innerText();
  expect(name).not.toBe("");
  return name;
}