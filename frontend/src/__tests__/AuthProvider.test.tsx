import {describe, it, expect, vi} from 'vitest';
import type {Mock} from 'vitest';
import {renderHook, act, waitFor} from '@testing-library/react';
import {AuthProvider, useAuth} from '../providers/AuthProvider';
import {supabase} from '../lib/supabaseClient';

// mock supabase
vi.mock('../lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChange: vi.fn(),
        signInWithPassword: vi.fn(),
      },
    },
  };
});

describe('AuthProvider', () => {
  it('loads initial user', async () => {
    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: {user: {id: '123'}},
    });

    (supabase.auth.onAuthStateChange as Mock).mockReturnValue({
      data: {subscription: {unsubscribe: vi.fn()}},
    });

    const wrapper = ({children}: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const {result} = renderHook(() => useAuth(), {wrapper});

    await waitFor(() => expect(result.current.user?.id).toBe('123'));
  });

  it('sets user to null when getUser returns null', async () => {
    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: {user: null},
    });

    (supabase.auth.onAuthStateChange as Mock).mockReturnValue({
      data: {subscription: {unsubscribe: vi.fn()}},
    });

    const wrapper = ({children}: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const {result} = renderHook(() => useAuth(), {wrapper});
    await waitFor(() => result.current.user === null);
    expect(result.current.user).toBe(null);
  });

  it('clears user on signOut', async () => {
    (supabase.auth.signOut as Mock).mockResolvedValue({error: null});

    const wrapper = ({children}: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const {result} = renderHook(() => useAuth(), {wrapper});
    await act(async () => await result.current.signOut());
    expect(result.current.user).toBe(null);
  });

  it('does not clear user on signOut error', async () => {
    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: {user: {id: '123'}},
    });

    (supabase.auth.onAuthStateChange as Mock).mockReturnValue({
      data: {subscription: {unsubscribe: vi.fn()}},
    });

    (supabase.auth.signOut as Mock).mockResolvedValue({
      error: {message: 'something went wrong'},
    });

    const wrapper = ({children}: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const {result} = renderHook(() => useAuth(), {wrapper});
    await waitFor(() => result.current.user?.id === '123');
    await act(async () => await result.current.signOut());
    expect(result.current.user?.id).toBe('123');
  });
});
