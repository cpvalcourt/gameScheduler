import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import GameSeriesPage from "./pages/GameSeriesPage";
import GamesPage from "./pages/GamesPage";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailsPage from "./pages/TeamDetailsPage";
import TeamInvitationPage from "./pages/TeamInvitationPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdvancedSchedulingPage from "./pages/AdvancedSchedulingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { I18nProvider } from "./contexts/I18nContext";

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <I18nProvider>
        <AuthProvider>
          <Router
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/verify-email/:token"
                element={<VerifyEmailPage />}
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game-series"
                element={
                  <ProtectedRoute>
                    <GameSeriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game-series/:seriesId/games"
                element={
                  <ProtectedRoute>
                    <GamesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams"
                element={
                  <ProtectedRoute>
                    <TeamsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams/:teamId"
                element={
                  <ProtectedRoute>
                    <TeamDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team-invitation/:token"
                element={
                  <ProtectedRoute>
                    <TeamInvitationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advanced-scheduling"
                element={
                  <ProtectedRoute>
                    <AdvancedSchedulingPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
