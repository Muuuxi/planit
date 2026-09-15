// Intentional legacy names: retain these solely to preserve existing browser data.
export function migrateLegacyStorage(storage: Storage) {
  const pairs = [
    ['chronoflow-items-v4', 'planit-items-v4'],
    ['chronoflow-preferences-v1', 'planit-preferences-v1'],
    ['chronoflow-projects-v1', 'planit-projects-v1'],
    ['chronoflow-demo-session-v1', 'planit-demo-session-v1'],
  ];
  // Copy first; remove legacy keys only after every destination write succeeds.
  // Existing Planit data always wins. Removing old session data prevents logout resurrection.
  for (const [oldKey, newKey] of pairs) {
    const value = storage.getItem(oldKey);
    if (value !== null && storage.getItem(newKey) === null) storage.setItem(newKey, value);
  }
  let existingProjectName: string | undefined;
  try {
    const projects = JSON.parse(storage.getItem('planit-projects-v1') ?? 'null');
    if (Array.isArray(projects) && projects.some(project => project?.name === 'ChronoFlow') && projects.some(project => project?.name === 'Planit')) {
      existingProjectName = 'Planit (existing)';
      while (projects.some(project => project?.name === existingProjectName)) existingProjectName += ' (existing)';
    }
  } catch { /* Invalid data is handled by the planner's normal validation. */ }
  const updates: [string, string][] = [];
  for (const [, key] of pairs) {
    const raw = storage.getItem(key);
    if (!raw) continue;
    let value;
    try { value = JSON.parse(raw); } catch { continue; }
    if (key === 'planit-items-v4' && Array.isArray(value)) {
      value = value.map(item => item?.project === 'ChronoFlow' ? { ...item, project: 'Planit' } : existingProjectName && item?.project === 'Planit' ? { ...item, project: existingProjectName } : item);
    }
    if (key === 'planit-projects-v1' && Array.isArray(value)) {
      // Preserve both projects and their colors if the user already named one Planit.
      if (existingProjectName) value = value.map(project => project?.name === 'Planit' ? { ...project, name: existingProjectName } : project);
      value = value.map(project => project?.name === 'ChronoFlow' ? { ...project, name: 'Planit' } : project);
    }
    if (key === 'planit-demo-session-v1' && typeof value?.email === 'string') {
      value = { ...value, email: value.email.replace(/@demo\.chronoflow\.local$/, '@demo.planit.local') };
    }
    updates.push([key, JSON.stringify(value)]);
  }
  for (const [key, value] of updates) storage.setItem(key, value);
  for (const [oldKey] of pairs) storage.removeItem(oldKey);
}
