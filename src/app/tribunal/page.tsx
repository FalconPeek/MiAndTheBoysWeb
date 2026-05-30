'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Gavel, AlertTriangle, CheckCircle, XCircle, Clock, ChevronLeft, Plus } from 'lucide-react';

export default function TribunalPage() {
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  const [formData, setFormData] = useState({ target_id: '', reason: '' });
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('full_name', userName)
        .single();
      
      if (profile) setUser(profile);

      const [reportsData, profilesData] = await Promise.all([
        supabase.from('tribunal_reports').select(`
          *,
          reporter:reporter_id(full_name),
          target:target_id(full_name),
          votes:tribunal_votes(vote, voter_id)
        `).order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name').neq('full_name', userName)
      ]);

      if (reportsData.data) setReports(reportsData.data);
      if (profilesData.data) setProfiles(profilesData.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.target_id || !formData.reason) return;

    const { error } = await supabase.from('tribunal_reports').insert({
      reporter_id: user.id,
      target_id: formData.target_id,
      reason: formData.reason,
      status: 'OPEN'
    });

    if (!error) {
      setIsReporting(false);
      setFormData({ target_id: '', reason: '' });
      loadData(user.full_name);
    }
  };

  const handleVote = async (reportId: string, vote: 'CULPABLE' | 'INOCENTE') => {
    const { error } = await supabase.from('tribunal_votes').upsert({
      report_id: reportId,
      voter_id: user.id,
      vote
    });

    if (!error) {
      loadData(user.full_name);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors text-xs font-black uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Gavel className="text-orange-500 w-8 h-8" />
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Tribunal de Faltas</h1>
              </div>
              <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">La justicia de LosguRise es lenta pero implacable</p>
            </div>
            <button 
              onClick={() => setIsReporting(true)}
              className="px-6 py-3 bg-white text-black font-black rounded-xl uppercase tracking-tighter hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              DENUNCIAR A UN AMIGO
            </button>
          </div>
        </header>

        {isReporting && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-md">
              <h2 className="text-2xl font-black mb-6 italic uppercase">Nueva Denuncia</h2>
              <form onSubmit={handleReport} className="space-y-6">
                <div>
                  <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Acusado</label>
                  <select 
                    className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white font-bold focus:border-orange-500 outline-none"
                    value={formData.target_id}
                    onChange={(e) => setFormData({...formData, target_id: e.target_id})}
                    required
                  >
                    <option value="">Seleccionar culpable...</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Motivo de la falta</label>
                  <textarea 
                    className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white font-bold focus:border-orange-500 outline-none h-32"
                    placeholder="Ej: Llegó 40 min tarde al asado y no trajo el fernet."
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsReporting(false)}
                    className="flex-1 px-6 py-4 bg-zinc-800 text-white font-black rounded-xl uppercase tracking-tighter hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 bg-orange-500 text-black font-black rounded-xl uppercase tracking-tighter hover:bg-orange-400 transition-colors"
                  >
                    Denunciar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {reports.map((report) => {
            const culpableVotes = report.votes.filter((v: any) => v.vote === 'CULPABLE').length;
            const inocenteVotes = report.votes.filter((v: any) => v.vote === 'INOCENTE').length;
            const userVote = report.votes.find((v: any) => v.voter_id === user.id)?.vote;
            const isExpired = new Date(report.expires_at) < new Date();

            return (
              <div key={report.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition-all">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                        <AlertTriangle className="text-orange-500 w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black tracking-tight italic">
                          {report.target?.full_name} <span className="text-zinc-600 font-normal not-italic px-2">vs</span> {report.reporter?.full_name}
                        </h3>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Expediente #{report.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                      report.status === 'OPEN' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                      report.status === 'CULPABLE' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {report.status}
                    </div>
                  </div>

                  <p className="text-lg text-zinc-300 mb-8 font-medium italic leading-relaxed">
                    "{report.reason}"
                  </p>

                  <div className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-zinc-800/50">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Culpable</p>
                        <p className="text-3xl font-black">{culpableVotes}</p>
                      </div>
                      <div className="h-10 w-px bg-zinc-800" />
                      <div className="text-center">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Inocente</p>
                        <p className="text-3xl font-black">{inocenteVotes}</p>
                      </div>
                    </div>

                    {!isExpired && report.status === 'OPEN' && (
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleVote(report.id, 'CULPABLE')}
                          className={`px-6 py-3 rounded-xl font-black uppercase text-xs transition-all ${
                            userVote === 'CULPABLE' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-red-500/20 hover:text-red-500'
                          }`}
                        >
                          Culpable
                        </button>
                        <button 
                          onClick={() => handleVote(report.id, 'INOCENTE')}
                          className={`px-6 py-3 rounded-xl font-black uppercase text-xs transition-all ${
                            userVote === 'INOCENTE' ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-green-500/20 hover:text-green-500'
                          }`}
                        >
                          Inocente
                        </button>
                      </div>
                    )}

                    {isExpired && (
                      <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        <Clock className="w-4 h-4" />
                        Votación Cerrada
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-8 py-4 bg-zinc-800/30 border-t border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Multa: {report.fine_amount} GC</span>
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Vence: {new Date(report.expires_at).toLocaleString()}</span>
                </div>
              </div>
            );
          })}

          {reports.length === 0 && (
            <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
              <CheckCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest">No hay reportes activos. Por ahora todos son santos.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
