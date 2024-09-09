import { test } from '@playwright/test';
const timeout = 600000;
const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;
const COURSE = process.env.COURSE;
const MODULE = process.env.MODULE;
const URL = process.env.URL;

let iteration = 0;

const navigateToNextActivity = async (page) => {
  let nextActivityLink = page.locator('a:has-text("Next Activity")');
  console.log(nextActivityLink + " found next activity link");
  while (await nextActivityLink.count() > 0) {
    iteration++;
    console.log('Completed iterations: ' + iteration);
    await nextActivityLink.waitFor({ state: 'visible', timeout: timeout });
    await Promise.all([
      nextActivityLink.click(),
      page.waitForLoadState('networkidle')
    ]);

    if (await page.getByRole('button', { name: 'Attempt quiz' }).isVisible()) {
      await page.getByRole('button', { name: 'Attempt quiz' }).click();

      const startAttemptButton = page.getByRole('button', { name: 'Start attempt' });
      if (await startAttemptButton.isVisible()) {
        await page.screenshot({ path: 'screenshots/start_attempt_modal.png', fullPage: true });
        console.log('Start attempt modal found. Screenshot taken.');
        return;
      }
      
      const answer1Locator1 = page.locator('[id*="_answer1_label"]').nth(0);
      const answer1Locator2 = page.locator('[id*="_answer1_label"]').nth(1);
      
      await answer1Locator1.getByText('b.').click();
      await answer1Locator2.getByText('b.').click();
      
      await page.getByRole('button', { name: 'Finish attempt' }).click();
      await page.getByRole('button', { name: 'Submit all and finish' }).click();
      
      const submitModalButton = page.getByLabel('Submit all your answers and').getByRole('button', { name: 'Submit all and finish' });
      await submitModalButton.click();

      await page.waitForSelector('text=Your attempt has been submitted', { state: 'hidden', timeout: timeout });
      
    } else if (await page.getByRole('button', { name: 'Re-attempt quiz' }).isVisible()) {
      console.log('Skipping quiz re-attempt');
    }

    nextActivityLink = page.locator('a:has-text("Next Activity")');
  }
};

test('test', async ({ page }) => {
  test.setTimeout(timeout);

  await page.goto(URL);
  await page.screenshot({ path: 'screenshots/initial.png', fullPage: true });
  await page.getByPlaceholder('Username').fill(USER_NAME);
  await page.getByPlaceholder('Password').fill(PASSWORD);
  await page.screenshot({ path: 'screenshots/login.png', fullPage: true });
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.getByRole('link', { name: COURSE }).click();
  await page.getByRole('link', { name: MODULE }).click();

  const initDiv = page.locator('.single-card').nth(1).locator('div').first();
  await initDiv.click();

  await navigateToNextActivity(page);

  await page.screenshot({ path: 'screenshots/final_screenshot.png', fullPage: true });
});
