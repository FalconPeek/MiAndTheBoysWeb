'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHallOfFameData } from '@/lib/actions';
import { Trophy, Award, TrendingUp, Skull, ChevronLeft, Star, Crown } from 'lucide-react';

export default function HallOfFamePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getHallOfFameData();
      setData(result);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;

  const LeaderboardCard = ({ title, icon: Icon, items, color, unit }: any) => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
      <div className={`p-8 border-b border-zinc-800 flex items-center gap-4 bg-gradient-to-r ${color}/10 to-transparent`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}-500/20`}>
          <Icon className={`text-${color}-500 w-6 h-6`} />
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h2>
      </div>
      <div className="p-8 space-y-4">
        {items.slice(0, 5).map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                idx === 0 ? 'bg-yellow-500 text-black' : 
                idx === 1 ? 'bg-zinc-400 text-black' : 
                idx === 2 ? 'bg-orange-700 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {idx === 0 ? <Crown className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`font-bold transition-colors ${idx === 0 ? 'text-white text-lg' : 'text-zinc-400 group-hover:text-white'}`}>
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-black ${idx === 0 ? 'text-2xl text-white' : 'text-xl text-zinc-500'}`}>
                {item.score}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors text-xs font-black uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
          <div className="flex flex-col items-center">
            <div className="relative">
              <Trophy className="w-20 h-20 text-yellow-500 mb-4 animate-pulse" />
              <Star className="absolute -top-2 -right-2 w-8 h-8 text-orange-500 fill-orange-500 animate-bounce" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
              SALÓN DE LA FAMA
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-xs tracking-[0.5em] mt-4">La gloria eterna de LosguRise</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <LeaderboardCard 
            title="Pick'Em Masters" 
            icon={Trophy} 
            items={data.pickem} 
            color="yellow" 
            unit="PTS"
          />
          <LeaderboardCard 
            title="FIFA Legends" 
            icon={Award} 
            items={data.fifa} 
            color="blue" 
            unit="OVR"
          />
          <LeaderboardCard 
            title="Casino Whales" 
            icon={TrendingUp} 
            items={data.casino} 
            color="green" 
            unit="GC"
          />
          <LeaderboardCard 
            title="Most Wanted" 
            icon={Skull} 
            items={data.wanted} 
            color="red" 
            unit="FALTAS"
          />
        </div>

        <footer className="text-center py-20 border-t border-zinc-900">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Pick'Em Mundial LosguRise © 2024</p>
        </footer>
      </div>
    </main>
  );
}
