import { test, expect, Page, BrowserContext } from "@playwright/test";

const uaClient1 =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36 TestClient/1.0";
const expectedOsClient1 = "Windows";
const expectedDeviceClient1 = "Chrome";

const uaClient2 =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/99.0 TestClient/2.0";
const expectedOsClient2 = "Mac OS X";
const expectedDeviceClient2 = "Firefox";

async function getClientName(page: Page): Promise<string> {
  const nameElement = page.getByTestId("client-name").first();
  await expect(nameElement).toBeVisible();
  const name = await nameElement.innerText();
  expect(name).not.toBe("");
  return name;
}

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

test.describe("Peer Discovery and Information", () => {
  let context1: BrowserContext;
  let page1: Page;
  let context2: BrowserContext;
  let page2: Page;

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

  test("clients should correctly see each other with name, OS, and device information", async () => {
    await page1.goto("/");
    await page2.goto("/");

    const client1Name = await getClientName(page1);
    const client2Name = await getClientName(page2);
    console.log(`Client 1 Name: ${client1Name}`);
    console.log(`Client 2 Name: ${client2Name}`);

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

    for (let i = 0; i < pages.length; i++) {
      const currentPage = pages[i];
      for (let j = 0; j < currentPage.expectedClients.length; j++) {
        const clientName = currentPage.expectedClients[j];
        const clients = currentPage.page.locator("connected-client", {
          hasText: clientName,
        });
        await expect(clients).toBeVisible();
      }
    }
    const pageToClose = pages.pop();
    await pageToClose!.page.close();

    for (let i = 0; i < pages.length; i++) {
      const currentPage = pages[i];
      const clients = currentPage.page.locator("connected-client", {
        hasText: client3Name,
      });
      await expect(clients).toHaveCount(0);
    }
  });
});
