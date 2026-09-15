import { relationshipLabel } from '../hierarchy';
import { useEventColors } from '../appearance';
import { Check, Sparkles } from 'lucide-react';
import type { ReplanProposal } from '../mockReplan';
import { dateInZone, displayDate, displayTime, zoneLabel, type CalendarPreferences } from '../planner';

interface Props {
  proposal: ReplanProposal;
  preferences: CalendarPreferences;
  preview: boolean;
  applied: boolean;
  onPreview: () => void;
  onApply: () => void;
  onCancel: () => void;
}

export function ReplanPanel({ preview, applied, onPreview, onApply, onCancel, proposal, preferences }: Props) {
  const { projects, colorStyle, resolveColor } = useEventColors();
  const { recommendations } = proposal;
  const newCommitments = proposal.confirmed.map(item => `${item.title} — ${item.kind === 'deadline' ? 'Due ' : ''}${displayDate(dateInZone(item.startsAt ?? item.dueAt!, item.timezone))} · ${displayTime(item.startsAt ?? item.dueAt!, { ...preferences, timezone: item.timezone })} · ${zoneLabel(item.timezone)} · ${relationshipLabel(item, projects)}`);
  return <aside className="context-panel voice-panel" aria-label="Replanning recommendations">
    <header className="voice-panel-header"><div><span className="voice-header-icon"><Sparkles size={14} /></span><div><p className="eyebrow">YOUR WEEK CHANGED</p><strong>A little room to recover.</strong></div></div></header>
    <section className="voice-result-intro"><div className="recognized-label">Confirmed commitments</div><ul className="replan-commitments">{newCommitments.map((text, index) => <li data-color={resolveColor(proposal.confirmed[index])} style={colorStyle(proposal.confirmed[index])} key={text}>{text}</li>)}</ul><p className="section-note">Mock recommendations based on your confirmed details. Nothing changes until you apply.</p></section>
    <div className="commitment-list">{recommendations.map(item => <article className="replan-card" style={proposal.items.find(event => event.title === item.title) ? colorStyle(proposal.items.find(event => event.title === item.title)!) : undefined} key={item.title}>
      <span className={`replan-tag tag-${item.action.toLowerCase()}`}>{item.action}</span>
      <h3>{item.title}</h3><p>{item.schedule}</p><small>Reason: {item.reason}</small>
    </article>)}</div>
    <p className="capacity-principle">Free time ≠ available capacity.</p>
    <p className="section-note">Capacity follows scheduled effort and overnight work. Recovery time stays protected even when the calendar looks open.</p>
    {applied ? <><div className="voice-success" role="status"><Check size={16} /><strong>Your week has been updated.</strong></div><button className="voice-secondary replan-full" onClick={onCancel}>Back to calendar</button></> : <div className="voice-actions">
      <button className="voice-secondary replan-full" onClick={onPreview} aria-pressed={preview}>{preview ? 'Hide Preview' : 'Preview Changes'}</button>
      <button className="voice-primary replan-full" onClick={onApply}>Apply Changes</button>
      <button className="voice-ignore" onClick={onCancel}>Keep Current Plan</button>
    </div>}
  </aside>;
}
