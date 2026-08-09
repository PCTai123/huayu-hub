'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/sidebar';
import Topbar from '@/components/ui/topbar';
import { useAuthContext } from '@/features/auth/providers/auth-provider';
import { useRouter, usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, router, locale]);

  useEffect(() => {
    // Safety timeout: if auth check takes > 3s, force stop loading
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const sidebarWidth = sidebarOpen ? 260 : 64;

  // Show loading spinner while checking auth (max 3 seconds)
  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F6F1E8' }}>
        <div className="flex flex-col items-center gap-4">
          <svg
            className="h-10 w-10 animate-spin text-[#C62828]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm text-gray-500">Dang tai...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the dashboard (will be redirected by useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F1E8' }}>
      {/* Sidebar - desktop collapse/expand */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />

      {/* Topbar */}
      <Topbar onMenuToggle={toggleSidebar} />

      {/* Main Content */}
      <main
        className="transition-all duration-300 ease-in-out min-h-screen pt-20 pb-6 px-3 md:px-6"
        style={{
          marginLeft: '0px',
        }}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Desktop: push main content right by sidebar width */}
      <style jsx global>{`
        @media (min-width: 768px) {
          main {
            margin-left: ${sidebarWidth}px !important;
          }
        }
      `}</style>
    </div>
  );
}
