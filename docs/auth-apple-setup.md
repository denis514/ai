# Настройка «Войти через Apple» (Sign in with Apple)

> **СТАТУС: кнопка готова, но СКРЫТА.** В `src/components/AuthModal.jsx` есть
> флаг `const APPLE_SIGNIN_ENABLED = false`. Кнопка не показывается пользователям,
> пока флаг false. **После настройки провайдера (шаги ниже) — поставить `true`**
> и задеплоить. Так пользователи не видят нерабочую кнопку до покупки аккаунта.

Код кнопки и вызова уже в проекте (`authService.signInWithApple` + кнопка в
`AuthModal`). Чтобы вход реально работал, нужно один раз настроить провайдера —
это делается в **твоих** кабинетах (Apple + Supabase), я туда доступа не имею.

## Включить кнопку (после настройки)
1. Купить Apple Developer аккаунт и пройти шаги настройки ниже.
2. В `src/components/AuthModal.jsx` заменить `APPLE_SIGNIN_ENABLED = false` на `true`.
3. Собрать и задеплоить. Кнопка появится в окне входа.

## Что понадобится
- **Платный Apple Developer аккаунт** ($99/год) — без него Sign in with Apple
  недоступен.
- Доступ к проекту Supabase (Dashboard).

## Шаги (≈20–30 минут, один раз)

### 1. Apple Developer — создать идентификаторы
1. https://developer.apple.com → Certificates, Identifiers & Profiles.
2. **App ID** (Identifiers → +): тип App, включить галочку **Sign in with Apple**.
3. **Services ID** (Identifiers → +, тип Services): это и есть `client_id`
   (например `com.atlas105.web`). Включить **Sign in with Apple**, нажать
   **Configure**:
   - Primary App ID — выбрать App ID из шага 2.
   - **Domains**: `<твой-домен>` (например `105-atlas.vercel.app` и кастомный домен).
   - **Return URLs**: `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
     (точный URL — в Supabase → Authentication → Providers → Apple).
4. **Key** (Keys → +): включить **Sign in with Apple**, скачать `.p8` файл
   (даётся один раз!), запомнить **Key ID**. Записать свой **Team ID** (вверху справа).

### 2. Supabase — включить провайдера
1. Supabase Dashboard → Authentication → **Providers** → **Apple** → Enable.
2. Заполнить:
   - **Client IDs**: Services ID из шага 1.3 (`com.atlas105.web`).
   - **Secret Key**: Supabase сам сгенерирует JWT из `.p8` — вставь содержимое
     `.p8`, **Team ID**, **Key ID**, **Services ID** в форму (или сгенерируй
     client secret по инструкции Supabase и вставь готовый).
3. Скопировать **Callback URL** из этой же страницы и убедиться, что он указан в
   Return URLs Apple (шаг 1.3).
4. Сохранить.

### 3. Проверка
- Открыть окно входа → кнопка **«Войти через Apple»** → редирект на Apple →
  Face ID / пароль → возврат на сайт уже авторизованным.

## Важно
- **Без шагов 1–2 кнопка будет видна, но при клике вернёт ошибку** «provider not
  enabled». Это нормально до настройки.
- Apple отдаёт email только при ПЕРВОМ входе. Если тестируешь повторно и нужно
  снова получить email — отзови доступ в appleid.apple.com → Sign in with Apple.
- Apple требует, чтобы кнопка соответствовала их гайдлайнам (чёрная/белая,
  логотип Apple) — в коде так и сделано.
- **Секрет (.p8, ключи) — только в кабинете Supabase, не в репозитории.**

_Связано: `src/services/authService.js` (`signInWithApple`), `src/components/AuthModal.jsx`._
