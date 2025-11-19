import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./Pages/Login";
import OTP from "./Pages/Otp";
import Dashboard from "./Pages/Dashboard";
import AccountDetails from "./Pages/AccountDetails";
import Transactions from "./Pages/Transactions";
import Payouts from "./Pages/Payouts";
import Users from "./Pages/Users";
import Companies from "./Pages/Companies";
import RolesPermissions from "./Pages/RolesPermissions";
import UserDetails from "./Pages/UserDetails";
import CompanyDetails from "./Pages/CompanyDetails";
import CompanyTransactions from "./Pages/CompanyTransactions";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Fixed Protected Route Component - using localStorage directly to avoid hooks issues
const ProtectedRoute = ({ children }) => {
  // Direct localStorage check to avoid infinite re-renders
  const token = localStorage.getItem("authToken");
  const user = localStorage.getItem("user");
  const isAuthenticated = !!(token && user);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// OTP Route Protection - allows access only when coming from login with 2FA data
const OTPRoute = ({ children }) => {
  // Check if we have OTP data in sessionStorage (temporary storage for OTP flow)
  const otpData = sessionStorage.getItem("otpData");
  const hasOTPData = !!otpData;

  return hasOTPData ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/otp"
              element={
                <OTPRoute>
                  <OTP />
                </OTPRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payouts"
              element={
                <ProtectedRoute>
                  <Payouts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <Companies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles-permissions"
              element={
                <ProtectedRoute>
                  <RolesPermissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:id"
              element={
                <ProtectedRoute>
                  <AccountDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company-transactions/:id"
              element={
                <ProtectedRoute>
                  <CompanyTransactions />
                </ProtectedRoute>
              }
            />
              <Route
              path="/users/:id"
              element={
                <ProtectedRoute>
                  <UserDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/:id"
              element={
                <ProtectedRoute>
                  <CompanyDetails />
                </ProtectedRoute>
              }
            />
          </Routes>
          
        </Router>
      </AuthProvider>

      {/* React Query DevTools - always show during development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
