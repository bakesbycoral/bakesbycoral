'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, createContext, useContext } from 'react';

// Context to share mobile menu state
const MobileMenuContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

export function useMobileMenu() {
  return useContext(MobileMenuContext);
}

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MobileMenuContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

interface Tenant {
  id: string;
  slug: string;
  name: string;
  primary_color: string;
  secondary_color: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    name: 'Calendar',
    href: '/admin/calendar',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    name: 'Gallery',
    href: '/admin/gallery',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Newsletter',
    href: '/admin/newsletter',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Coupons',
    href: '/admin/coupons',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Emails',
    href: '/admin/emails',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

interface AdminSidebarProps {
  userEmail: string;
  currentTenant: Tenant;
  tenants: Tenant[];
}

export function MobileMenuButton({ primaryColor, secondaryColor }: { primaryColor?: string; secondaryColor?: string }) {
  const { isOpen, setIsOpen } = useMobileMenu();
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-colors"
      style={{
        backgroundColor: primaryColor || '#541409',
        color: secondaryColor || '#EAD6D6',
      }}
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}

export function AdminSidebar({ userEmail, currentTenant, tenants }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isOpen: mobileMenuOpen, setIsOpen: setMobileMenuOpen } = useMobileMenu();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTenantDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleTenantSwitch = async (tenantId: string) => {
    if (tenantId === currentTenant.id) {
      setTenantDropdownOpen(false);
      return;
    }

    setSwitching(true);
    try {
      const response = await fetch('/api/admin/switch-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });

      if (response.ok) {
        router.push('/admin');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to switch tenant:', error);
    } finally {
      setSwitching(false);
      setTenantDropdownOpen(false);
    }
  };

  const filteredNavigation = navigation;

  const primaryColor = currentTenant.primary_color || '#541409';
  const secondaryColor = currentTenant.secondary_color || '#EAD6D6';

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ backgroundColor: secondaryColor, color: primaryColor }}
      >
      {/* Tenant Switcher */}
      <div className="p-6 border-b" style={{ borderColor: `${primaryColor}20` }} ref={dropdownRef}>
        {tenants.length > 1 && (
          <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: `${primaryColor}80` }}>
            Switch Business
          </div>
        )}
        <button
          onClick={() => tenants.length > 1 && setTenantDropdownOpen(!tenantDropdownOpen)}
          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${tenants.length > 1 ? 'cursor-pointer hover:bg-white/50' : 'cursor-default'}`}
          style={tenants.length > 1 ? { border: `1px solid ${primaryColor}30` } : {}}
          disabled={switching}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-xl font-bold" style={{ color: secondaryColor }}>
              {currentTenant.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold" style={{ color: primaryColor }}>
              {currentTenant.name}
            </div>
            <div className="text-xs" style={{ color: `${primaryColor}99` }}>
              {tenants.length > 1 ? 'Click to switch' : 'Admin Dashboard'}
            </div>
          </div>
          {tenants.length > 1 && (
            <svg
              className={`w-5 h-5 transition-transform ${tenantDropdownOpen ? 'rotate-180' : ''}`}
              style={{ color: primaryColor }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* Tenant Dropdown */}
        {tenantDropdownOpen && tenants.length > 1 && (
          <div
            className="absolute left-4 right-4 mt-2 rounded-lg shadow-lg z-50 overflow-hidden"
            style={{ backgroundColor: '#fff' }}
          >
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleTenantSwitch(tenant.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  tenant.id === currentTenant.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                disabled={switching}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: tenant.primary_color }}
                >
                  <span className="text-sm font-bold" style={{ color: tenant.secondary_color }}>
                    {tenant.name.charAt(0)}
                  </span>
                </div>
                <span className="font-medium text-gray-900">{tenant.name}</span>
                {tenant.id === currentTenant.id && (
                  <svg className="w-5 h-5 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                  style={
                    isActive
                      ? { backgroundColor: primaryColor, color: secondaryColor }
                      : { color: `${primaryColor}cc` }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = `${primaryColor}1a`;
                      e.currentTarget.style.color = primaryColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = `${primaryColor}cc`;
                    }
                  }}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t" style={{ borderColor: `${primaryColor}20` }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}33` }}
          >
            <span className="text-sm font-medium" style={{ color: primaryColor }}>
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: primaryColor }}>
              {userEmail}
            </div>
            <div className="text-xs" style={{ color: `${primaryColor}99` }}>
              Administrator
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center gap-3 px-4 py-2 rounded-lg transition-colors"
          style={{ color: `${primaryColor}99` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${primaryColor}1a`;
            e.currentTarget.style.color = primaryColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = `${primaryColor}99`;
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>

      {/* Back to site */}
      <div className="p-4 border-t" style={{ borderColor: `${primaryColor}20` }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2 transition-colors"
          style={{ color: `${primaryColor}99` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = primaryColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = `${primaryColor}99`;
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>View Website</span>
        </a>
      </div>
    </aside>
    </>
  );
}
