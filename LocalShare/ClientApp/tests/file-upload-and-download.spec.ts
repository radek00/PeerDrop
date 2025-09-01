/// <reference types="node" />
import { test, expect, Page, BrowserContext } from "@playwright/test";
import { readFile } from "fs";
import { getClientName } from "./utils/utils";

test.describe.parallel("File upload and download", () => {
  let context1: BrowserContext;
  let context2: BrowserContext;
  let page1: Page;
  let page2: Page;

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

  async function uploadFileToClient(
    senderPage: Page,
    receiverName: string,
    fileName: string,
    fileContent: string,
    size?: number
  ) {
    const connectedClient = senderPage
      .locator("connected-client", { hasText: receiverName })
      .first();
    await expect(connectedClient).toBeVisible();
    const label = connectedClient.locator("xpath=parent::label").first();
    const fileInput = label.locator('input[type="file"]').first();

    let buffer: Buffer<ArrayBuffer>;
    if (size) {
      buffer = Buffer.alloc(size).fill(fileContent);
    } else {
      buffer = Buffer.from(fileContent);
    }

    await fileInput.setInputFiles({
      name: fileName,
      mimeType: "text/plain",
      buffer: buffer,
    });
  }

  test("file is uploaded and received by connected client", async () => {
    const client2Name = await getClientName(page2);
    await uploadFileToClient(
      page1,
      client2Name,
      "testfile.txt",
      "Hello from client 1!"
    );

    const confirmDialog = page2
      .locator("confirm-dialog", { hasText: "testfile.txt" })
      .first();

    const button = confirmDialog.locator("button", { hasText: "Yes" }).first();
    await expect(button).toBeVisible();
    const downloadPromise = page2.waitForEvent("download");
    await button.click();
    const download = await downloadPromise;
    const filePath = await download.path();
    readFile(filePath, "utf8", (err, data) => {
      expect(err).toBeNull();
      expect(data).toBe("Hello from client 1!");
    });
    await page1.waitForTimeout(2000);
    const client = page1.locator("connected-client", { hasText: client2Name });
    await expect(client).toBeVisible();

    const waveProgress = client.locator("wave-progress");
    const checkmark = waveProgress.getByTestId("upload-success");
    await checkmark.waitFor({ state: "visible", timeout: 15000 });
    await expect(checkmark).toBeVisible();
  });

  test("file upload can be cancelled", async () => {
    const client2Name = await getClientName(page2);
    await uploadFileToClient(
      page1,
      client2Name,
      "testfile.txt",
      "Hello from client 1!",
      40 * 1024 * 1024 // 40MB
    );

    const confirmDialog = page2
      .locator("confirm-dialog", { hasText: "testfile.txt" })
      .first();

    const button = confirmDialog.locator("button", { hasText: "Yes" }).first();
    await expect(button).toBeVisible();
    const downloadPromise = page2.waitForEvent("download");
    await button.click();
    (await downloadPromise).cancel();

    const cancellationDialog = page1
      .locator("confirm-dialog", { hasText: "Transfer cancelled" })
      .first();

    const confirmationButton = cancellationDialog
      .locator("button", { hasText: "OK" })
      .first();
    await expect(confirmationButton).toBeVisible();
    await confirmationButton.click();

    const client = page1.locator("connected-client", { hasText: client2Name });
    await expect(client).toBeVisible();

    const waveProgress = client.locator("wave-progress");
    const error = waveProgress.getByTestId("upload-error");
    await error.waitFor({ state: "visible", timeout: 15000 });
    await expect(error).toBeVisible();
  });

  test("File transfer can be rejected by the recipient", async () => {
    const client2Name = await getClientName(page2);
    await uploadFileToClient(
      page1,
      client2Name,
      "testfile.txt",
      "Hello from client 1!"
    );

    const confirmDialog = page2
      .locator("confirm-dialog", { hasText: "testfile.txt" })
      .first();

    const button = confirmDialog.locator("button", { hasText: "No" }).first();
    await expect(button).toBeVisible();
    await button.click();
    const rejectedDialog = page1
      .locator("confirm-dialog div", {
        hasText: "File transfer rejected by the recipient",
      })
      .first();

    await rejectedDialog.waitFor({ state: "visible", timeout: 15000 });
    await expect(rejectedDialog).toBeVisible();
  });
});
