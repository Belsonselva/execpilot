import { useState, useEffect } from 'react';

interface SidebarProps {
  className?: string;
  urlHref?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  className = '', 
  urlHref = '', 
  isOpen = false, 
  onClose = () => {} 
}) => {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Get the current path immediately on component mount
    const getCurrentPath = () => {
      if (typeof window !== 'undefined') {
        return window.location.pathname;
      }
      return '';
    };

    // Set the current path immediately
    setCurrentPath(getCurrentPath());

    // Also extract from urlHref if provided
    if (urlHref) {
      // Extract path from full URL or use as-is if it's already a path
      if (urlHref.includes('://')) {
        const url = new URL(urlHref);
        setCurrentPath(url.pathname);
      } else {
        setCurrentPath(urlHref.startsWith('/') ? urlHref : `/${urlHref}`);
      }
    }
  }, [urlHref]);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
      href: '/',
      active: currentPath === '/'
    },
    {
      name: 'Mail',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      href: '/mail',
      active: currentPath === '/mail'
    },
    {
      name: 'Calendar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v14a2 2 0 002 2z" />
        </svg>
      ),
      href: '/calendar',
      active: currentPath === '/calendar'
    }
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">ExecPilot</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 sm:p-6">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Navigation</h3>
          </div>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`
                    group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative
                    ${
                      item.active
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }
                  `}
                  onClick={onClose}
                >
                  {item.active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full"></div>
                  )}
                  <span className={`transition-colors duration-200 ${
                    item.active ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'
                  }`}>
                    {item.icon}
                  </span>
                  <span className={`font-medium transition-colors duration-200 ${
                    item.active ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {item.name}
                  </span>
                  {item.active && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-semibold">EP</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">ExecPilot User</p>
              <p className="text-xs text-gray-500 truncate">pilot@execpilot.com</p>
            </div>
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
