import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import LandingPage from './pages/landing';
import OnboardingPage from './pages/onboarding';
import PaymentPage from './pages/payment';
import DashboardPage from './pages/dashboard';
import NotFoundPage from './pages/notfound';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh flex-col">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
