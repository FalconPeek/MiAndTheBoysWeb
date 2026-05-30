'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBettingEvent, settleEvent } from '@/lib/actions';
import { ShieldCheck, Plus, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function GuriBetsAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'SPORTS' | 'SOCIAL'>('SPORTS');
  const [options, setOptions] = useState<{ key: string, value: string }[]>([
    { key: '1', value: '' },
    { key: '2', value: '' }
  ]);
  const [events, setEvents] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userName = localStorage.getItem('user');
    if (userName !== 'Lucas Barbagallo') {
      router.push('/');
    } else {
      loadData(userName);
    }
  }, [router]);

  const loadData = async (userName: string) => {
    try {
      const { data: profile } = await (await import('@/lib/supabase')).supabase
        .from('profiles')
        .select('*')
        .eq('full_name', userName)
        .single();
      setUser(profile);

      const { data: allEvents } = await (await import('@/lib/supabase')).supabase
        .from('betting_events')
        .select('*')
        .order('created_at', { ascending: false });
      setEvents(allEvents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const optionsObj: Record<string, string> = {};
      options.forEach(opt => {
        if (opt.key && opt.value) optionsObj[opt.key] = opt.value;
      });

      await createBettingEvent(title, description, type, optionsObj);
      alert('Evento creado');
      setTitle('');
      setDescription('');
      setOptions([{ key: '1', value: '' }, { key: '2', value: '' }]);
      loadData(user.full_name);
    } catch (err) {
      console.error(err);
      alert('Error al crear evento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettle = async (eventId: string, outcome: string) => {
    if (!confirm(`¿Seguro que querés liquidar el evento con el resultado: ${outcome}?`)) return;
    try {
      await settleEvent(eventId, outcome);
      alert('Evento liquidado y premios distribuidos');
      loadData(user.full_name);
    } catch (err) {
      console.error(err);
      alert('Error al liquidar evento');
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
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-orange-500 w-8 h-8" />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Panel</h1>
          </div>
          <Link href="/guribets" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">
            Volver a GuriBets
          </Link>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Create Event Form */}
          <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <Plus className="text-orange-500 w-5 h-5" />
              Crear Nuevo Evento
            </h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Título</label>
                <input
                  required
                  className="w-full bg-zinc-800 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Descripción</label>
                <textarea
                  className="w-full bg-zinc-800 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 transition-all h-24"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Tipo</label>
                <select
                  className="w-full bg-zinc-800 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 transition-all"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="SPORTS">SPORTS</option>
                  <option value="SOCIAL">SOCIAL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 ml-1">Opciones</label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        placeholder="Key (e.g. 1)"
                        className="w-20 bg-zinc-800 border-0 rounded-xl px-4 py-2 text-xs"
                        value={opt.key}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[idx].key = e.target.value;
                          setOptions(newOpts);
                        }}
                      />
                      <input
                        placeholder="Nombre (e.g. Argentina)"
                        className="flex-1 bg-zinc-800 border-0 rounded-xl px-4 py-2 text-xs"
                        value={opt.value}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[idx].value = e.target.value;
                          setOptions(newOpts);
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                        className="text-zinc-600 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setOptions([...options, { key: (options.length + 1).toString(), value: '' }])}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all mt-2"
                  >
                    + Agregar Opción
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black rounded-xl transition-all disabled:opacity-50 uppercase mt-4"
              >
                {submitting ? 'CREANDO...' : 'CREAR EVENTO'}
              </button>
            </form>
          </div>

          {/* List Events to Settle */}
          <div className="space-y-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-green-500 w-5 h-5" />
              Liquidar Eventos
            </h2>
            {events.map((event) => (
              <div key={event.id} className={`bg-zinc-900 p-6 rounded-3xl border ${event.status === 'SETTLED' ? 'border-zinc-800 opacity-60' : 'border-zinc-700'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black">{event.title}</h3>
                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${event.status === 'SETTLED' ? 'bg-zinc-800 text-zinc-500' : 'bg-green-500/10 text-green-500'}`}>
                    {event.status}
                  </span>
                </div>
                {event.status !== 'SETTLED' && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(event.options).map(([key, label]: [string, any]) => (
                      <button
                        key={key}
                        onClick={() => handleSettle(event.id, key)}
                        className="px-3 py-2 bg-zinc-800 hover:bg-green-500 hover:text-black text-xs font-bold rounded-lg transition-all"
                      >
                        Gana {label}
                      </button>
                    ))}
                  </div>
                )}
                {event.status === 'SETTLED' && (
                  <p className="text-xs text-zinc-500">Ganador: {event.options[event.winning_outcome]}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
