import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { OrderProvider } from './context/OrderContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <ErrorBoundary><OrderProvider><App /></OrderProvider></ErrorBoundary>
        <Toaster position="top-center" toastOptions={{ style: { background: '#3B2418', color: '#FFF8ED' } }} />
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
