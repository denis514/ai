import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright smoke-тесты для 105 Atlas.
 * Запускаются против продакшна: https://www.105-atlas.app
 *
 * Запуск локально:
 *   npm run test:smoke
 *
 * В GitHub Actions — автоматически после каждого push в main.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,       // 30 сек на тест
  retries: 1,            // 1 повтор при падении (нестабильный интернет)
  workers: 1,            // последовательно — тесты на одном сайте

  use: {
    baseURL: 'https://www.105-atlas.app',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    // Имитируем реального пользователя
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
});
