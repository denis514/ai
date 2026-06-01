import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { LocaleProvider } from './i18n/LocaleContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { migrateLegacyHash } from './hooks/useHashRoute.js';
import './index.css';

// Обратная совместимость: старые ссылки '#/<lang>/<type>/<id>' → новый путь.
// Делаем ДО первого рендера, чтобы роутер сразу читал корректный pathname.
migrateLegacyHash();

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
