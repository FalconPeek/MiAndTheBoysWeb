'use client';

import React, { useState, useRef } from 'react';

interface PlayerStats {
  Pace: number;
  Shot: number;
  Pass: number;
  Dribbling: number;
  Defense: number;
  Physical: number;
  GAY: number;
  PUTEADOR: number;
  TERMO: number;
}

interface PlayerCardProps {
  name: string;
  avatarUrl?: string;
  stats: PlayerStats;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ name, avatarUrl, stats }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Max rotation 15 degrees
    const rX = ((y - centerY) / centerY) * -15;
    const rY = ((x - centerX) / centerX) * 15;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div 
      className="perspective-1000 w-72 h-96 cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={cardRef}
        className="relative w-full h-full transition-transform duration-200 ease-out preserve-3d rounded-[2rem] shadow-2xl"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Card Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-[2rem] p-1 shadow-inner">
          <div className="absolute inset-0 bg-black/20 rounded-[2rem]" />
          <div className="relative h-full w-full bg-[#1a1a1a] rounded-[1.8rem] overflow-hidden flex flex-col border border-white/10">
            
            {/* Top Section: Photo and Rating */}
            <div className="flex-1 relative flex flex-col items-center pt-8">
              <div className="absolute top-6 left-6 flex flex-col items-center">
                <span className="text-4xl font-black text-yellow-500 leading-none">
                  {Math.round((stats.Pace + stats.Shot + stats.Pass + stats.Dribbling + stats.Defense + stats.Physical) / 6)}
                </span>
                <span className="text-xs font-bold text-white/60 uppercase">OVR</span>
              </div>
              
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500/30 shadow-2xl bg-zinc-800 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl font-black text-zinc-700">{name.charAt(0)}</div>
                )}
              </div>
              
              <h3 className="mt-4 text-xl font-black text-white uppercase tracking-tighter">
                {name}
              </h3>
            </div>

            {/* Stats Section */}
            <div className="p-6 bg-black/40 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <StatItem label="PAC" value={stats.Pace} />
                <StatItem label="DRI" value={stats.Dribbling} />
                <StatItem label="SHO" value={stats.Shot} />
                <StatItem label="DEF" value={stats.Defense} />
                <StatItem label="PAS" value={stats.Pass} />
                <StatItem label="PHY" value={stats.Physical} />
              </div>
              
              {/* Humor Stats */}
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between px-2">
                <HumorStat label="GAY" value={stats.GAY} color="text-pink-500" />
                <HumorStat label="PUT" value={stats.PUTEADOR} color="text-red-500" />
                <HumorStat label="TRM" value={stats.TERMO} color="text-blue-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Shine effect */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-[2rem] opacity-30 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
          style={{
            transform: `translateX(${rotateY * 2}px) translateY(${rotateX * 2}px)`,
          }}
        />
      </div>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-zinc-500">{label}</span>
    <span className="text-sm font-black text-white">{value}</span>
  </div>
);

const HumorStat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex flex-col items-center">
    <span className={`text-[0.6rem] font-black uppercase ${color}`}>{label}</span>
    <span className="text-sm font-black text-white">{value}</span>
  </div>
);
