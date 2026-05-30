'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllPlayersWithStats } from '@/lib/actions';
import { PlayerCard } from '@/components/PlayerCard';
import { NewsFeed } from '@/components/NewsFeed';
import { Trophy, Star, TrendingUp, Wallet, Gavel, Award } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      router.push('/login');
    } else {
      loadData(loggedInUser);
    }
  }, [router]);

  const loadData = async (userName: string) => {
    try {
      const data = await getAllPlayersWithStats();
      setPlayers(data);

      const { data: profile } = await (await import('@/lib/supabase')).supabase
        .from('profiles')
        .select('*')
        .eq('full_name', userName)
        .single();
      
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                PICK'EM MUNDIAL
              </h1>
              <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">LosguRise Edition</p>
            </Link>
          </div>
          <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
            <nav className="flex items-center gap-4 mr-4">
              <Link href="/hall-of-fame" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>Salón de la Fama</span>
              </Link>
              <Link href="/tribunal" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                <Gavel className="w-4 h-4 text-orange-500" />
                <span>Tribunal</span>
              </Link>
            </nav>
            <div className="h-6 w-px bg-zinc-800 hidden md:block" />
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Miembro</span>
                <span className="text-white font-bold">{user?.full_name}</span>
              </div>
              <div className="h-10 w-px bg-zinc-800" />
              <button 
                onClick={() => {
                  localStorage.removeItem('user');
                  router.push('/login');
                }}
                className="text-xs font-black uppercase py-3 px-6 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all hover:scale-105 active:scale-95 border border-zinc-700"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Link href="/voting" className="lg:col-span-2 group">
            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black p-8 rounded-[2.5rem] border border-zinc-800 hover:border-orange-500/50 transition-all h-full">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="text-orange-500 w-6 h-6 fill-orange-500" />
                  <span className="text-orange-500 font-black text-xs uppercase tracking-[0.2em]">Fase 2 Activa</span>
                </div>
                <h2 className="text-5xl font-black mb-4 group-hover:translate-x-2 transition-transform duration-300">SISTEMA DE VOTACIÓN FIFA</h2>
                <p className="text-zinc-400 text-lg max-w-xl mb-8">Rankeá a los pibes en sus 9 atributos y generá las cartas oficiales de LosguRise. Tu voto decide quién es el más termo.</p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-black font-black rounded-xl uppercase tracking-tighter hover:bg-orange-400 transition-colors">
                  VOTAR AHORA
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full group-hover:bg-orange-500/20 transition-all duration-500" />
            </div>
          </Link>

          <Link href="/shop" className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col justify-between hover:border-yellow-500/50 transition-all group">
            <div className="flex justify-between items-start">
              <Wallet className="text-yellow-500 w-10 h-10 group-hover:scale-110 transition-transform" />
              <div className="px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                GuriShop
              </div>
            </div>
            <div>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-1">GuriCoins Balance</p>
              <p className="text-6xl font-black text-white">{user?.balance || 0} <span className="text-yellow-500">GC</span></p>
            </div>
            <p className="text-zinc-500 text-xs font-medium italic underline">Ir a la tienda →</p>
          </Link>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
          <div className="lg:col-span-3">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="text-yellow-500 w-5 h-5" />
                  <span className="text-yellow-500 font-black text-xs uppercase tracking-[0.2em]">Vestuario</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase">CARTAS OFICIALES</h2>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                <TrendingUp className="w-4 h-4" />
                Actualizado en tiempo real
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {players.map((player) => (
                <PlayerCard 
                  key={player.id}
                  name={player.full_name}
                  stats={player.stats}
                  avatarUrl={player.avatar_url}
                />
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <NewsFeed />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/pickem" className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 hover:border-orange-500/50 transition-all group">
            <h2 className="text-xl font-black mb-2 italic group-hover:text-orange-500 transition-colors">/PICKEM</h2>
            <p className="text-zinc-500 text-xs mb-4 uppercase tracking-widest font-bold">Mundial 2026</p>
            <p className="text-zinc-400 text-sm">Completá tus predicciones para el Mundial 2026 y subí de Tier.</p>
          </Link>
          <Link href="/guribets" className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 hover:border-orange-500/50 transition-all group">
            <h2 className="text-xl font-black mb-2 italic group-hover:text-orange-500 transition-colors">/GURIBETS</h2>
            <p className="text-zinc-500 text-xs mb-4 uppercase tracking-widest font-bold">Mercado de pases</p>
            <p className="text-zinc-400 text-sm">Apostá quién llega primero al asado o quién se olvida el carbón.</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
