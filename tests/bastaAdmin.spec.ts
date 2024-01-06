import { test, expect, chromium } from "@playwright/test";
import { createEmailAddress, getLatestEmail, type Email } from "../email-api";
import { EmailPage } from "../EmailPage";
import { CreateAccountPage } from "../CreateAccountPage";

test.describe("Creating Account --> valid inputs", () => {
  // test.beforeEach(async ({ page }) => {
  //     page.goto('https://admin.basta.ai/auth/registration?return_to=https%3A%2F%2Fadmin.basta.ai');
  // });

  test("Enter a valid username, a valid email, and a first and last name containing only alphabetic characters", async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const createAccountPage = new CreateAccountPage(await context.newPage());
    const emailPage = new EmailPage(await context.newPage());
    const emailAddress: string = createEmailAddress();

    const validInput = {
      email: emailAddress,
      password: "Xrtla42!",
      firstName: "Bob",
      lastName: "Burger",
    };

    await createAccountPage.goto();
    await createAccountPage.fill(validInput);
    // await expect(pswdInputElem).to(/[.]/); // Check password value is hidden
    await createAccountPage.clickSignUpButton();

    const email: Email = await getLatestEmail(emailAddress);
    await expect(email.from).toContain("basta");
    await expect(email.subject).toContain("verif");
    await emailPage.renderContent(email.html);
    const verificationCode: string = await emailPage.getVerificationCode();

    await createAccountPage.verify(verificationCode);
    await createAccountPage.assertAccountCreation();
  });
});

test.describe("Creating Accounts --> Invalid Inputs", () => {
  const invalidEmails = [
    "plainaddress",
    "#@%^%#$@#$@#.com",
    "@example.com",
    "Joe Smith <email@example.com>",
    "email.example.com",
    "email@example@example.com",
    ".email@example.com",
    "email.@example.com",
    "email..email@example.com",
    "email@example.com (Joe Smith)",
    "email@-example.com",
    "email@example.web",
    //"email@111.222.333.44444",
    "email@example..com",
    "Abc..123@example.com",
  ];

  /* Questionable emails that are technically valid: a@b, email@example, email@111.222.333.44444,
    this is a "admin" page, so you might want to allow emails like ben@support, or email@<IP address>
    for dev purposes. According to email standards an email *can* be 3 characters long, however many
    public facing apps do not allow for such short emails, many of them also require that there be
    at least one '.' symbol after the '@' symbol. */
  for (const email of invalidEmails) {
    test(`Email Address: ${email}, Should Be Invalid, All Other Inputs Valid`, async ({
      page,
    }) => {
      const invalidEmailInput = {
        email: email,
        password: "Testp@ss1",
        firstName: "Test",
        lastName: "User",
      };
      const createAccountPage = new CreateAccountPage(page);
      await createAccountPage.goto();
      await createAccountPage.fill(invalidEmailInput);
      await createAccountPage.clickSignUpButton();
      //id=":r6:-helper-text"
      await expect(createAccountPage.page.getByText('not valid "email"')).toBeVisible();
    });
  }
});
