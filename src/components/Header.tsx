import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Heart, Ticket } from 'lucide-react';
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

const Header = ({ user, signOut, setShowAuth }: HeaderProps) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const typedUser = user;
  
  // Close user menu when clicking outside
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
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setShowUserMenu(false);
      // Show a toast notification
      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Sign out error:", error);
      // Provide more specific error message when available
      const errorMessage = error instanceof Error ? error.message : "Failed to sign out. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img 
              src="src\assets\trn.png" 
              alt="TRN EVENTS" 
              className="h-20 w-auto"
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  to="/tickets" 
                  className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  My Tickets
                </Link>
                <div className="relative user-menu-container">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                      {typedUser?.displayName ? typedUser.displayName.charAt(0).toUpperCase() : typedUser?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium">
                      {typedUser?.displayName || (typedUser?.email ? typedUser.email.split('@')[0] : 'User')}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {typedUser?.displayName || (typedUser?.email ? typedUser.email.split('@')[0] : 'User')}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{typedUser?.email || ''}</p>
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
                  )}
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
              className="text-gray-600 hover:text-indigo-600"
            >
              {isNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isNavOpen && (
          <div className="md:hidden px-2 pb-3 pt-2 space-y-1 sm:px-3">
            {typedUser ? (
              <>
                <div className="px-3 py-2 text-gray-700">
                  <span className="block font-medium">
                    {typedUser?.displayName || (typedUser?.email ? typedUser.email.split('@')[0] : 'User')}
                  </span>
                </div>
                <Link 
                  to="/tickets" 
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  My Tickets
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
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