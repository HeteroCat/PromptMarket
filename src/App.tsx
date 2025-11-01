import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PromptProvider } from './contexts/PromptContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastContainer';
import Home from "@/pages/Home";
import EcommercePage from "@/pages/EcommercePage";
import EducationPage from "@/pages/EducationPage";
import FinancePage from "@/pages/FinancePage";
import ImagePage from "@/pages/ImagePage";
import VideoPage from "@/pages/VideoPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import PromptDetail from "@/pages/PromptDetail";
import CreatePrompt from "@/pages/CreatePrompt";
import Favorites from "@/pages/Favorites";

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <PromptProvider>
            <ToastProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ecommerce" element={<EcommercePage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/images" element={<ImagePage />} />
            <Route path="/videos" element={<VideoPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/prompt/:id" element={<PromptDetail />} />
            <Route path="/create" element={<CreatePrompt />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
            </ToastProvider>
          </PromptProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
