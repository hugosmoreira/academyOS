/** Build gym-scoped staff app paths. Returns gym-selector when no gym is active. */
export function gymPath(gymId: string | null | undefined, segment: string): string {
  const normalized = segment.replace(/^\//, '');
  if (!gymId) return '/app/gym-selector';
  return `/app/gyms/${gymId}/${normalized}`;
}

/** Map a flat /app/* path to the gym-scoped equivalent. */
export function remapPathToGym(pathname: string, gymId: string): string | null {
  const flatMatch = pathname.match(/^\/app\/(.+)$/);
  if (!flatMatch) return null;

  const rest = flatMatch[1];
  if (rest === 'gym-selector' || rest.startsWith('gyms/')) return null;

  const segmentMap: Record<string, string> = {
    dashboard: 'dashboard',
    students: 'students',
    programs: 'programs',
    classes: 'programs',
    leads: 'leads',
    attendance: 'attendance',
    instructors: 'staff',
    staff: 'staff',
    promotions: 'promotions',
    plans: 'plans',
    billing: 'plans',
    collections: 'billing',
    events: 'events',
    messaging: 'messaging',
    waivers: 'waivers',
    settings: 'settings',
    reports: 'dashboard',
  };

  const parts = rest.split('/');
  const first = parts[0];
  const mapped = segmentMap[first];
  if (!mapped) return `/app/gyms/${gymId}/dashboard`;

  const tail = parts.slice(1).join('/');
  return tail ? `/app/gyms/${gymId}/${mapped}/${tail}` : `/app/gyms/${gymId}/${mapped}`;
}
