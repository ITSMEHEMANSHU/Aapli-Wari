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

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OTPVerification from './components/auth/OTPVerification';

// Public Components
import Search from './components/public/Search';
import AIAssistant from './components/public/AIAssistant';
import AaplaTheva from './components/public/AaplaTheva';
import ChannelList from './components/public/ChannelList';
import ManageChannel from './components/channel-management/ManageChannel';
import ContributorManagement from './components/channel-management/ContributorManagement';
import MapPage from './pages/MapPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center">Verifying session...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

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
              <Route  path="/channel/create"  element={<ProtectedRoute><CreateChannel /></ProtectedRoute> }/>
<Route
  path="/channel/:id/manage"
  element={
    <ProtectedRoute>
      <ManageChannel />
    </ProtectedRoute>
  }
/>

<Route
  path="/channel/:id/contributors"
  element={
    <ProtectedRoute>
      <ContributorManagement />
    </ProtectedRoute>
  }
/>
<Route path="/contribute" element={<ProtectedRoute><Contribute /></ProtectedRoute>} />
<Route path="/channel/:id" element={<ChannelPage />} />
              <Route path="/content/:id" element={<ContentDetail />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/shorts" element={<AaplaTheva />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/contribute" element={<ProtectedRoute><Contribute /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;