export const formatMMK = (value: number) => `${Math.round(value).toLocaleString('en-US')} MMK`;

export const getTierColor = (tier: string) => {
  const t = tier.toUpperCase();
  if (['HIGH', 'TOP', 'PEAK', 'DOMINANT'].includes(t)) {
    return { text: 'text-[#b8791f]', bg: 'bg-[#f7edd9]', fill: 'bg-[#e0a53d]' };
  }
  if (['MEDIUM', 'AVERAGE', 'NORMAL', 'MODERATE'].includes(t)) {
    return { text: 'text-[#1f9d63]', bg: 'bg-[#e4f6ec]', fill: 'bg-[#2fb579]' };
  }
  return { text: 'text-[#c8443a]', bg: 'bg-[#fbe9e7]', fill: 'bg-[#e2665a]' };
};

// Mirrors the COBOL report's status pills, one per forecast section.
export const SECTION_BADGE = {
  route: { label: 'ACTIVE', text: 'text-[#3d3fc7]', bg: 'bg-[#eaeafb]' },
  agent: { label: 'PREDICTIVE', text: 'text-[#1f9d63]', bg: 'bg-[#e4f6ec]' },
  season: { label: '12-MONTH', text: 'text-[#b8791f]', bg: 'bg-[#f7edd9]' },
  airline: { label: 'COMPETITIVE', text: 'text-[#c8443a]', bg: 'bg-[#fbe9e7]' },
} as const;