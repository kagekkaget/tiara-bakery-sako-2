import { Suspense, lazy, useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import { CartProvider } from "./store/CartContext";
import { AuthProvider } from "./store/AuthContext";
import { SettingsProvider } from "./store/SettingsContext";
import ProtectedRoute from "./components/ProtectedRoute";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/DashboardPage"));
const AdminProducts = lazy(() => import("./pages/admin/ProductsPage"));
const AdminOrders = lazy(() => import("./pages/admin/OrdersPage"));
const AdminSettings = lazy(() => import("./pages/admin/SettingsPage"));
const AdminLogin = lazy(() => import("./pages/admin/LoginPage"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>Memuat...</p>
    </div>
  );
}

function StoreLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <CartDrawer />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <SettingsProvider>
        <AuthProvider>
          <HashRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route
                  path="/"
                  element={
                    <StoreLayout>
                      <HomePage />
                    </StoreLayout>
                  }
                />
                <Route
                  path="/produk"
                  element={
                    <StoreLayout>
                      <ProductsPage />
                    </StoreLayout>
                  }
                />
                <Route
                  path="/tentang"
                  element={
                    <StoreLayout>
                      <AboutPage />
                    </StoreLayout>
                  }
                />
                <Route
                  path="/kontak"
                  element={
                    <StoreLayout>
                      <ContactPage />
                    </StoreLayout>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <StoreLayout>
                      <CheckoutPage />
                    </StoreLayout>
                  }
                />
                <Route
                  path="*"
                  element={
                    <StoreLayout>
                      <HomePage />
                    </StoreLayout>
                  }
                />
              </Routes>
            </Suspense>
          </HashRouter>
        </AuthProvider>
      </SettingsProvider>
    </CartProvider>
  );
}
