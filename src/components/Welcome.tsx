import { useState } from 'react';
import { ArrowRight, CalendarDays, Mic, Mail } from 'lucide-react';
import type { DemoSession } from '../demoSession';

export function Welcome({ onLogin, error }: { onLogin: (session: DemoSession) => void; error: string }) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = (provider: DemoSession['provider']) => onLogin({ provider, name: provider === 'Explore Demo' ? 'Demo Explorer' : `${provider} Demo`, email: `${provider === 'Explore Demo' ? 'explorer' : provider.toLowerCase()}@demo.planit.local` });
  return <main className="welcome-screen"><div className="welcome-shell">
    <section className="welcome-story"><div className="brand-lockup"><div className="brand-mark" aria-hidden="true"><span /><span /></div><div><p className="brand-name">Planit</p><p className="brand-caption">Plan with intention</p></div></div>
      <p className="welcome-eyebrow">A little structure. More room for life.</p><h1>Plan with your voice.<br />Adapt when life changes.</h1><p className="welcome-description">A voice-first smart planner for schedules that never stay still.</p>
      <div className="welcome-illustration" aria-hidden="true"><div className="welcome-mini-header"><CalendarDays size={16} /><span>Your day, with room to breathe</span></div><div className="welcome-block focus-block"><span>09:00</span><strong>Space for deep work</strong></div><div className="welcome-block meeting-block"><span>11:00</span><strong>A conversation that matters</strong></div><div className="welcome-gap">A little breathing room</div><div className="welcome-voice"><Mic size={16} /> “Something changed. Let’s make room.”</div></div>
      <p className="capacity-principle">Free time ≠ available capacity.</p>
    </section>
    <section className="welcome-entry" aria-label="Demo sign in"><p className="eyebrow">Welcome to Planit</p><h2>Make space for what’s next.</h2><p className="welcome-account-note">Choose a way to explore your planner.</p>
      <button className="provider-button" onClick={() => login('Google')}><span className="provider-letter" aria-hidden="true">G</span>Continue with Google</button>
      <button className="provider-button" onClick={() => login('Microsoft')}><span className="microsoft-mark" aria-hidden="true"><i /><i /><i /><i /></span>Continue with Microsoft</button>
      <button className="provider-button" aria-expanded={emailOpen} onClick={() => setEmailOpen(value => !value)}><Mail size={17} />Sign in with email</button>
      {emailOpen && <form className="panel-form welcome-email" onSubmit={event => { event.preventDefault(); onLogin({ provider: 'Email', name: email.split('@')[0], email: email.trim() }); setPassword(''); }}>
        <label><span>Email</span><input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label><label><span>Password</span><input required type="password" minLength={1} autoComplete="off" value={password} onChange={event => setPassword(event.target.value)} /></label><button className="voice-primary" type="submit">Enter demo with email</button>
      </form>}
      <div className="welcome-divider"><span>or take a look around</span></div><button className="welcome-explore" onClick={() => login('Explore Demo')}>Explore Demo <ArrowRight size={16} /></button>
      <p className="demo-auth-note">Demo sign-in only. Google and Microsoft are simulated. Email credentials are not verified; passwords are never saved or sent.</p>{error && <p role="alert" className="form-error">{error}</p>}
    </section>
  </div></main>;
}
