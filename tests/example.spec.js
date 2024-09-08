import { test } from '@playwright/test';
const timeout = 60000;
const user_name=process.env.USER_NAME
const password = process.env.PASSWORD
const course = process.env.COURSE
const module = process.env.MODULE
const amityonline = process.env.URL

let iteration = 0;

const navigateToNextActivity = async (page) => {
  let nextActivityLink = page.locator('a:has-text("Next Activity")');
  
  while (await nextActivityLink.count() > 0) {
    iteration++;
    console.log('completed itrations :'+ iteration)
    await nextActivityLink.waitFor({ state: 'visible', timeout: timeout });
    await Promise.all([
      nextActivityLink.click(),
      page.waitForLoadState('networkidle')
    ]);


    if (await page.getByRole('button', { name: 'Attempt quiz' }).isVisible()) {
      await page.getByRole('button', { name: 'Attempt quiz' }).click();
      const answer1Locator1 = page.locator('[id*="_answer1_label"]').nth(0);
      const answer1Locator2 = page.locator('[id*="_answer1_label"]').nth(1);
      
      await answer1Locator1.getByText('b.').click();
      await answer1Locator2.getByText('b.').click();
      
      await page.getByRole('button', { name: 'Finish attempt' }).click();
      await page.getByRole('button', { name: 'Submit all and finish' }).click();
      await page.getByLabel('Submit all your answers and').getByRole('button', { name: 'Submit all and finish' }).click();
    }

    nextActivityLink = page.locator('a:has-text("Next Activity")');
  }

};

test('test', async ({ page }) => {
  console.log(user_name);
  console.log(password);
  console.log(user_name);
  console.log(course);
  console.log(module);
  
  test.setTimeout(timeout);

  await page.goto(amityonline);
  await page.screenshot({ path: 'final_screenshot.png', fullPage: true });
  await page.getByPlaceholder('Username').fill(user_name);
  await page.getByPlaceholder('Password').fill(password);
  await page.screenshot({ path: 'final_screenshot.png', fullPage: true });
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.getByRole('link', { name: course }).click();
  // await page.getByRole('link', { name: module }).click();
  await page.getByRole('link', { name: module }).click();
  // await page.getByRole('link', { name: start }).click();

  const initDiv = page.locator('.single-card').nth(1).locator('div').first();
  await initDiv.click();

  
  await navigateToNextActivity(page);


  await page.screenshot({ path: 'final_screenshot.png', fullPage: true });
});

