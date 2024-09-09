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
      if (await answer1Locator1.isVisible()) {
        await answer1Locator1.getByText('b.').click();
        console.log('First answer clicked');
      } else {
        console.log('First answer not found, skipping');
      }

      const answer1Locator2 = page.locator('[id*="_answer1_label"]').nth(1);

      // Conditionally check if the second answer locator exists before interacting
      if (await answer1Locator2.count() > 0 && await answer1Locator2.isVisible()) {
        await answer1Locator2.getByText('b.').click();
        console.log('Second answer clicked');
      } else {
        console.log('Second answer not found, skipping');
      }


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



async function tryClickCardWithFallback(page) {
  const firstCard = page.locator('.single-card').nth(COURSE==='Course name Computational Statistics' ? 0 :1).locator('div').first();
  // Helper function to check if the page has navigated successfully
  async function didNavigate() {
    try {
      // Adjust this condition based on your expected navigation outcome
      // For example, you can wait for a specific element or URL change
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      return true;
    } catch (e) {
      return false;
    }
  }

  // Try clicking the first card
  console.log('Clicking the first card...');
  await firstCard.click();

  // Check if the first click worked
  if (await didNavigate()) {
    console.log('Successfully navigated after clicking the first card.');
    return; // Exit if successful
  }

  // Fallback: Try clicking the second card if the first one didn't work
  console.log('First card did not navigate. Clicking the second card...');
  await secondCard.click();

  // Check if the second click worked
  if (await didNavigate()) {
    console.log('Successfully navigated after clicking the second card.');
  } else {
    console.log('Second card did not work either.');
  }
}


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

  // const initDiv = page.locator('.single-card').nth(0).locator('div').first();
  // await initDiv.click();

  await tryClickCardWithFallback(page);

  await navigateToNextActivity(page);

  await page.screenshot({ path: 'screenshots/final_screenshot.png', fullPage: true });
});
