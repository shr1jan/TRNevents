import { renderHook } from '@testing-library/react-hooks';
import { EventsProvider } from '../contexts/EventsContext';
import { useEvents } from './useEvents';

describe('useEvents', () => {
  it('should throw an error if used outside of EventsProvider', () => {
    const { result } = renderHook(() => useEvents());
    expect(result.error).toEqual(new Error('useEvents must be used within an EventsProvider'));
  });

  it('should provide events context when used within EventsProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EventsProvider>{children}</EventsProvider>
    );

    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(result.current).toHaveProperty('events');
    expect(result.current).toHaveProperty('featuredEvent');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('fetchEvents');
  });
});