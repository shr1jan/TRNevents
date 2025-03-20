import { useContext } from 'react';
import { EventsContext } from '../contexts/EventsContext';

// Custom hook to use the events context
export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}