/** The token table from section 4.1, shown on /design as swatches. */
export interface TokenRow {
  name: string;
  light: string;
  dark: string;
  use: string;
}

export const COLOR_TOKENS: readonly TokenRow[] = [
  { name: '--canvas', light: '#F6F7F9', dark: '#0E1116', use: 'App background' },
  { name: '--surface', light: '#FFFFFF', dark: '#151A21', use: 'Cards, sidebar, top bar' },
  { name: '--surface-muted', light: '#F1F3F5', dark: '#1B2129', use: 'Table headers, wells' },
  { name: '--border', light: '#E4E7EC', dark: '#2A313B', use: 'Hairlines (1px)' },
  { name: '--text', light: '#0B1B2B', dark: '#E6EAF0', use: 'Primary text' },
  { name: '--text-muted', light: '#5B6676', dark: '#98A2B3', use: 'Secondary text' },
  { name: '--brand', light: '#0F6B66', dark: '#2DB3A9', use: 'Primary actions, active nav' },
  { name: '--brand-soft', light: '#E6F2F1', dark: '#123331', use: 'Active nav, selected rows' },
  { name: '--urgent', light: '#B42318', dark: '#F97066', use: 'Overdue clocks, safety flags' },
  { name: '--warning', light: '#B54708', dark: '#FDB022', use: 'Conflicts, single-source facts' },
  { name: '--info', light: '#175CD3', dark: '#84ADFF', use: 'Informational chips' },
  { name: '--success', light: '#067647', dark: '#47CD89', use: 'Verified, completed' },
  { name: '--focus', light: '#2E90FA', dark: '#53B1FD', use: 'Focus ring (2px + 2px offset)' },
  {
    name: '--on-accent',
    light: '#FFFFFF',
    dark: '#0B1B2B',
    use: 'Text on a filled brand or urgent surface',
  },
];

export const TYPE_SCALE: readonly { size: string; className: string; use: string }[] = [
  { size: '30px', className: 'text-2xl', use: 'Page title' },
  { size: '24px', className: 'text-xl', use: 'Section title, stat value' },
  { size: '20px', className: 'text-lg', use: 'Card title, dialog title' },
  { size: '16px', className: 'text-base', use: 'Lead paragraph, card heading' },
  { size: '14px', className: 'text-sm', use: 'Body, table cells' },
  { size: '13px', className: 'text-xs', use: 'Secondary text, chips' },
  { size: '12px', className: 'text-2xs', use: 'Table headers, marks, captions' },
];

export const RADII: readonly { name: string; value: string; use: string }[] = [
  { name: '--radius-input', value: '6px', use: 'Inputs, chips, buttons' },
  { name: '--radius-card', value: '10px', use: 'Cards, popovers' },
  { name: '--radius-dialog', value: '14px', use: 'Dialogs, drawers' },
];

export const SPACING: readonly { label: string; px: number }[] = [
  { label: '4', px: 4 },
  { label: '8', px: 8 },
  { label: '12', px: 12 },
  { label: '16', px: 16 },
  { label: '20', px: 20 },
  { label: '24', px: 24 },
  { label: '32', px: 32 },
];
