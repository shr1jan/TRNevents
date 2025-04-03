import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, MapPin, Star, Shield, CreditCard, Search, Filter, Clock, ChevronLeft, ChevronRight, Heart, Users, Crown, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
import AuthScreen from './components/AuthScreen';
import Footer from './components/Footer';
import Header from './components/Header';
import { useAuth } from './hooks/useAuth';
import { useEvents } from './hooks/useEvents';
import TicketPurchase from './components/TicketPurchase';

type UserWithProfile = {
  email: string | null;
  displayName?: string | null;
};

type Ticket = {
  type: string;
  price: string;
  icon?: React.ComponentType<{ className?: string }>;
  remaining: number;
};

type Event = {
  id: number;
  artist: string;
  venue: string;
  date: string;
  time: string;
  genre: string;
  description?: string;
  image: string;
  tickets: Ticket[];
};

import { EventsProvider } from './contexts/EventsContext';
import { AuthProvider } from './contexts/AuthContextProvider';

export default function App() {
  return (
    <AuthProvider>
      <EventsProvider>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="toast-container"
        />
        <AppContent />
      </EventsProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, signOut } = useAuth();
  const { events, featuredEvent, isLoading: isEventsLoading, error: networkError } = useEvents();
  const typedUser = user as UserWithProfile | null;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; eventId?: number } | null>(null);
  const [showTicketPurchase, setShowTicketPurchase] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents = activeFilter === 'all' 
    ? events 
    : events.filter(event => event.genre.toLowerCase() === activeFilter.toLowerCase());
  
  const searchedEvents = useMemo(() => {
    return searchQuery 
      ? filteredEvents.filter(event => 
          event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.genre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : filteredEvents;
  }, [searchQuery, filteredEvents]);


  const handleSearch = useCallback(() => {
    const sanitizedQuery = searchQuery.trim();

    if (sanitizedQuery.length < 2 && sanitizedQuery.length > 0) {
      toast.info("Please enter at least 2 characters to search");
      return;
    }

    if (sanitizedQuery) {
      const resultsCount = searchedEvents.length;
      toast.info(`Found ${resultsCount} ${resultsCount === 1 ? 'event' : 'events'} matching "${sanitizedQuery}"`);
    }
  }, [searchQuery, searchedEvents]);

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

  const handleTicketPurchase = (eventId: number) => {
    if (!typedUser) {
      setPendingAction({ type: 'purchase', eventId });
      setShowAuth(true);
      return;
    }
    
    const event = featuredEvent?.id === eventId 
      ? featuredEvent 
      : events.find(e => e.id === eventId);
    
    if (event) {
      setSelectedEvent(event);
      setShowTicketPurchase(true);
    } else {
      toast.error("Event not found");
    }
  };
  
  const handleCompletePurchase = (eventId: number, ticketType: string, quantity: number) => {
    setShowTicketPurchase(false);
    const event = events.find(e => e.id === eventId) || featuredEvent;
    toast.success(`${quantity} ${ticketType} ticket${quantity > 1 ? 's' : ''} purchased for ${event?.artist}!`);
  };
  
  // Toggle favorite status
  const toggleFavorite = (eventId: number) => {
    if (!typedUser) {
      setPendingAction({ type: 'favorite', eventId });
      setShowAuth(true);
      return;
    }
    
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.includes(eventId);
      const event = featuredEvent?.id === eventId 
        ? featuredEvent 
        : events.find(e => e.id === eventId);
      
      if (isFavorite) {
        toast.info(`Removed ${event?.artist} from favorites`);
        return prevFavorites.filter(id => id !== eventId);
      } else {
        toast.success(`Added ${event?.artist} to favorites`);
        return [...prevFavorites, eventId];
      }
    });
  };
  // Carousel scroll handlers
  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = document.getElementById('events-carousel');
    if (carousel) {
      const scrollAmount = direction === 'left' ? -carousel.offsetWidth : carousel.offsetWidth;
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Save favorites to local storage
  useEffect(() => {
    localStorage.setItem('eventTixFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Load favorites from local storage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('eventTixFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    const carousel = document.getElementById('events-carousel');
    if (carousel) {
      const handleScroll = () => setScrollPosition(carousel.scrollLeft);
      const updateMaxScroll = () => setMaxScroll(carousel.scrollWidth - carousel.clientWidth);
      
      carousel.addEventListener('scroll', handleScroll);
      updateMaxScroll();
      window.addEventListener('resize', updateMaxScroll);
      
      return () => {
        carousel.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateMaxScroll);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Auth modal */}
      {showAuth && !typedUser && (
        <AuthScreen 
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            toast.success("Successfully signed in!");
            if (pendingAction?.type === 'purchase' && pendingAction.eventId) {
              handleTicketPurchase(pendingAction.eventId);
              setPendingAction(null);
            } else if (pendingAction?.type === 'favorite' && pendingAction.eventId) {
              toggleFavorite(pendingAction.eventId);
              setPendingAction(null);
            }
          }}
        />
      )}
      
      {/* Ticket Purchase Modal */}
      {showTicketPurchase && selectedEvent && (
        <TicketPurchase 
          event={selectedEvent}
          onClose={() => setShowTicketPurchase(false)}
          onPurchase={handleCompletePurchase}
        />
      )}
      
      {/* Replace header with Header component */}
      <Header 
        user={typedUser}
        signOut={handleSignOut}
        setShowAuth={setShowAuth}
      />
  {/* Featured Event Hero Section */}
<div id="featured" className="relative bg-indigo-600 h-[600px] lg:h-[650px]">
  {featuredEvent ? (
    <>
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src={featuredEvent.image}
          alt={featuredEvent.artist}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <div className="inline-block mb-4 px-4 py-1 bg-indigo-600 rounded-full text-white font-semibold animate-pulse">
          Featured Event
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {featuredEvent.artist}
        </h1>
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-white">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            <span className="text-xl">{featuredEvent.date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-6 w-6 mr-2" />
            <span className="text-xl">{featuredEvent.time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-6 w-6 mr-2" />
            <span className="text-xl">{featuredEvent.venue}</span>
          </div>
        </div>
        <div className="mt-4 inline-block px-3 py-1 bg-indigo-500/50 rounded-full text-white text-sm">
          {featuredEvent.genre}
        </div>
        <p className="mt-4 text-xl text-white max-w-3xl">
          {featuredEvent.description}
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {featuredEvent.tickets.map((ticket: Ticket, index: number) => {
            return (
              <div
                key={ticket.type}
                onClick={() =>
                  typedUser ? handleTicketPurchase(featuredEvent.id) : setShowAuth(true)
                }
                className={`bg-white/10 backdrop-blur-md rounded-lg p-4 flex-1 border-2 transition-all duration-300 cursor-pointer relative
                  ${index === 0 ? 'border-gray-600/70' : ''} // General (default)
                  ${index === 1 ? 'border-gray-400/70 shadow-[0_0_15px_5px_rgba(192,192,192,0.7)]' : ''} // Fanpit (Silver glow)
                  ${index === 2 ? 'border-yellow-400/70 shadow-[0_0_15px_6px_rgba(255,215,0,0.8)]' : ''} // VIP (Gold glow - enhanced)
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    {index === 0 ? (
                      <Users className="h-5 w-5 mr-2 text-amber-400" />
                    ) : index === 1 ? (
                      <Star className="h-5 w-5 mr-2 text-gray-300" />
                    ) : (
                      <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                    )}
                    <span className="text-white font-semibold">{ticket.type}</span>
                  </div>
                  <span className="text-indigo-200 font-bold">{ticket.price}</span>
                </div>
                {index === 0 && (
                  <div className="mt-2 text-xs text-gray-300 font-medium">Standard Experience</div>
                )}
                {index === 1 && (
                  <div className="mt-2 text-xs text-gray-300 font-medium">Enhanced Experience</div>
                )}
                {index === 2 && (
                  <div className="mt-2 text-xs text-yellow-300 font-medium">✨ Most Popular</div>
                )}
                {index === 0 && (
                  <p className="mt-2 text-xs text-indigo-200">Dive into all the excitement and a fun experience.</p>
                )}
                {index === 1 && (
                  <p className="mt-2 text-xs text-indigo-200">Be closer to the action, with a more immersive experience and a closer connection to the artist.</p>
                )}
                {index === 2 && (
                  <p className="mt-2 text-xs text-indigo-200">Enjoy the best access to the artist, with the ultimate experience at the event!</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  ) : isEventsLoading ? (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  ) : networkError ? (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <div className="text-2xl font-bold mb-4">Failed to load featured event</div>
      <p>{networkError}</p>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <div className="text-2xl font-bold mb-4">No featured event available</div>
    </div>
  )}
</div>


            
      {/* Search Section */}
      <div className="bg-[#111827] py-8 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events, artists, or venues..."
                className="w-full pl-10 pr-4 py-3 bg-[#111827] border border-gray-500 text-white placeholder-gray-400 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="flex space-x-2">
              <div className="relative group">
                <button className="h-full flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-200 transition-colors">
                  <Filter className="h-5 w-5 mr-2" />
                  <span>Filter</span>
                </button>
                <div className="absolute top-full left-0 mt-2 bg-white p-4 rounded-md shadow-lg border border-gray-200 hidden group-hover:block w-48 z-10">
                  <h4 className="font-medium text-gray-700 mb-2">Genre</h4>
                  <div className="space-y-1">
                    {['all', 'pop', 'rock', 'folk'].map(filter => (
                      <button 
                        key={filter}
                        className={`block w-full text-left px-2 py-1 rounded-full ${activeFilter === filter ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                        onClick={() => setActiveFilter(filter)}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleSearch}
                className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
          {activeFilter !== 'all' && (
            <div className="mt-3 flex items-center">
              <span className="text-sm text-gray-300 mr-2">Active filter:</span>
              <span className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full flex items-center">
                {activeFilter}
                <button 
                  onClick={() => setActiveFilter('all')}
                  aria-label="Clear filter"
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Events Carousel */}
      <div id="events" className="py-16 bg-[#111827]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {networkError ? (
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-full bg-red-100 mb-4">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-200">Connection Error</h3>
              <p className="text-gray-300 mt-2">{networkError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : isEventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse space-y-4">
                  <div className="h-48 bg-gray-700 rounded-lg"></div>
                  <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                  <div className="h-10 bg-gray-700 rounded-full w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <button 
                onClick={() => scrollCarousel('left')}
                aria-label="View previous events"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                style={{ display: scrollPosition > 0 ? 'block' : 'none' }}
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <button 
                onClick={() => scrollCarousel('right')}
                aria-label="View more events"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                style={{ display: scrollPosition < maxScroll ? 'block' : 'none' }}
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>

              <div 
                id="events-carousel"
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-4 space-x-6"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {searchedEvents.length > 0 ? (
                  searchedEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="flex-none w-full sm:w-1/2 lg:w-1/3 snap-start px-2"
                    >
                      <div 
                        onClick={() => handleTicketPurchase(event.id)}
                        className="bg-[#111827] border border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:bg-[#1a2438] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                      >
                        <div className="relative">
                          <img 
                            src={event.image} 
                            alt={event.artist}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 text-white">
                            <div className="text-sm font-medium">{event.genre}</div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-xl font-bold mb-2 text-white">{event.artist}</h3>
                          <div className="space-y-2 text-gray-400 text-sm mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {event.date}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {event.time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.venue}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click from triggering
                                toggleFavorite(event.id);
                              }}
                              className={`p-2 rounded-full ${
                                favorites.includes(event.id)
                                  ? 'text-red-500 bg-red-50/10'
                                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50/10'
                              } transition-colors`}
                            >
                              <Heart className={`h-5 w-5 ${favorites.includes(event.id) ? 'fill-current' : ''}`} />
                            </button>
                            <div
                              className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors text-sm font-medium"
                            >
                              Get Tickets
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-8">
                    <p className="text-gray-500">No events found matching your search criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-16 bg-[#111827]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white">About TRN Events</h2>
              <p className="text-gray-300 mb-4">
                TRN Events is Nepal's premier ticket marketplace for live events. We provide fans with a safe and reliable place to get tickets to the events they want to see, and an easy way for sellers to get their tickets in front of a large audience.
              </p>
              <p className="text-gray-300 mb-6">
                Our mission is to connect fans with the power of live events. We believe that sharing experiences is what brings people together, creating lifelong memories and nurturing our cultural spirit.
              </p>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80" 
                  alt="Concert crowd" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-white">Our Guarantee</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Shield className="h-6 w-6 text-indigo-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white">100% Authentic Tickets</h4>
                      <p className="text-gray-300 text-sm mt-1">
                        Every ticket sold on our platform is 100% verified and guaranteed to be authentic.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CreditCard className="h-6 w-6 text-indigo-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white">Secure Transactions</h4>
                      <p className="text-gray-300 text-sm mt-1">
                        Your payment information is always protected with industry-leading encryption.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Star className="h-6 w-6 text-indigo-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white">Premium Experience</h4>
                      <p className="text-gray-300 text-sm mt-1">
                        From purchase to event day, we ensure a smooth and enjoyable experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-indigo-700 shadow-lg overflow-hidden">
            <div className="px-6 py-10 sm:px-10 sm:py-12">
              <div className="md:flex md:items-center md:justify-between">
                <div className="md:w-0 md:flex-1">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    Never miss an event
                  </h2>
                  <p className="mt-3 max-w-3xl text-lg text-indigo-200">
                    Subscribe to our newsletter and be the first to know about upcoming events and exclusive presales.
                  </p>
                </div>
                <div className="mt-8 md:mt-0 md:ml-8">
                  <form className="flex flex-col sm:flex-row">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 w-full"
                    />
                    <button
                      type="submit"
                      className="mt-3 sm:mt-0 sm:ml-3 px-5 py-3 bg-white text-indigo-600 font-medium rounded-full hover:bg-indigo-50 transition-colors"
                    >
                      Subscribe
                    </button>
                  </form>
                  <p className="mt-3 text-sm text-indigo-200">
                    We care about your data. Read our{' '}
                    <a href="#" className="text-white underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Footer - replaced with imported component */}
      <Footer />
      </div>
    );  };