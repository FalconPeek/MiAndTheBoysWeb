export interface Team {
  id: string;
  name: string;
  flag: string;
}

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  group_name?: string;
  stage: string;
  match_date: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  home_score?: number;
  away_score?: number;
}

// Mock data for World Cup 2026
const MOCK_MATCHES: Match[] = [
  // Group A
  {
    id: 'wc2026-1',
    home_team: 'USA',
    away_team: 'Morocco',
    home_flag: '🇺🇸',
    away_flag: '🇲🇦',
    group_name: 'Group A',
    stage: 'GROUP',
    match_date: '2026-06-11T18:00:00Z',
    status: 'SCHEDULED',
  },
  {
    id: 'wc2026-2',
    home_team: 'Mexico',
    away_team: 'Australia',
    home_flag: '🇲🇽',
    away_flag: '🇦🇺',
    group_name: 'Group A',
    stage: 'GROUP',
    match_date: '2026-06-11T21:00:00Z',
    status: 'SCHEDULED',
  },
  // Group B
  {
    id: 'wc2026-3',
    home_team: 'Canada',
    away_team: 'South Korea',
    home_flag: '🇨🇦',
    away_flag: '🇰🇷',
    group_name: 'Group B',
    stage: 'GROUP',
    match_date: '2026-06-12T18:00:00Z',
    status: 'SCHEDULED',
  },
  {
    id: 'wc2026-4',
    home_team: 'Argentina',
    away_team: 'Sweden',
    home_flag: '🇦🇷',
    away_flag: '🇸🇪',
    group_name: 'Group B',
    stage: 'GROUP',
    match_date: '2026-06-12T21:00:00Z',
    status: 'SCHEDULED',
  },
];

export async function getMatches(): Promise<Match[]> {
  // In a real scenario, this would fetch from Football-Data.org
  // For now, we simulate an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_MATCHES);
    }, 500);
  });
}

export async function getGroups() {
  const matches = await getMatches();
  const groups: Record<string, Match[]> = {};
  
  matches.forEach(match => {
    if (match.group_name) {
      if (!groups[match.group_name]) {
        groups[match.group_name] = [];
      }
      groups[match.group_name].push(match);
    }
  });
  
  return groups;
}

export function calculatePoints(prediction: { home: number, away: number }, result: { home: number, away: number }): number {
  // Perfect score: 3 points
  if (prediction.home === result.home && prediction.away === result.away) {
    return 3;
  }
  
  // Correct outcome: 1 point
  const predictionOutcome = Math.sign(prediction.home - prediction.away);
  const resultOutcome = Math.sign(result.home - result.away);
  
  if (predictionOutcome === resultOutcome) {
    return 1;
  }
  
  return 0;
}

export function getTier(points: number, predictedChampionCorrect: boolean): string {
  if (points > 60 && predictedChampionCorrect) return 'Diamond';
  if (points > 30) return 'Gold';
  if (points > 10) return 'Silver';
  return 'Bronze';
}
