import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./components/MainLayout";
import WalletConnectButton from "./components/WalletConnectButton";

// Import all application page views
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import MarketplacePage from "./pages/MarketplacePage";
import TradeRoomPage from "./pages/TradeRoomPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import DocsPage from "./pages/DocsPage";

export default function App() {
  // Lift wallet state globally so the dashboard and trading rooms sync smoothly
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  return (
    <Router>
      <Routes>
        {/* The Landing Page renders standalone to maintain its clean, minimal intro design */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              connectedAddress={connectedAddress} 
              onConnect={setConnectedAddress} 
            />
          } 
        />

        {/* Core application features are wrapped in your matching MainLayout shell */}
        <Route
          path="/onboarding"
          element={
            <MainLayout
              walletComponent={
                <WalletConnectButton
                  connectedAddress={connectedAddress}
                  onConnect={setConnectedAddress}
                />
              }
            >
              <OnboardingPage />
            </MainLayout>
          }
        />

        <Route
          path="/marketplace"
          element={
            <MainLayout
              walletComponent={
                <WalletConnectButton
                  connectedAddress={connectedAddress}
                  onConnect={setConnectedAddress}
                />
              }
            >
              <MarketplacePage />
            </MainLayout>
          }
        />

        <Route
          path="/trade/:id"
          element={
            <MainLayout
              walletComponent={
                <WalletConnectButton
                  connectedAddress={connectedAddress}
                  onConnect={setConnectedAddress}
                />
              }
            >
              <TradeRoomPage />
            </MainLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <MainLayout
              walletComponent={
                <WalletConnectButton
                  connectedAddress={connectedAddress}
                  onConnect={setConnectedAddress}
                />
              }
            >
              <DashboardPage />
            </MainLayout>
          }
        />

        <Route
          path="/about"
          element={
            <MainLayout
              walletComponent={
                <WalletConnectButton
                  connectedAddress={connectedAddress}
                  onConnect={setConnectedAddress}
                />
              }
            >
              <AboutPage />
            </MainLayout>
          }
        />

        <Route
          path="/docs"
          element={
            <MainLayout
              walletComponent={
                <WalletConnectButton
                  connectedAddress={connectedAddress}
                  onConnect={setConnectedAddress}
                />
              }
            >
              <DocsPage />
            </MainLayout>
          }
        />

        {/* Fallback Catch-all Route redirecting users to the landing terminal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
