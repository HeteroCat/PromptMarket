import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className={`${className}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;