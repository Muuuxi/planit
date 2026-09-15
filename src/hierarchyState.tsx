import { createContext, useContext, useState, type ReactNode } from 'react';
type Expansion = { isOpen: (key: string) => boolean; toggle: (key: string) => void };
const ExpansionContext = createContext<Expansion>({ isOpen: () => true, toggle: () => {} });
export const hierarchyKey = (...parts: string[]) => JSON.stringify(parts);
export function HierarchyProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return <ExpansionContext.Provider value={{ isOpen: key => expanded[key] ?? true, toggle: key => setExpanded(current => ({ ...current, [key]: !(current[key] ?? true) })) }}>{children}</ExpansionContext.Provider>;
}
export const useHierarchy = () => useContext(ExpansionContext);
