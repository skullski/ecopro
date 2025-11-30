import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import ConfirmPage from './pages/ConfirmPage';
import ThankYouPage from './pages/ThankYouPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BotSettingsPage from './pages/BotSettingsPage';
import ProductsPage from './pages/ProductsPage';
import StorefrontPage from './pages/StorefrontPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/bot-settings" element={<BotSettingsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/store/:clientId" element={<StorefrontPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
