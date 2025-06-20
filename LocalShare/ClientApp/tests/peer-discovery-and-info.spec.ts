import { test, expect, Page } from "@playwright/test";
import { getClientName } from "./utils/utils";

const uaClient1 =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36 TestClient/1.0";
const expectedOsClient1 = "Windows";
const expectedDeviceClient1 = "Chrome";

const uaClient2 =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/99.0 TestClient/2.0";
const expectedOsClient2 = "Mac OS X";
const expectedDeviceClient2 = "Firefox";

test.describe.parallel("Peer Discovery and Information", () => {
  let context1;
  let page1;
  let context2;
  let page2;

  test.beforeEach(async ({ browser }) => {
    context1 = await browser.newContext({ userAgent: uaClient1 });
    page1 = await context1.newPage();
    context2 = await browser.newContext({ userAgent: uaClient2 });
    page2 = await context2.newPage();
  });

  test.afterEach(async () => {
    await page1.close();
    await context1.close();
    await page2.close();
    await context2.close();
  });

  async function verifyRemoteClientDetails(
    page: Page,
    remoteClientName: string,
    remoteClientExpectedOs: string,
    remoteClientExpectedDevice: string
  ) {
    const connectedClient = page
      .locator("connected-client", { hasText: remoteClientName })
      .first();
    await expect(connectedClient).toBeVisible();
    await expect(connectedClient).toContainText(remoteClientName);
    await expect(connectedClient).toContainText(remoteClientExpectedOs);
    await expect(connectedClient).toContainText(remoteClientExpectedDevice);
  }

  test("clients should correctly see each other with name, OS, and device information", async () => {
    await page1.goto("/");
    await page2.goto("/");

    const client1Name = await getClientName(page1);
    const client2Name = await getClientName(page2);

    await verifyRemoteClientDetails(
      page2,
      client1Name,
      expectedOsClient1,
      expectedDeviceClient1
    );

    await verifyRemoteClientDetails(
      page1,
      client2Name,
      expectedOsClient2,
      expectedDeviceClient2
    );
  });

  test("Client is removed from connected clients when disconnected", async () => {
    const page3 = await context1.newPage();
    await page1.goto("/");
    await page2.goto("/");
    await page3.goto("/");

    const client1Name = await getClientName(page1);
    const client2Name = await getClientName(page2);
    const client3Name = await getClientName(page3);

    const pages = [
      { page: page1, expectedClients: [client2Name, client3Name] },
      { page: page2, expectedClients: [client1Name, client3Name] },
      { page: page3, expectedClients: [client1Name, client2Name] },
    ];

    for (const currentPage of pages) {
      for (const clientName of currentPage.expectedClients) {
        const clients = currentPage.page.locator("connected-client", {
          hasText: clientName,
        });
        await expect(clients).toBeVisible();
      }
    }
    const pageToClose = pages.pop();
    if (pageToClose) {
      await pageToClose.page.close();
    }

    for (const currentPage of pages) {
      const clients = currentPage.page.locator("connected-client", {
        hasText: client3Name,
      });
      await expect(clients).toHaveCount(0);
    }
  });
});
