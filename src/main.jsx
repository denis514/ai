import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { LocaleProvider } from './i18n/LocaleContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LocaleProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LocaleProvider>
  </React.StrictMode>
);
