import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { LocaleProvider } from './i18n/LocaleContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { migrateLegacyHash } from './hooks/useHashRoute.js';
import { isOAuthPopup, finishOAuthPopup, isGcalPopup, finishGcalPopup } from './lib/oauthPopup.js';
import { supabase } from './lib/supabaseClient.js';
import { inject as injectVercelAnalytics } from '@vercel/analytics';
import './index.css';
import './App.css';

// Попап подключения Google Calendar: сообщаем основному окну и закрываемся.
if (isGcalPopup()) {
  document.getElementById('root').innerHTML =
    '<div style="font-family:system-ui,sans-serif;display:grid;place-items:center;' +
    'height:100vh;color:#888;font-size:14px">Готово. Окно закроется…</div>';
  finishGcalPopup();
// OAuth-попап входа: это окно вернулось с Google-редиректа. НЕ монтируем приложение —
// дожидаемся сессии, сообщаем основному окну и закрываемся.
} else if (isOAuthPopup()) {
  document.getElementById('root').innerHTML =
    '<div style="font-family:system-ui,sans-serif;display:grid;place-items:center;' +
    'height:100vh;color:#888;font-size:14px">Вход выполнен. Окно закроется…</div>';
  finishOAuthPopup(supabase);
} else {
  bootstrap();
}

function bootstrap() {

// Счётчик посещений Vercel Web Analytics: без cookies, не профилирует людей —
// только агрегированные просмотры страниц. Работает лишь на vercel.app-домене
// (локально скрипт не грузится — это нормально). Переходы внутри приложения
// (history.pushState) скрипт отслеживает сам.
injectVercelAnalytics();

// Обратная совместимость: старые ссылки '#/<lang>/<type>/<id>' → новый путь.
// Делаем ДО первого рендера, чтобы роутер сразу читал корректный pathname.
migrateLegacyHash();

// Пароль-заглушка снят — приложение открыто всем. Компонент PasswordGate.jsx
// оставлен в репозитории на случай, если потребуется вернуть закрытый режим.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LocaleProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LocaleProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

}
