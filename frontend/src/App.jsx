import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
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

function App() {
  const { language } = useLanguage();

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#FBF5EC]" lang={language}>
          <Header />
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/search" element={<Search />} />
              <Route path="/channels" element={<ChannelList />} />
              <Route path="/register-palkhi" element={<PalkhiRegistration />} /> 
              <Route 
                path="/channel/create" 
                element={
                  <ProtectedRoute requiredRole={['palkhi_pramukh', 'admin']}>
                    <CreateChannel />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/channel/:id/manage"
                element={
                  <ProtectedRoute requiredRole={['palkhi_pramukh', 'admin']}>
                    <ManageChannel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/channel/:id/contributors"
                element={
                  <ProtectedRoute requiredRole={['palkhi_pramukh', 'admin']}>
                    <ContributorManagement />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/contribute" 
                element={
                  <ProtectedRoute requiredRole={['contributor', 'palkhi_pramukh', 'admin']}>
                    <Contribute />
                  </ProtectedRoute>
                } 
              />
<Route path="/channel/:id" element={<ChannelPage />} />
              <Route path="/content/:id" element={<ContentDetail />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/shorts" element={<AaplaTheva />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/KnowledgePage" element={<KnowledgePage />} />
              
              <Route path="/apply-contributor" element={<ContributorRegistration />} />
              <Route path="/apply-palkhi-pramukh" element={<PalkhiPramukhRegistration />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;