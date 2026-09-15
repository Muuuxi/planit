import { useEventColors } from '../appearance';
import { useState } from 'react';
import { X } from 'lucide-react';
import { CommitmentFields } from './CommitmentFields';
import { itemFromDraft, type CommitmentDraft, type PlannerItem } from '../planner';

export function EventEditor({ draft, existing, onSave, onDelete, onClose }: { draft: CommitmentDraft; existing?: PlannerItem; onSave: (item: PlannerItem) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const { colorStyle, resolveColor } = useEventColors();
  const [value, setValue] = useState(draft);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  return <aside data-color={resolveColor(value)} style={colorStyle(value)} className="context-panel settings-panel event-detail" aria-label="Event editor" onKeyDown={event => { if (event.key === 'Escape') onClose(); }}>
    <header className="voice-panel-header"><strong><span className="item-color-dot" />{existing ? 'Edit commitment' : 'Add commitment'}</strong><button aria-label="Close event editor" onClick={onClose}><X size={16} /></button></header>
    <form onSubmit={event => { event.preventDefault(); try { onSave({ ...itemFromDraft(value, existing?.completed), recovery: existing?.recovery }); } catch (error) { setError((error as Error).message); } }}>
      <CommitmentFields value={value} onChange={setValue} />
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="voice-primary replan-full" type="submit">Save commitment</button>
      {existing && <button className="voice-ignore replan-full" type="button" onClick={() => setDeleting(true)}>Delete commitment</button>}
      {deleting && <div className="delete-confirm"><p>Delete this commitment from all views?</p><button type="button" className="voice-secondary replan-full" onClick={() => onDelete(value.id)}>Confirm delete</button><button type="button" className="voice-ignore replan-full" onClick={() => setDeleting(false)}>Cancel delete</button></div>}
    </form>
  </aside>;
}
