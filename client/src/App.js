import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Customer Pages
import MenuPage from './pages/MenuPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderStatusPage from './pages/OrderStatusPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminTables from './pages/admin/AdminTables';
import AdminLayout from './components/admin/AdminLayout';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#C8A96E', dark: '#A8853E', light: '#F0DDB3' },
    secondary: { main: '#5B9CF6' },
    background: { default: '#0D0D0D', paper: '#161616' },
    success: { main: '#4CAF82' },
    warning: { main: '#F5A623' },
    error: { main: '#E05C5C' },
    text: { primary: '#F5F0E8', secondary: '#9E9E9E' },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Playfair Display", serif' },
    h2: { fontFamily: '"Playfair Display", serif' },
    h3: { fontFamily: '"Playfair Display", serif' },
    h4: { fontFamily: '"Playfair Display", serif' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, fontFamily: '"DM Sans", sans-serif' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)' },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: '#1E1E1E',
                  color: '#F5F0E8',
                  border: '1px solid rgba(200,169,110,0.3)',
                  fontFamily: '"DM Sans", sans-serif',
                  borderRadius: '12px',
                },
                success: { iconTheme: { primary: '#4CAF82', secondary: '#0D0D0D' } },
                error: { iconTheme: { primary: '#E05C5C', secondary: '#0D0D0D' } },
              }}
            />
            <Routes>
              {/* Customer Routes */}
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/order/confirmation" element={<OrderConfirmationPage />} />
              <Route path="/order/status/:orderId" element={<OrderStatusPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="tables" element={<AdminTables />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
