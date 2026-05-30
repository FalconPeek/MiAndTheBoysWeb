'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfiles, saveVotes, PlayerAttribute } from '@/lib/actions';
import { ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

const ATTRIBUTES: PlayerAttribute[] = ['Pace', 'Shot', 'Pass', 'Dribbling', 'Defense', 'Physical', 'GAY', 'PUTEADOR', 'TERMO'];

export default function VotingPage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentAttrIndex, setCurrentAttrIndex] = useState(0);
  const [rankings, setRankings] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    getProfiles().then(allProfiles => {
      const others = allProfiles.filter(p => p.full_name !== user);
      setProfiles(others);
      
      // Initialize rankings for each attribute with the default order
      const initialRankings: Record<string, string[]> = {};
      ATTRIBUTES.forEach(attr => {
        initialRankings[attr] = others.map(p => p.id);
      });
      setRankings(initialRankings);
    });
  }, [router]);

  const move = (attr: string, index: number, direction: 'up' | 'down') => {
    const newRankings = { ...rankings };
    const currentRanking = [...newRankings[attr]];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < currentRanking.length) {
      const temp = currentRanking[index];
      currentRanking[index] = currentRanking[targetIndex];
      currentRanking[targetIndex] = temp;
      newRankings[attr] = currentRanking;
      setRankings(newRankings);
    }
  };

  const nextAttr = () => {
    if (currentAttrIndex < ATTRIBUTES.length - 1) {
      setCurrentAttrIndex(currentAttrIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const prevAttr = () => {
    if (currentAttrIndex > 0) {
      setCurrentAttrIndex(currentAttrIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await saveVotes(currentUser, rankings as Record<PlayerAttribute, string[]>);
      setIsDone(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      console.error(error);
      alert('Error al guardar los votos');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser || profiles.length === 0) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>;

  if (isDone) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
        <h1 className="text-3xl font-black text-center">¡VOTOS REGISTRADOS!</h1>
        <p className="text-zinc-400 mt-2 text-center uppercase tracking-widest font-bold">Calculando nuevas cartas...</p>
      </div>
    );
  }

  const currentAttr = ATTRIBUTES[currentAttrIndex];
  const currentOrder = rankings[currentAttr];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 uppercase">
            Ranking de {currentAttr}
          </h1>
          <div className="mt-4 flex justify-center gap-1">
            {ATTRIBUTES.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 w-8 rounded-full transition-all ${idx <= currentAttrIndex ? 'bg-orange-500' : 'bg-zinc-800'}`}
              />
            ))}
          </div>
          <p className="mt-4 text-zinc-500 font-bold uppercase text-xs tracking-widest">
            Atributo {currentAttrIndex + 1} de {ATTRIBUTES.length}
          </p>
        </header>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-zinc-800/50 border-b border-zinc-700/50 flex justify-between items-center">
            <span className="text-xs font-black text-zinc-500 uppercase">Posición</span>
            <span className="text-xs font-black text-zinc-500 uppercase">Puntos</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {currentOrder.map((id, index) => {
              const profile = profiles.find(p => p.id === id);
              return (
                <div key={id} className="flex items-center p-4 group hover:bg-zinc-800/30 transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center font-black text-zinc-600 group-hover:text-yellow-500 transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1 ml-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold mr-3">
                      {profile.full_name.charAt(0)}
                    </div>
                    <span className="font-bold text-zinc-200">{profile.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mr-4 font-black text-zinc-500 text-sm">{10 - index} pts</span>
                    <button 
                      onClick={() => move(currentAttr, index, 'up')}
                      disabled={index === 0}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 transition-all"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => move(currentAttr, index, 'down')}
                      disabled={index === currentOrder.length - 1}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 transition-all"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={prevAttr}
            disabled={currentAttrIndex === 0}
            className="flex-1 py-4 px-6 rounded-2xl bg-zinc-900 border border-zinc-800 font-bold hover:bg-zinc-800 transition-all disabled:opacity-30"
          >
            ANTERIOR
          </button>
          <button
            onClick={nextAttr}
            disabled={isSubmitting}
            className="flex-[2] py-4 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {isSubmitting ? 'GUARDANDO...' : currentAttrIndex === ATTRIBUTES.length - 1 ? 'FINALIZAR VOTACIÓN' : 'SIGUIENTE ATRIBUTO'}
          </button>
        </div>
      </div>
    </div>
  );
}
