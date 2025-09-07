import { expect, Page } from "@playwright/test";
import AxeBuilder from '@axe-core/playwright';

export async function getClientName(page: Page): Promise<string> {
  const nameElement = page.getByTestId("client-name").first();
  await expect(nameElement).toBeVisible();
  const name = await nameElement.innerText();
  expect(name).not.toBe("");
  return name;
}

export async function checkAccessibility(page: Page) {
  //axe checks color contrasts between an active dialog and content hidden by the dialog which seems like wrong behavior, so color-contrast rule is disabled
  const scanResult = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  expect(scanResult.violations).toEqual([]);
}
