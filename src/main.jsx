import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { LocaleProvider } from './i18n/LocaleContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { migrateLegacyHash } from './hooks/useHashRoute.js';
import { isOAuthPopup, finishOAuthPopup } from './lib/oauthPopup.js';
import { supabase } from './lib/supabaseClient.js';
import './index.css';
import './App.css';

// OAuth-попап: это окно вернулось с Google-редиректа. НЕ монтируем приложение —
// дожидаемся сессии, сообщаем основному окну и закрываемся.
if (isOAuthPopup()) {
  document.getElementById('root').innerHTML =
    '<div style="font-family:system-ui,sans-serif;display:grid;place-items:center;' +
    'height:100vh;color:#888;font-size:14px">Вход выполнен. Окно закроется…</div>';
  finishOAuthPopup(supabase);
} else {
  bootstrap();
}

function bootstrap() {

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
