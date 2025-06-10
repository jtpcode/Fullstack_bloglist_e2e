const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Testi Heppu',
        username: 'testhep',
        password: 'salaisuus'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('Blogs')
    await expect(locator).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  // describe('Login', () => {
  //   test('succeeds with correct credentials', async ({ page }) => {
  //     // ...
  //   })

  //   test('fails with wrong credentials', async ({ page }) => {
  //     // ...
  //   })
  // })

  // describe('When logged in', () => {
  //   beforeEach(async ({ page }) => {
  //     // ...
  //   })

  //   test('a new blog can be created', async ({ page }) => {
  //     // ...
  //   })
  // })
})