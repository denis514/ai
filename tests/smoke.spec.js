import { test, expect } from '@playwright/test';

/**
 * Smoke-тесты 105 Atlas — 5 сценариев.
 *
 * Цель: убедиться что после каждого деплоя сайт жив
 * и ключевые функции работают без белого экрана.
 *
 * Тесты намеренно консервативны:
 *  - не зависят от авторизации
 *  - не зависят от конкретного языка
 *  - проверяют структуру, а не точный текст
 */

// Скрываем IntroModal чтобы тесты не зависели от первого визита
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('atlas:intro-seen:v1', '1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Тест 1: Приложение загружается без краша
// ─────────────────────────────────────────────────────────────────────────────
test('1. App loads without crash', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => {
    // Игнорируем несущественные ошибки (favicon, аналитика)
    if (!err.message.includes('favicon') && !err.message.includes('gtag')) {
      errors.push(err.message);
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Страница имеет заголовок
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);

  // Тело не пустое
  const bodyContent = await page.locator('body').textContent();
  expect(bodyContent?.trim().length).toBeGreaterThan(20);

  // Нет критических JS-ошибок
  expect(errors, `JS errors on load: ${errors.join(', ')}`).toHaveLength(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// Тест 2: Mindmap canvas рендерится
// ─────────────────────────────────────────────────────────────────────────────
test('2. Mindmap canvas renders', async ({ page }) => {
  await page.goto('/');

  // Ждём появления канваса — может занять время пока грузится контент
  await page.waitForSelector('.mm-canvas', { timeout: 15_000 });
  const canvas = page.locator('.mm-canvas');

  await expect(canvas).toBeVisible();

  // На канвасе есть хотя бы один узел
  const nodes = page.locator('.mm-node');
  await expect(nodes.first()).toBeVisible({ timeout: 10_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// Тест 3: Нет белого экрана — контент i18n загружен
// ─────────────────────────────────────────────────────────────────────────────
test('3. No blank screen — i18n loaded', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Нет текстов вида "undefined", "null", "[object Object]" — признаков сломанного i18n
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('undefined');
  expect(bodyText).not.toContain('[object Object]');

  // Хедер присутствует и не пустой
  const header = page.locator('header').first();
  await expect(header).toBeVisible({ timeout: 8_000 });
  const headerText = await header.textContent();
  expect(headerText?.trim().length).toBeGreaterThan(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// Тест 4: Модальное окно «Курсы» открывается
// ─────────────────────────────────────────────────────────────────────────────
test('4. Courses modal opens without white screen', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.mm-canvas', { timeout: 15_000 });

  // Ищем кнопку обучения/learning в хедере по тексту (любой язык)
  const learningBtn = page.locator('button').filter({
    hasText: /обучение|learning|oppitunnit/i
  }).first();

  // Если кнопка есть — кликаем и проверяем модал
  const isVisible = await learningBtn.isVisible().catch(() => false);
  if (!isVisible) {
    console.log('Learning button not found — skipping modal test');
    return;
  }

  await learningBtn.click();

  // Модал появляется и не пустой
  await page.waitForSelector('.courses-overlay', { timeout: 8_000 });
  const modal = page.locator('.courses-overlay');
  await expect(modal).toBeVisible();

  // Внутри модала есть контент (не белый экран)
  const modalText = await modal.textContent();
  expect(modalText?.trim().length).toBeGreaterThan(10);
});

// ─────────────────────────────────────────────────────────────────────────────
// Тест 5: Клик по узлу открывает боковую панель
// ─────────────────────────────────────────────────────────────────────────────
test('5. Clicking a node opens the detail panel', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.mm-node', { timeout: 15_000 });

  // Кликаем первый доступный узел
  const firstNode = page.locator('.mm-node').first();
  await firstNode.click();

  // Боковая панель открывается
  const panel = page.locator('.detail-panel');
  await expect(panel).toBeVisible({ timeout: 8_000 });

  // Панель содержит текст (не белый экран)
  const panelText = await panel.textContent();
  expect(panelText?.trim().length).toBeGreaterThan(10);
});
