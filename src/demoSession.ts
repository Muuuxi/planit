import { useState } from 'react';
export interface DemoSession { name: string; email: string; provider: 'Google' | 'Microsoft' | 'Email' | 'Explore Demo' }
export const SESSION_KEY = 'planit-demo-session-v1';
export function useDemoSession() {
  const [session, setSession] = useState<DemoSession | null>(() => {
    try { const value = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); if (value && typeof value.name === 'string' && typeof value.email === 'string' && ['Google', 'Microsoft', 'Email', 'Explore Demo'].includes(value.provider)) return value; } catch { /* Start at welcome if no valid local session. */ }
    return null;
  });
  const [sessionError, setSessionError] = useState('');
  const login = (value: DemoSession) => { try { localStorage.setItem(SESSION_KEY, JSON.stringify(value)); setSessionError(''); } catch { setSessionError('Demo session cannot be saved in this browser.'); } setSession(value); };
  const logout = () => { try { localStorage.removeItem(SESSION_KEY); setSessionError(''); } catch { setSessionError('Could not clear browser storage. This session is signed out in this tab.'); } setSession(null); };
  return { session, sessionError, login, logout };
}
