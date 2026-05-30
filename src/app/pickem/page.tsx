'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfiles, getUserPredictions, savePrediction, getUserStats } from '@/lib/actions';
import { getMatches, Match } from '@/lib/worldcup';
import GroupStage from '@/components/GroupStage';
import KnockoutStage from '@/components/KnockoutStage';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Prediction {
  match_id: string;
  predicted_home: number;
  predicted_away: number;
}

interface UserStats {
  total_points: number;
  tier: string;
  champion_prediction?: string;
}

export default function PickEmPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'groups' | 'knockout'>('groups');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const allProfiles = await getProfiles();
        setProfiles(allProfiles);
        
        const currentUser = allProfiles.find(p => p.full_name === storedUser);
        if (currentUser) {
          setUser(currentUser);
          const [userPreds, allMatches, userStats] = await Promise.all([
            getUserPredictions(currentUser.id),
            getMatches(),
            getUserStats(currentUser.id)
          ]);
          setPredictions(userPreds);
          setMatches(allMatches);
          setStats(userStats);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSaveScore = async (matchId: string, homeScore: number, awayScore: number) => {
    if (!user) return;
    try {
      await savePrediction(user.id, matchId, homeScore, awayScore);
      // Update local state
      setPredictions(prev => {
        const existing = prev.findIndex(p => p.match_id === matchId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], predicted_home: homeScore, predicted_away: awayScore };
          return updated;
        }
        return [...prev, { match_id: matchId, predicted_home: homeScore, predicted_away: awayScore }];
      });
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl font-bold animate-pulse">CARGANDO MUNDIAL...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">
            PICK&apos;EM 2026
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest mt-1">
            World Cup Predictor
          </p>
        </div>
        
        {stats && (
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-500 uppercase">Puntos</p>
              <p className="text-2xl font-black text-white">{stats.total_points || 0}</p>
            </div>
            <div className="h-10 w-[1px] bg-zinc-800" />
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-500 uppercase">Tier</p>
              <p className={`text-2xl font-black ${
                stats.tier === 'Diamond' ? 'text-cyan-400' :
                stats.tier === 'Gold' ? 'text-yellow-400' :
                stats.tier === 'Silver' ? 'text-zinc-300' :
                'text-orange-600'
              }`}>{stats.tier || 'Bronze'}</p>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex gap-2 mb-8 bg-zinc-900 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'groups' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            FASE DE GRUPOS
          </button>
          <button
            onClick={() => setActiveTab('knockout')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'knockout' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ELIMINATORIAS
          </button>
        </div>

        {activeTab === 'groups' ? (
          <GroupStage 
            matches={matches.filter(m => m.stage === 'GROUP')} 
            predictions={predictions}
            onSaveScore={handleSaveScore}
          />
        ) : (
          <KnockoutStage 
            matches={matches.filter(m => m.stage !== 'GROUP')}
            predictions={predictions}
            onSaveScore={handleSaveScore}
          />
        )}
      </main>
    </div>
  );
}
