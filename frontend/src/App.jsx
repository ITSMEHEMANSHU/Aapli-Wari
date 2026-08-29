import React from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useLanguage } from './context/LanguageContext';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import ChannelPage from './pages/ChannelPage';
import ContentDetail from './pages/ContentDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Contribute from './pages/Contribute';
import CreateChannel from './components/channel-management/CreateChannel';
import KnowledgePage from './pages/KnowledgePage';
// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OTPVerification from './components/auth/OTPVerification';
import { ContributorRegistration } from './pages/ContributorRegistration';
import { PalkhiPramukhRegistration } from './pages/PalkhiPramukhRegistration';

// Public Components
import Search from './components/public/Search';
import AIAssistant from './components/public/AIAssistant';
import AaplaTheva from './components/public/AaplaTheva';
import ChannelList from './components/public/ChannelList';
import ManageChannel from './components/channel-management/ManageChannel';
import ContributorManagement from './components/channel-management/ContributorManagement';
import PalkhiRegistration from './components/auth/PalkhiRegistration';
import MapPage from './pages/MapPage';

import ProtectedRoute from './components/common/ProtectedRoute';
//Admin
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import ContentManagement from './pages/Admin/ContentManagement';
import ChannelManagement from './pages/Admin/ChannelManagement';
import AdminChannelPage from './pages/Admin/AdminChannelPage';
import AdminContentDetail from './pages/Admin/AdminContentDetail';
import AdminSettings from './pages/Admin/Settings';

function AppShell() {
  const { language } = useLanguage();
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminUser = !!user && isAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF5EC]" lang={language}>
      {!isAdminRoute && !loading && <Header />}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={isAdminUser ? <Navigate to="/admin" replace /> : <Home />} />
          <Route path="/map" element={isAdminUser ? <Navigate to="/admin" replace /> : <MapPage />} />
          <Route path="/explore" element={isAdminUser ? <Navigate to="/admin" replace /> : <Explore />} />
          <Route path="/search" element={isAdminUser ? <Navigate to="/admin" replace /> : <Search />} />
          <Route path="/channels" element={isAdminUser ? <Navigate to="/admin" replace /> : <ChannelList />} />
          <Route path="/register-palkhi" element={isAdminUser ? <Navigate to="/admin" replace /> : <PalkhiRegistration />} />
          <Route
            path="/channel/create"
            element={
              isAdminUser ? <Navigate to="/admin" replace /> : (
                <ProtectedRoute requiredRole={['palkhi_pramukh', 'admin']}>
                  <CreateChannel />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/channel/:id/manage"
            element={
              isAdminUser ? <Navigate to="/admin" replace /> : (
                <ProtectedRoute requiredRole={['palkhi_pramukh', 'admin']}>
                  <ManageChannel />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/channel/:id/contributors"
            element={
              isAdminUser ? <Navigate to="/admin" replace /> : (
                <ProtectedRoute requiredRole={['palkhi_pramukh', 'admin']}>
                  <ContributorManagement />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/contribute"
            element={
              isAdminUser ? <Navigate to="/admin" replace /> : (
                <ProtectedRoute requiredRole={['contributor', 'palkhi_pramukh', 'admin']}>
                  <Contribute />
                </ProtectedRoute>
              )
            }
          />
          <Route path="/channel/:id" element={<ChannelPage />} />
          <Route path="/content/:id" element={<ContentDetail />} />
          <Route path="/ai-assistant" element={isAdminUser ? <Navigate to="/admin" replace /> : <AIAssistant />} />
          <Route path="/shorts" element={isAdminUser ? <Navigate to="/admin" replace /> : <AaplaTheva />} />
          <Route path="/login" element={isAdminUser ? <Navigate to="/admin" replace /> : <Login />} />
          <Route path="/register" element={isAdminUser ? <Navigate to="/admin" replace /> : <Register />} />
          <Route path="/KnowledgePage" element={isAdminUser ? <Navigate to="/admin" replace /> : <KnowledgePage />} />
          <Route path="/apply-contributor" element={isAdminUser ? <Navigate to="/admin" replace /> : <ContributorRegistration />} />
          <Route path="/apply-palkhi-pramukh" element={isAdminUser ? <Navigate to="/admin" replace /> : <PalkhiPramukhRegistration />} />
          <Route path="/verify-otp" element={isAdminUser ? <Navigate to="/admin" replace /> : <OTPVerification />} />
          <Route path="/profile" element={isAdminUser ? <Navigate to="/admin" replace /> : <ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:id" element={isAdminUser ? <Navigate to="/admin" replace /> : <Profile />} />
          <Route path="/settings" element={isAdminUser ? <Navigate to="/admin" replace /> : <ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="content/:id" element={<AdminContentDetail />} />
            <Route path="channels" element={<ChannelManagement />} />
            <Route path="channels/:id" element={<AdminChannelPage />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && !loading && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;