import { useEffect, useRef, useState } from 'react';
import { Mic, Plus } from 'lucide-react';

export function QuickAdd({ collapsed = false, onAdd, onSpeak }: { collapsed?: boolean; onAdd: () => void; onSpeak: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLButtonElement>('.quick-add-actions button')?.focus();
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  const actions = <><h3>Quick Add</h3><div className="quick-add-actions"><button type="button" onClick={() => { setOpen(false); onAdd(); }}><Plus size={15} />Add event</button><button className="quick-add-voice" type="button" onClick={() => { setOpen(false); onSpeak(); }}><Mic size={15} />Speak a change</button></div></>;
  return <div ref={root} className={collapsed ? 'quick-add-collapsed' : 'quick-add'} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    {collapsed ? <><button ref={trigger} className="quick-add-trigger" type="button" title="Quick Add" aria-label="Quick Add" aria-haspopup="dialog" aria-expanded={open} aria-controls="quick-add-popover" onClick={() => setOpen(value => !value)}><Plus size={19} /></button>{open && <div className="quick-add-popover" id="quick-add-popover" role="dialog" aria-label="Quick Add">{actions}</div>}</> : actions}
  </div>;
}
