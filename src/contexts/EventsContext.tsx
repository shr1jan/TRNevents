// EventsContext.tsx
import { createContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Define the structure of an event
interface Event {
  id: number;
  artist: string;
  date: string;
  time: string;
  venue: string;
  image: string;
  description: string;
  genre: string;
  tickets: {
    type: string;
    price: string;
    remaining: number;
  }[];
}

// Define the context type
interface EventsContextType {
  events: Event[];
  featuredEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
}

// Create the context with default values
export const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Create the provider component
export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        setEvents(data);
        setFeaturedEvent(data.find((event: Event) => event.id === 1) || null);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <EventsContext.Provider value={{ events, featuredEvent, isLoading, error, fetchEvents }}>
      {children}
    </EventsContext.Provider>
  );
}