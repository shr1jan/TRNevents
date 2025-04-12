import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Heart, Ticket, Sun, Moon } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

type UserWithProfile = {
  email: string | null;
  displayName?: string | null;
};

type HeaderProps = {
  user: UserWithProfile | null;
  signOut: () => Promise<void>;
  setShowAuth: (show: boolean) => void;
};

type UserMenuProps = {
  user: UserWithProfile | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
};

const UserMenu = ({ user, signOut, isLoading, showUserMenu, setShowUserMenu }: UserMenuProps) => {
  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Sign out error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to sign out. Please try again.";
      toast.error(errorMessage);
    }
  };

  return showUserMenu ? (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-fadeIn">
      <div className="px-4 py-2 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">
          {user?.displayName || (user?.email ? user.email.split('@')[0] : 'User')}
        </p>
        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
      </div>
      <Link to="/tickets" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <Ticket className="h-4 w-4 mr-2 text-gray-500" />
        My Tickets
      </Link>
      <a href="#favorites" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <Heart className="h-4 w-4 mr-2 text-gray-500" />
        My Favorites
      </a>
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing out...
          </span>
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2 text-gray-500" />
            Sign Out
          </>
        )}
      </button>
    </div>
  ) : null;
};

const Header = ({ user, signOut, setShowAuth }: HeaderProps) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-300 sticky top-0 z-50 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img 
              src="src/assets/trn.png" 
              alt="TRN EVENTS" 
              className="h-20 w-auto"
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            {user ? (
              <>
                <Link 
                  to="/tickets" 
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium flex items-center"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  My Tickets
                </Link>
                <div className="relative user-menu-container">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-700 flex items-center justify-center text-indigo-600 dark:text-indigo-200 font-medium">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium">
                      {user?.displayName || (user?.email ? user.email.split('@')[0] : 'User')}
                    </span>
                  </button>
                  <UserMenu 
                    user={user}
                    signOut={signOut}
                    isLoading={isLoading}
                    showUserMenu={showUserMenu}
                    setShowUserMenu={setShowUserMenu}
                  />
                </div>
              </>
            ) : (
              <button 
                onClick={() => setShowAuth(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isNavOpen}
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {isNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isNavOpen && (
          <div className="md:hidden px-2 pb-3 pt-2 space-y-1 sm:px-3 animate-slideIn">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full text-left px-3 py-2 rounded-md"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            {user ? (
              <>
                <div className="px-3 py-2 text-gray-700 dark:text-gray-300">
                  <span className="block font-medium">
                    {user?.displayName || (user?.email ? user.email.split('@')[0] : 'User')}
                  </span>
                </div>
                <Link 
                  to="/tickets" 
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  My Tickets
                </Link>
                <button 
                  onClick={async () => {
                    setIsLoading(true);
                    await signOut();
                    setIsLoading(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  setIsNavOpen(false);
                  setShowAuth(true);
                }}
                className="bg-indigo-600 text-white w-full text-left px-3 py-2 rounded-full hover:bg-indigo-700 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;