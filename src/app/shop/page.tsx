'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buyShopItem, requestRescue } from '@/lib/actions';
import { Wallet, ShoppingBag, HeartPulse, Sparkles, Shield, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const SHOP_ITEMS = [
  { id: 'badge', name: 'Custom Badge', price: 500, description: 'Un pin fachero para tu perfil.', icon: Sparkles, color: 'text-purple-400' },
  { id: 'immunity', name: 'Inmunidad a Prenda', price: 2000, description: 'Te salvás de pagar la próxima apuesta social.', icon: Shield, color: 'text-blue-400' },
  { id: 'multiplier', name: 'Multiplicador x2', price: 1500, description: 'Duplica tus ganancias en la próxima apuesta.', icon: HeartPulse, color: 'text-red-400' },
];

export default function ShopPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [rescuing, setRescuing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userName = localStorage.getItem('user');
    if (!userName) {
      router.push('/login');
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (item: typeof SHOP_ITEMS[0]) => {
    if (!user) return;
    if (user.balance < item.price) {
      alert('No tenés suficientes GuriCoins');
      return;
    }

    setBuying(item.id);
    try {
      await buyShopItem(user.id, item.name, item.price);
      alert(`¡Compraste ${item.name}!`);
      loadData(user.full_name);
    } catch (err: any) {
      alert(err.message || 'Error en la compra');
    } finally {
      setBuying(null);
    }
  };

  const handleRescue = async () => {
    if (!user) return;
    setRescuing(true);
    try {
      await requestRescue(user.id);
      alert('Recibiste 100 GC de auxilio. Ahora sos un deudor.');
      loadData(user.full_name);
    } catch (err: any) {
      alert(err.message || 'Error en el rescate');
    } finally {
      setRescuing(false);
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
              GURISHOP
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

        {user?.is_debtor && (
          <div className="mb-8 p-4 bg-red-950/30 border border-red-900/50 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold animate-pulse">
            <AlertCircle className="w-5 h-5" />
            ESTADO: DEUDOR - Tenés que recuperar tu honor.
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {SHOP_ITEMS.map((item) => (
            <div key={item.id} className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group">
              <div>
                <item.icon className={`w-10 h-10 ${item.color} mb-6 group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-black mb-2">{item.name}</h3>
                <p className="text-zinc-500 text-sm mb-6">{item.description}</p>
              </div>
              <div>
                <p className="text-2xl font-black mb-4">{item.price} <span className="text-yellow-500 text-sm">GC</span></p>
                <button
                  disabled={buying !== null || user?.balance < item.price}
                  onClick={() => handleBuy(item)}
                  className="w-full py-3 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 uppercase text-xs"
                >
                  {buying === item.id ? 'PROCESANDO...' : 'COMPRAR'}
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-gradient-to-br from-red-950/20 to-black p-10 rounded-[2.5rem] border border-red-900/30 text-center">
          <HeartPulse className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">¿ESTÁS EN LA LONA?</h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">
            Si tenés menos de 10 GC, podés pedir un rescate de emergencia. 
            Te damos 100 GC pero quedarás marcado como <span className="text-red-500 font-bold uppercase">Deudor</span>.
          </p>
          <button
            disabled={rescuing || user?.balance >= 10}
            onClick={handleRescue}
            className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {rescuing ? 'PIDIENDO RESCATE...' : 'PEDIR RESCATE'}
          </button>
        </section>
      </div>
    </main>
  );
}
