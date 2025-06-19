import { test, expect } from "@playwright/test";
import { readFile } from "fs";
import { getClientName } from "./utils/utils";

test.describe("File upload and download", () => {

  test("file is uploaded and received by connected client", async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto("/");
    await page2.goto("/");

    const client2Name = await getClientName(page2);

    const connectedClient = page1.locator("connected-client", { hasText: client2Name }).first();
    await expect(connectedClient).toBeVisible();

    const label = connectedClient.locator('xpath=parent::label').first();
    const fileInput = label.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: "testfile.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Hello from client 1!")
    });

    const confirmDialog = page2.locator('confirm-dialog', {hasText: 'testfile.txt'}).first().locator('.overlay').first();
    console.log(await confirmDialog.innerHTML());
    await expect(confirmDialog).toBeVisible({timeout: 15000});

    const button = confirmDialog.locator('button', { hasText: 'Yes' }).first();
    await expect(button).toBeVisible();
    const downloadPromise  = page2.waitForEvent('download');
    await button.click();

    const download = await downloadPromise;
    const filePath = await download.path();
    readFile(filePath, 'utf8',(err, data) => {
        expect(err).toBeNull();
        expect(data).toBe("Hello from client 1!");
    })

    await page1.close();
    await context1.close();
    await page2.close();
    await context2.close();
  });
});
