import { emptyDraft, shiftDate, type CommitmentDraft } from './planner';
export const simulatedVoiceTranscript = 'I just got a final interview this Thursday at 2 AM, and I need to finish an online assessment by Wednesday at 11:59 PM.';
export function mockExtractCommitments(week: string, timezone: string): CommitmentDraft[] {
  const thursday = shiftDate(week, 3), wednesday = shiftDate(week, 2);
  return [
    { ...emptyDraft(thursday, timezone), id: `voice-interview-${thursday}`, title: 'Final Interview', start: '02:00', end: '03:00', category: 'meeting', project: 'Job Search', area: 'Career', workType: 'Interviews', priority: 'Critical', flexibility: 'Fixed', energy: 'High' },
    { ...emptyDraft(wednesday, timezone), id: `voice-assessment-${wednesday}`, title: 'Online Assessment', kind: 'deadline', deadlineDate: wednesday, deadlineTime: '23:59', category: 'deadline', project: 'Job Search', area: 'Career', workType: 'Assignments', priority: 'High', flexibility: 'Fixed', energy: 'Medium' },
  ];
}
