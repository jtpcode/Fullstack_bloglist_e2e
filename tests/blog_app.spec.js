const { test, expect, beforeEach, describe, afterAll } = require('@playwright/test')

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

  afterAll(async ({ request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('Blogs')
    await expect(locator).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByRole('button', { name: 'Login' }).click()
      await page.getByTestId('username').fill('testhep')
      await page.getByTestId('password').fill('salaisuus')
      await page.getByRole('button', { name: 'Log in' }).click()

      await expect(page.getByText('Create a new blog')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByRole('button', { name: 'Login' }).click()
      await page.getByTestId('username').fill('testhep')
      await page.getByTestId('password').fill('wrong')
      await page.getByRole('button', { name: 'Log in' }).click()

      await expect(page.getByText('Wrong credentials.')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Login' }).click()
      await page.getByTestId('username').fill('testhep')
      await page.getByTestId('password').fill('salaisuus')
      await page.getByRole('button', { name: 'Log in' }).click()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'New blog' }).click()
      await page.getByTestId('title').fill('Testiblogin otsikko')
      await page.getByTestId('author').fill('Kirjoittaja')
      await page.getByTestId('url').fill('www.test.fi')
      await page.getByRole('button', { name: 'Create' }).click()
      await expect(page.getByText('New blog "Testiblogin otsikko" added')).toBeVisible()
    })
  })
  
  describe('When there already is at least one blog', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Login' }).click()
      await page.getByTestId('username').fill('testhep')
      await page.getByTestId('password').fill('salaisuus')
      await page.getByRole('button', { name: 'Log in' }).click()

      await page.getByRole('button', { name: 'New blog' }).click()
      await page.getByTestId('title').fill('Testiblogin otsikko')
      await page.getByTestId('author').fill('Kirjoittaja')
      await page.getByTestId('url').fill('www.test.fi')
      await page.getByRole('button', { name: 'Create' }).click()
    })

    test('a blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'View' }).click()
      await page.getByRole('button', { name: 'Like' }).click()
      await expect(page.getByText('Blog "Testiblogin otsikko" liked')).toBeVisible()
      await expect(page.getByText('1 likes')).toBeVisible()
    })

    test('a blog can be deleted by the user who created it', async ({ page }) => {
      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm')
        await dialog.accept()
      })

      await page.getByRole('button', { name: 'View' }).click()
      await page.getByRole('button', { name: 'Delete' }).click()
      await expect(page.getByText('Blog "Testiblogin otsikko" deleted')).toBeVisible()
    })

    test('delete button can be seen only by the creator of the blog', async ({ page, request }) => {
      await page.getByRole('button', { name: 'View' }).click()
      await expect(page.getByText('Delete')).toBeVisible()
      await page.getByRole('button', { name: 'Logout' }).click()

      await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'Toinen kaveri',
          username: 'toikav',
          password: 'sekretti'
        }
      })
      await page.getByTestId('username').fill('toikav')
      await page.getByTestId('password').fill('sekretti')
      await page.getByRole('button', { name: 'Log in' }).click()
      await page.getByRole('button', { name: 'View' }).click()
      await expect(page.getByText('Delete')).not.toBeVisible()
    })
  })
})
