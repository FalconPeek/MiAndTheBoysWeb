'use client';

import { Match } from '@/lib/worldcup';
import { useState } from 'react';

interface GroupStageProps {
  matches: Match[];
  predictions: any[];
  onSaveScore: (matchId: string, homeScore: number, awayScore: number) => void;
}

export default function GroupStage({ matches, predictions, onSaveScore }: GroupStageProps) {
  // Group matches by group_name
  const groups = matches.reduce((acc, match) => {
    const groupName = match.group_name || 'Otros';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {Object.entries(groups).sort().map(([groupName, groupMatches]) => (
        <div key={groupName} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-orange-500 rounded-full" />
            {groupName}
          </h3>
          <div className="space-y-4">
            {groupMatches.map((match) => {
              const prediction = predictions.find(p => p.match_id === match.id);
              return (
                <MatchRow 
                  key={match.id} 
                  match={match} 
                  prediction={prediction} 
                  onSave={onSaveScore} 
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatchRow({ match, prediction, onSave }: { match: Match, prediction?: any, onSave: any }) {
  const [homeScore, setHomeScore] = useState(prediction?.predicted_home?.toString() || '');
  const [awayScore, setAwayScore] = useState(prediction?.predicted_away?.toString() || '');

  const handleBlur = () => {
    if (homeScore !== '' && awayScore !== '') {
      onSave(match.id, parseInt(homeScore), parseInt(awayScore));
    }
  };

  return (
    <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800/50 hover:border-orange-500/30 transition-all">
      <div className="flex-1 flex items-center gap-3">
        <span className="text-2xl">{match.home_flag}</span>
        <span className="font-bold text-sm hidden sm:inline">{match.home_team}</span>
        <span className="font-bold text-sm sm:hidden">{match.home_team.substring(0, 3).toUpperCase()}</span>
      </div>

      <div className="flex items-center gap-2 px-4">
        <input
          type="number"
          min="0"
          value={homeScore}
          onChange={(e) => setHomeScore(e.target.value)}
          onBlur={handleBlur}
          placeholder="-"
          className="w-10 h-10 bg-black border border-zinc-700 rounded-lg text-center font-black text-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        />
        <span className="text-zinc-600 font-bold">VS</span>
        <input
          type="number"
          min="0"
          value={awayScore}
          onChange={(e) => setAwayScore(e.target.value)}
          onBlur={handleBlur}
          placeholder="-"
          className="w-10 h-10 bg-black border border-zinc-700 rounded-lg text-center font-black text-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        />
      </div>

      <div className="flex-1 flex items-center justify-end gap-3 text-right">
        <span className="font-bold text-sm hidden sm:inline">{match.away_team}</span>
        <span className="font-bold text-sm sm:hidden">{match.away_team.substring(0, 3).toUpperCase()}</span>
        <span className="text-2xl">{match.away_flag}</span>
      </div>
    </div>
  );
}
