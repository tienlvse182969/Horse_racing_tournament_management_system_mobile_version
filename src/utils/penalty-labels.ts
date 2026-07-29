export const PENALTY_APPLIED_LABEL: Record<string, string> = {
  warning: 'Cảnh cáo',
  result_void: 'Hủy kết quả',
  disqualify: 'Hủy kết quả',
  disqualification: 'Hủy kết quả',
  time_ban: 'Cấm thi đấu có thời hạn',
  permanent_ban: 'Cấm thi đấu vô thời hạn',
};

export const VIOLATION_TARGET_LABEL: Record<'horse' | 'jockey' | 'both', string> = {
  horse: 'Ngựa',
  jockey: 'Nài',
  both: 'Cả hai',
};

const RESULT_VOIDING_PENALTIES = new Set([
  'result_void',
  'disqualify',
  'disqualification',
  'time_ban',
  'permanent_ban',
]);

export function isResultVoidingPenalty(penaltyApplied?: string | null): boolean {
  return !!penaltyApplied && RESULT_VOIDING_PENALTIES.has(penaltyApplied);
}
