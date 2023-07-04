import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('init painter', async ({ page }) => {
  const canvas = await page.$('.paint-container canvas')

  const visible = await canvas?.isVisible()
  expect(visible).toBeTruthy()

  const shapeIcons = await page.$$('.shape-icon')

  expect(shapeIcons.length).toBe(6)

  for (const btn of shapeIcons.slice(1)) {
    expect(await btn.getAttribute('class')).not.toContain('is-active')
    await btn.click()
    expect(await btn.getAttribute('class')).toContain('is-active')
  }
})

test('color picker', async ({ page }) => {
  const colorPicker = await page.$('.operation-menu-bar .n-color-picker-trigger__value')
  expect(await colorPicker?.innerText()).toContain('#000')

  await colorPicker?.click()
  expect(await colorPicker?.isVisible()).toBeTruthy()

  const colorInput = await page.$('.n-color-picker-control .n-input__input-el')

  const newColor = '#ccc'
  await colorInput?.focus()
  colorInput?.fill(newColor)

  const confirmBtn = await page.$('.n-color-picker-action button')
  await confirmBtn?.click()
  await page.waitForTimeout(500)

  expect(await colorInput?.isVisible()).toBeFalsy()
  expect(await colorPicker?.innerText()).toContain(newColor)
})
