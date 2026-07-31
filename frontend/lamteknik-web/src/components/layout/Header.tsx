'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore, useSidebarStore, useNotificationStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { user, setAuth, logout, token } = useAuthStore();
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebarStore();
  const { unreadCount } = useNotificationStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch user data on mount if we have a token but no user
  useEffect(() => {
    const fetchUserData = async () => {
      if (token && !user) {
        try {
          const response = await authApi.me();
          setAuth(response.data, token);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          logout();
          router.push('/login');
        }
      }
    };

    fetchUserData();
  }, [token, user, setAuth, logout, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 h-16 bg-white border-b border-secondary-200 transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-20'
      )}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-secondary-500 hover:bg-secondary-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Cari akreditasi, dokumen..."
                className="w-80 pl-10 pr-4 py-2 text-sm bg-secondary-50 border-0 rounded-lg placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-secondary-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-secondary-200">
                    <h3 className="font-semibold text-secondary-900">Notifikasi</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="px-4 py-8 text-center text-secondary-500 text-sm">
                      Tidak ada notifikasi baru
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <Avatar name={user?.name} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-secondary-900">{user?.name || 'User'}</p>
                <p className="text-xs text-secondary-500">{user?.role || 'Admin'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-secondary-400" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-secondary-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-secondary-200">
                    <p className="font-medium text-secondary-900">{user?.name}</p>
                    <p className="text-sm text-secondary-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/dashboard/settings/profile"
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Profil Saya
                    </Link>
                    <Link 
                      href="/dashboard/settings"
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Pengaturan
                    </Link>
                    <hr className="my-1 border-secondary-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
