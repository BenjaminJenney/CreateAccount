import { Locator, Page } from "@playwright/test";

const url = "http://email";

export class EmailPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async renderContent(content: string) {
    await this.page.route(url, (route) => {
      route.fulfill({ body: content });
    });
    await this.page.goto(url);
  }

  async getVerificationCode() {
    return await this.page.getByRole("strong").innerText();
  }
}
