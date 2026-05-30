'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Newspaper, Bell } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: 'API' | 'MANUAL';
  created_at: string;
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setNews(data);
      }
      setLoading(false);
    }

    fetchNews();
  }, []);

  if (loading) return <div className="animate-pulse bg-zinc-900 h-48 rounded-3xl border border-zinc-800" />;

  return (
    <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden">
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-orange-500" />
          <h2 className="font-black italic uppercase tracking-tighter">Últimas Noticias</h2>
        </div>
        <Bell className="w-4 h-4 text-zinc-500 animate-bounce" />
      </div>
      <div className="divide-y divide-zinc-800">
        {news.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            No hay novedades por el momento.
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="p-6 hover:bg-zinc-800/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white group-hover:text-orange-500 transition-colors">
                  {item.title}
                </h3>
                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                  item.type === 'API' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                }`}>
                  {item.type}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-3 line-clamp-2 leading-relaxed">
                {item.content}
              </p>
              <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
