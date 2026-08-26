import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OTPVerification from './components/auth/OTPVerification';

// Public Components
import Search from './components/public/Search';
import AIAssistant from './components/public/AIAssistant';
import AaplaTheva from './components/public/AaplaTheva';
import ChannelList from './components/public/ChannelList';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F5F0E8]">
          <Header />
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/search" element={<Search />} />
              <Route path="/channels" element={<ChannelList />} />
              <Route path="/channel/:id" element={<ChannelPage />} />
              <Route path="/content/:id" element={<ContentDetail />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/shorts" element={<AaplaTheva />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/contribute" element={<Contribute />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;