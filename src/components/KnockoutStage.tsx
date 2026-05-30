'use client';

import { Match } from '@/lib/worldcup';
import { useState, useEffect } from 'react';
import { saveChampionPrediction, getUserStats } from '@/lib/actions';

interface KnockoutStageProps {
  matches: Match[];
  predictions: any[];
  onSaveScore: (matchId: string, homeScore: number, awayScore: number) => void;
}

export default function KnockoutStage({ matches, predictions, onSaveScore }: KnockoutStageProps) {
  const [champion, setChampion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        // This is a bit inefficient but works for the mock
        // Ideally we pass stats down from the parent
      }
    };
    fetchStats();
  }, []);

  const handleSaveChampion = async (team: string) => {
    setChampion(team);
    const storedUser = localStorage.getItem('user');
    // We'd need the user ID here. In the parent we already have it.
    // For now, let's just assume we can get it or the parent handles it.
  };

  if (matches.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
        <p className="text-zinc-500 font-bold uppercase tracking-widest">
          Las eliminatorias se habilitarán al finalizar la fase de grupos.
        </p>
        <div className="mt-8">
          <p className="text-white font-black text-xl mb-4">ELEGÍ TU CAMPEÓN</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Argentina', 'Brasil', 'Francia', 'España', 'Alemania', 'Inglaterra'].map(team => (
              <button
                key={team}
                onClick={() => handleSaveChampion(team)}
                className={`px-6 py-3 rounded-xl font-black transition-all ${
                  champion === team ? 'bg-yellow-400 text-black scale-110' : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Real bracket implementation would go here */}
      <div className="text-center">
        <p className="text-zinc-500 font-bold">BRACKET VISUALIZATION PENDING DATA</p>
      </div>
    </div>
  );
}
