import { relationship } from '../hierarchy';
import { useEventColors } from '../appearance';
import { useEffect, useState } from 'react';
import { Mic, X } from 'lucide-react';
import { mockExtractCommitments, simulatedVoiceTranscript } from '../voiceDemoData';
import { displayDate, clockLabel, minutes, itemFromDraft, zoneLabel, type CommitmentDraft, type PlannerItem } from '../planner';
import { CommitmentFields } from './CommitmentFields';

export function VoiceCapturePanel({ week, timezone, onClose, onConfirm }: { week: string; timezone: string; onClose: () => void; onConfirm: (items: PlannerItem[]) => void }) {
  const { projects, colorStyle, resolveColor } = useEventColors();
  const [listening, setListening] = useState(true);
  const [drafts, setDrafts] = useState<CommitmentDraft[]>(() => mockExtractCommitments(week, timezone));
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { if (!listening) return; const timer = window.setTimeout(() => setListening(false), 1800); return () => clearTimeout(timer); }, [listening]);
  const retry = () => { setDrafts(mockExtractCommitments(week, timezone)); setEditing(null); setError(''); setListening(true); };
  return <aside className="context-panel voice-panel" aria-label="Voice confirmation" onKeyDown={event => { if (event.key === 'Escape') onClose(); }}>
    <header className="voice-panel-header"><div><span className="voice-header-icon"><Mic size={14} /></span><strong>Speak a change</strong></div><button aria-label="Close voice input" onClick={onClose}><X size={16} /></button></header>
    {listening ? <div className="listening-state" role="status"><div className="listening-mic"><Mic size={22} /></div><div className="waveform" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <span key={i} />)}</div><h2>Listening…</h2><p>Simulated voice input. No audio is recorded.</p><button className="cancel-listening" onClick={onClose}>Cancel</button></div> : <>
      <section className="voice-result-intro"><div className="recognized-label">Recognized transcript</div><blockquote>“{simulatedVoiceTranscript}”</blockquote></section>
      <h2 className="confirmation-heading">Here’s what I understood</h2><p className="section-note">{drafts.length} commitments detected. Check dates, timezones, and effort before confirming.</p>
      <p className="section-note">Interview duration: 1 hour assumed. Priority, flexibility and energy are suggestions you can edit.</p>
      <div className="commitment-list">{drafts.map(draft => <article data-color={resolveColor(draft)} style={colorStyle(draft)} className="confirmation-card" key={draft.id} aria-label={draft.title || 'Untitled commitment'}>
        {editing === draft.id ? <CommitmentFields value={draft} onChange={updated => setDrafts(current => current.map(item => item.id === updated.id ? updated : item))} /> : <><h3>{draft.title}</h3><p>{draft.kind === 'deadline' ? `Due ${displayDate(draft.deadlineDate)} · ${clockLabel(minutes(draft.deadlineTime), '12')}` : `${displayDate(draft.date)} · ${clockLabel(minutes(draft.start), '12')}–${clockLabel(minutes(draft.end), '12')}`}</p><dl>{[['Timezone', zoneLabel(draft.timezone)], ['Area', relationship(draft, projects).area], ['Course / Project', draft.project], ['Work Type', relationship(draft, projects).workType], ['Priority', draft.priority], ['Flexibility', draft.flexibility], ['Energy', draft.energy]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd><span className="solid-tag">{value}</span></dd></div>)}</dl>{draft.notes && <p>{draft.notes}</p>}</>}
        <div className="card-actions"><button className="voice-secondary" onClick={() => { if (editing === draft.id) { try { itemFromDraft(draft); setEditing(null); setError(''); } catch (error) { setError((error as Error).message); } } else setEditing(draft.id); }}>{editing === draft.id ? 'Done editing' : 'Edit'}</button><button className="voice-ignore" onClick={() => { setDrafts(items => items.filter(item => item.id !== draft.id)); setError(''); }}>Remove</button></div>
      </article>)}</div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {!drafts.length && <p className="section-note">No commitments to confirm. Retry voice to start again.</p>}
      <button className="voice-primary replan-full" disabled={!drafts.length} onClick={() => { try { onConfirm(drafts.map(draft => itemFromDraft(draft))); } catch (error) { setError((error as Error).message); } }}>Confirm &amp; Replan</button>
      <button className="voice-secondary replan-full" onClick={retry}>Retry voice</button><p className="mock-note">Mock extraction · calendar changes require Apply Changes</p>
    </>}
  </aside>;
}
