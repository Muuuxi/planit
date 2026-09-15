# Bright White and shared information colors

Existing themes remain available. Bright White is opt-in and persists with the existing preferences.

## Bright White surface tokens

| Token | Value | Use |
| --- | --- | --- |
| `--canvas`, `--paper` | `#FFFFFF` | Main canvas and cards |
| `--sidebar-bg` | `#F7F9FC` | Primary rail |
| `--context-bg` | `#FAFBFC` | Secondary sidebar |
| `--line` | `#E5EAF0` | Borders and calendar grid |
| `--line-strong` | `#CBD5E1` | Controls |
| `--ink` | `#182230` | Primary content |
| `--muted` | `#667085` | Secondary content |
| `--accent`, `--focus-ring` | `#2F6BFF` | Selection and focus |
| `--accent-strong` | `#2454CC` | High-contrast filled buttons |
| `--accent-soft` | `#EEF4FF` | Selected/hover surfaces |
| `--now-line` | `#E5484D` | Current-time line |
| `--now-text`, `--danger` | `#B42329` | Readable warning text |

## Shared project/event palette

`src/appearance.tsx` is the single palette source. It supplies `--item-bg`, `--item-accent`, and `--item-text` to every view through `swatchStyle` / `useEventColors`.

| Color | Background | Accent | Text |
| --- | --- | --- | --- |
| Blue | `#E1EDFF` | `#3478D4` | `#173B68` |
| Green | `#E2F2E6` | `#438A5E` | `#244F34` |
| Purple | `#EEE6FA` | `#7A5CB3` | `#49356D` |
| Red | `#FBE3E3` | `#D45353` | `#792E2E` |
| Orange | `#FCEBD8` | `#C87931` | `#70411C` |
| Yellow | `#FFF4C7` | `#C79622` | `#694D08` |
| Pink | `#F9E2EC` | `#C76089` | `#75344E` |
| Teal | `#DCF2EE` | `#26877E` | `#18594F` |
| Indigo | `#E5E9FF` | `#596AC4` | `#303F85` |
| Gray | `#EDF0F4` | `#74818D` | `#3B4854` |

These are opaque surfaces, independent of the selected theme. Completion uses strikethrough, not card opacity. Protected time uses opaque stripes; proposals retain dashed borders and previous-time cards use a solid neutral background. Text/background palette pairs are tested for a contrast ratio of at least 4.5:1. This check is not a full accessibility audit.

## Hierarchy

Projects own area, default color and work types. Events refer to their project and retain work type, plus a fallback area for new projects created from an event. The shared relationship resolver treats the project's area as authoritative. The same project and event data drives main Projects content, secondary navigation, Calendar, priorities, deadlines and confirmation/replanning.

Legacy Academic data is classified into AIPI 590 when the title identifies that course or its final project; other legacy academic work is retained under Academic planning. Existing custom colors remain intact; when moving a legacy event to a differently colored course, its previous color becomes an explicit override. IDs, dates, completion, notes and local settings are retained. Missing course examples are added once for legacy registries, not recreated after later user renames.

Hierarchy expansion lives in React context for the current signed-in session. Individual tasks are content under Work Types, never a fourth navigation level.
