import { expect, type Locator, type Page } from '@playwright/test';

export class CreateAccountPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly signUpButton: Locator;
    readonly emailError: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByPlaceholder('E-Mail');
        this.passwordInput = page.getByPlaceholder('Password');
        this.firstNameInput = page.getByPlaceholder('First Name');
        this.lastNameInput = page.getByPlaceholder('Last Name');
        this.signUpButton = page.getByRole('button', { name: 'Sign up', exact: true });
    };

    async goto() {
        await this.page.goto('https://admin.basta.ai/auth/registration?return_to=https%3A%2F%2Fadmin.basta.ai');
    };

    async fill(input) {
        await this.emailInput.fill(input.email);
        await this.passwordInput.fill(input.password);
        await this.firstNameInput.fill(input.firstName);
        await this.lastNameInput.fill(input.lastName);
    };

    async clickSignUpButton() {
        await this.signUpButton.click();
    };

    async verify(verificationCode: string) {
        await this.page.getByPlaceholder('Verification code').fill(verificationCode);
        await this.page.getByText('Submit').click();
    };

    async assertAccountCreation() {
        await expect(this.page).toHaveURL('https://admin.basta.ai/');
        await expect(this.page.getByText('Welcome')).toBeVisible();
        await expect(this.page.getByRole('heading').nth(1)).toHaveText('0');
        await expect(this.page.getByRole('heading').nth(2)).toHaveText('0');
        await expect(this.page.getByRole('heading').nth(3)).toHaveText('$0.00');
    }
};