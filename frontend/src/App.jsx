import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './hooks/useAuth';
import { ROUTES } from './routes';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ChatWidget from './components/common/ChatWidget';

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const ChannelPage = lazy(() => import('./pages/ChannelPage'));
const ContentDetail = lazy(() => import('./pages/ContentDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Contribute = lazy(() => import('./pages/Contribute'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const ContributorRegistration = lazy(() => import('./pages/ContributorRegistration'));
const PalkhiPramukhRegistration = lazy(() => import('./pages/PalkhiPramukhRegistration'));
const CreateChannel = lazy(() => import('./components/channel-management/CreateChannel'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const OTPVerification = lazy(() => import('./components/auth/OTPVerification'));
const PalkhiRegistration = lazy(() => import('./components/auth/PalkhiRegistration'));
const Search = lazy(() => import('./components/public/Search'));
const AIAssistant = lazy(() => import('./components/public/AIAssistant'));
const AaplaTheva = lazy(() => import('./components/public/AaplaTheva'));
const ChannelList = lazy(() => import('./components/public/ChannelList'));
const ManageChannel = lazy(() => import('./components/channel-management/ManageChannel'));
const ContributorManagement = lazy(() => import('./components/channel-management/ContributorManagement'));
const MapPage = lazy(() => import('./pages/MapPage'));

import ProtectedRoute from './components/common/ProtectedRoute';
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const ContentManagement = lazy(() => import('./pages/Admin/ContentManagement'));
const ChannelManagement = lazy(() => import('./pages/Admin/ChannelManagement'));
const AdminSettings = lazy(() => import('./pages/Admin/Settings'));

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
        <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-[#3C2A21]">Loading...</div>}>
          <Routes>
            <Route path={ROUTES.HOME} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <Home />} />
            <Route path={ROUTES.MAP} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <MapPage />} />
            <Route path={ROUTES.EXPLORE} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <Explore />} />
            <Route path={ROUTES.SEARCH} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <Search />} />
            <Route path={ROUTES.CHANNELS} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <ChannelList />} />
            <Route path="/register-palkhi" element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <PalkhiRegistration />} />
            <Route path={ROUTES.CREATE_CHANNEL} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : (<ProtectedRoute requiredRole={['palkhi_pramukh', 'admin']}><CreateChannel /></ProtectedRoute>)} />
            <Route path="/channel/:id/manage" element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : (<ProtectedRoute requiredRole={['palkhi_pramukh', 'admin']}><ManageChannel /></ProtectedRoute>)} />
            <Route path="/channel/:id/contributors" element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : (<ProtectedRoute requiredRole={['palkhi_pramukh', 'admin']}><ContributorManagement /></ProtectedRoute>)} />
            <Route path={ROUTES.CONTRIBUTE} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : (<ProtectedRoute requiredRole={['contributor', 'palkhi_pramukh', 'admin']}><Contribute /></ProtectedRoute>)} />
            <Route path="/channel/:id" element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <ChannelPage />} />
            <Route path="/content/:id" element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <ContentDetail />} />
            <Route path={ROUTES.AI_ASSISTANT} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <AIAssistant />} />
            <Route path={ROUTES.SHORTS} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <AaplaTheva />} />
            <Route path={ROUTES.LOGIN} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <Login />} />
            <Route path={ROUTES.REGISTER} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <Register />} />
            <Route path={ROUTES.KNOWLEDGE_PAGE} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <KnowledgePage />} />
            <Route path={ROUTES.KNOWLEDGE_PAGE_LEGACY} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <KnowledgePage />} />
            <Route path={ROUTES.APPLY_CONTRIBUTOR} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <ContributorRegistration />} />
            <Route path={ROUTES.APPLY_PALKHI_PRAMUKH} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <PalkhiPramukhRegistration />} />
            <Route path={ROUTES.VERIFY_OTP} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <OTPVerification />} />
            <Route path={ROUTES.PROFILE} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path={ROUTES.PROFILE_USER} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <Profile />} />
            <Route path={ROUTES.SETTINGS} element={isAdminUser ? <Navigate to={ROUTES.ADMIN} replace /> : <ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN + '/*'} element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="content" element={<ContentManagement />} />
              <Route path="channels" element={<ChannelManagement />} />
              <Route path="channels/:id" element={<ChannelPage isAdminView />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && !loading && <Footer />}
      {!isAdminRoute && <ChatWidget />}
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