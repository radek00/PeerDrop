import { test, expect } from "@playwright/test";
import { readFile } from "fs";
import { getClientName } from "./utils/utils";

test.describe.parallel("File upload and download", () => {
  let context1;
  let context2;
  let page1;
  let page2;

  test.beforeEach(async ({ browser }) => {
    context1 = await browser.newContext();
    context2 = await browser.newContext();
    page1 = await context1.newPage();
    page2 = await context2.newPage();
    await page1.goto("/");
    await page2.goto("/");
  });

  test.afterEach(async () => {
    await page1.close();
    await context1.close();
    await page2.close();
    await context2.close();
  });

  async function uploadFileToClient(senderPage, receiverName, fileName, fileContent) {
    const connectedClient = senderPage.locator("connected-client", { hasText: receiverName }).first();
    await expect(connectedClient).toBeVisible();
    const label = connectedClient.locator('xpath=parent::label').first();
    const fileInput = label.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: "text/plain",
      buffer: Buffer.from(fileContent)
    });
  }

  test("file is uploaded and received by connected client", async () => {
    const client2Name = await getClientName(page2);
    await uploadFileToClient(page1, client2Name, "testfile.txt", "Hello from client 1!");

    const confirmDialog = page2.locator('confirm-dialog', { hasText: 'testfile.txt' }).first().locator('.overlay').first();
    await expect(confirmDialog).toBeVisible();
    const button = confirmDialog.locator('button', { hasText: 'Yes' }).first();
    await expect(button).toBeVisible();
    const downloadPromise = page2.waitForEvent('download');
    await button.click();
    const download = await downloadPromise;
    const filePath = await download.path();
    readFile(filePath, 'utf8', (err, data) => {
      expect(err).toBeNull();
      expect(data).toBe("Hello from client 1!");
    });
  });

  test("File transfer can be rejected by the recipient", async () => {
    const client2Name = await getClientName(page2);
    await uploadFileToClient(page1, client2Name, "testfile.txt", "Hello from client 1!");

    const confirmDialog = page2.locator('confirm-dialog', { hasText: 'testfile.txt' }).first().locator('.overlay').first();
    await expect(confirmDialog).toBeVisible();
    const button = confirmDialog.locator('button', { hasText: 'No' }).first();
    await expect(button).toBeVisible();
    await button.click();
    const rejectedDialogOverlay = page1.locator('confirm-dialog', { hasText: 'Transfer rejection' }).locator('.overlay');
    await rejectedDialogOverlay.waitFor({ state: 'visible', timeout: 15000 });
  });
});
