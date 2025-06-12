import { test, expect, Page, BrowserContext } from '@playwright/test';

const uaClient1 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36 TestClient/1.0";
const expectedOsClient1 = "Windows";
const expectedDeviceClient1 = "Chrome";

const uaClient2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/99.0 TestClient/2.0";
const expectedOsClient2 = "Mac OS X";
const expectedDeviceClient2 = "Firefox";

async function getClientName(page: Page): Promise<string> {
  const nameElement = page.getByTestId("client-name").first();
  await expect(nameElement).toBeVisible();
  const name = await nameElement.innerText();
  expect(name).not.toBe('');
  return name;
}

async function verifyRemoteClientDetails(
  page: Page,
  remoteClientName: string,
  remoteClientExpectedOs: string,
  remoteClientExpectedDevice: string
) {
  // Wait for the client-wrapper to contain at least one connected-client, indicating discovery has started
  const connectedClient = page.locator("connected-client").first();
  await expect(connectedClient).toBeVisible();


    await expect(connectedClient).toContainText(remoteClientName);
  await expect(connectedClient).toContainText(remoteClientExpectedOs);
  await expect(connectedClient).toContainText(remoteClientExpectedDevice);
}

test.describe('Peer Discovery and Information', () => {
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

  test('clients should correctly see each other with name, OS, and device information', async () => {
    await page1.goto('https://localhost:3000/');
    await page2.goto('https://localhost:3000/');

    const client1Name = await getClientName(page1);
    const client2Name = await getClientName(page2);
    console.log(`Client 1 Name: ${client1Name}`);
    console.log(`Client 2 Name: ${client2Name}`);

    await verifyRemoteClientDetails(page2, client1Name, expectedOsClient1, expectedDeviceClient1);

    await verifyRemoteClientDetails(page1, client2Name, expectedOsClient2, expectedDeviceClient2);
  });

  test('Client is removed from connected clients when disconnected', async () => {
    const page3 = await context1.newPage();
    await page1.goto('https://localhost:3000/');
    await page2.goto('https://localhost:3000/');
    await page3.goto('https://localhost:3000/');

    [page1, page2, page3].forEach(async (page) => {
      const clients = page.locator("connected-client");
      await expect(clients).toHaveCount(2);
    })

    const pages = [page1, page2, page3];

    for (let i = 0; i < pages.length; i++) {
      const currentPage = pages[i];
      const clients = currentPage.locator("connected-client");
      await expect(clients).toHaveCount(2);
    }
    const pageToClose = pages.pop();
    await pageToClose!.close();

    for (let i = 0; i < pages.length; i++) {
      const currentPage = pages[i];
      const clients = currentPage.locator("connected-client");
      await expect(clients).toHaveCount(1);
    }
  }
)
});
