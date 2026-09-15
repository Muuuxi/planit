import { palette, type EventColor } from '../appearance';
export function ColorPicker({ value, onChange, disabled = false, label = 'Event color' }: { value: EventColor; onChange: (color: EventColor) => void; disabled?: boolean; label?: string }) {
  return <fieldset className="color-picker" disabled={disabled}><legend>{label}</legend><div className="swatch-grid">{Object.entries(palette).map(([id, entry]) => <button key={id} type="button" className="color-swatch" style={{ background: entry.accent }} aria-label={entry.name} aria-pressed={value === id} title={entry.name} onClick={() => onChange(id as EventColor)}>{value === id ? '✓' : ''}</button>)}</div></fieldset>;
}
