import { renderHook } from '@testing-library/react-hooks';
import { AuthProvider } from '../contexts/AuthContextProvider';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should throw an error if used outside of AuthProvider', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.error).toEqual(new Error('useAuth must be used within an AuthProvider'));
  });

  it('should provide auth context when used within AuthProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('session');
    expect(result.current).toHaveProperty('signOut');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
  });
});