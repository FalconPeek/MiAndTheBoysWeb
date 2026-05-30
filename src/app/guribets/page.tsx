'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveBettingEvents, getProfile, placeBet } from '@/lib/actions';
import { Wallet, Trophy, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function GuriBetsPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [betAmounts, setBetAmounts] = useState<Record<string, number>>({});
  const [placingBet, setPlacingBet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userName = localStorage.getItem('user');
    if (!userName) {
      router.push('/login');
    } else {
      loadInitialData(userName);
    }
  }, [router]);

  const loadInitialData = async (userName: string) => {
    try {
      const { data: profiles } = await (await import('@/lib/supabase')).supabase
        .from('profiles')
        .select('*')
        .eq('full_name', userName)
        .single();
      
      if (profiles) {
        setUser(profiles);
      }

      const activeEvents = await getActiveBettingEvents();
      setEvents(activeEvents);
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBet = async (eventId: string, outcome: string) => {
    if (!user) return;
    const amount = betAmounts[eventId] || 0;
    if (amount <= 0) {
      alert('Ingresá un monto válido');
      return;
    }

    setPlacingBet(eventId);
    setError(null);
    try {
      await placeBet(user.id, eventId, outcome, amount);
      alert('Apuesta realizada con éxito');
      // Refresh data
      loadInitialData(user.full_name);
    } catch (err: any) {
      setError(err.message || 'Error al realizar la apuesta');
    } finally {
      setPlacingBet(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-orange-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Link href="/" className="group">
            <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:from-yellow-300 group-hover:to-orange-400 transition-all">
              GURIBETS
            </h1>
          </Link>
          <div className="bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-800 flex items-center gap-4">
            <Wallet className="text-yellow-500 w-5 h-5" />
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Balance</p>
              <p className="font-bold">{user?.balance || 0} <span className="text-yellow-500">GC</span></p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-950/30 border border-red-900/50 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <section className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="text-orange-500 w-5 h-5" />
              Eventos Activos
            </h2>
            {user?.full_name === 'Lucas Barbagallo' && (
              <Link href="/guribets/admin" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">
                Panel Admin
              </Link>
            )}
          </div>

          {events.length === 0 ? (
            <div className="bg-zinc-900/50 p-12 rounded-3xl border border-zinc-800 text-center">
              <p className="text-zinc-500 font-medium">No hay eventos activos en este momento.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black px-2 py-1 bg-zinc-800 rounded text-zinc-400 uppercase tracking-widest mb-2 inline-block">
                      {event.type}
                    </span>
                    <h3 className="text-2xl font-black">{event.title}</h3>
                    <p className="text-zinc-400 mt-1">{event.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pozo Total</p>
                    <p className="text-2xl font-black text-yellow-500">{event.total_pool || 0} GC</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Tu Apuesta</label>
                    <input
                      type="number"
                      placeholder="Monto en GC"
                      className="w-full bg-zinc-800 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 transition-all"
                      value={betAmounts[event.id] || ''}
                      onChange={(e) => setBetAmounts({ ...betAmounts, [event.id]: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(event.options).map(([key, label]: [string, any]) => (
                      <button
                        key={key}
                        disabled={placingBet === event.id}
                        onClick={() => handlePlaceBet(event.id, key)}
                        className="h-full px-4 py-3 bg-zinc-800 hover:bg-orange-500 hover:text-black font-black rounded-xl transition-all disabled:opacity-50 uppercase text-xs flex items-center justify-center text-center"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
