import { useState } from 'react';
import { timezones } from '../planner';

export function TimezoneSelect({ value, onChange }: { value: string; onChange: (zone: string) => void }) {
  const [search, setSearch] = useState('');
  const options = timezones.filter(zone => zone.value === value || `${zone.label} ${zone.value}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="timezone-select"><label><span>Search timezones</span><input type="search" placeholder="City or timezone" value={search} onChange={event => setSearch(event.target.value)} /></label><label><span>Timezone</span><select aria-label="Timezone" value={value} onChange={event => onChange(event.target.value)}>{options.map(zone => <option key={zone.value} value={zone.value}>{zone.label} / {zone.value}</option>)}</select></label></div>;
}
