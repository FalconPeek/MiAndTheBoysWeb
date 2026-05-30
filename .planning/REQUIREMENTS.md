# Requirements: PickEmMundialLosguRise

## Core Modules

### 1. /FIFA (Player Cards)
- **Voting System:** Users evaluate all *other* 10 members across specific attributes.
- **Point Logic:** Ranking 1-10. Rank 1 = 10 pts, Rank 10 = 1 pt.
- **Normalization:** Total scores normalized to a 50-99 scale.
- **Attributes:**
    - Performance: Pace, Shot, Pass, Dribbling, Defense, Physical.
    - Humor/Group: GAY, PUTEADOR, TERMO, etc.
- **Visuals:** 3D animated cards that reflect these stats.

### 2. /PICKEM (World Cup 2026)
- **Predictions:** Group stage results and full playoff bracket.
- **Tiers:** Bronce (Base), Plata (5 groups), Oro (playoffs), Diamante (Champion + high win-rate).
- **Automation:** Automated match results via World Cup API (Football-Data.org).

### 3. /GURIBETS (Internal Betting)
- **System:** Parimutuel / shared pool (dynamic odds based on volume).
- **Markets:** WC matches and real-life group events (e.g., "Will X arrive late?").
- **Admin Panel:** Fast creation and liquidation of events.

### 4. ECONOMY (GuriCoins - GC)
- **Generation:** Bonus for FIFA voting, winning bets, Pick'Em rewards, Player of the Week.
- **Shop:** Cosmetics, real-life immunity, real-life "consequences" (prendas).
- **Loans:** Bankruptcy protection with interest or real-life penalties.

## System Requirements
- **Stack:** Next.js (TypeScript) + Supabase (Auth/DB).
- **Auth:** Simplified login (Select name from list + password).
- **Hosting:** Vercel.
