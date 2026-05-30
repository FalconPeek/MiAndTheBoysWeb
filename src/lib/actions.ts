'use server';

import { supabase } from './supabase';

export type PlayerAttribute = 'Pace' | 'Shot' | 'Pass' | 'Dribbling' | 'Defense' | 'Physical' | 'GAY' | 'PUTEADOR' | 'TERMO';

export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function saveVotes(voterName: string, rankings: Record<PlayerAttribute, string[]>) {
  // 1. Get voter profile
  const { data: voter, error: voterError } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', voterName)
    .single();
  
  if (voterError || !voter) throw new Error('Voter not found');

  // 2. Prepare votes
  const voteEntries: any[] = [];
  for (const [attr, targetIds] of Object.entries(rankings)) {
    // targetIds is ordered from 1st (10 points) to 10th (1 point)
    targetIds.forEach((targetId, index) => {
      const score = 10 - index;
      voteEntries.push({
        voter_id: voter.id,
        target_id: targetId,
        attribute: attr as PlayerAttribute,
        score: score
      });
    });
  }

  // 3. Upsert votes
  const { error: upsertError } = await supabase
    .from('votes')
    .upsert(voteEntries, { onConflict: 'voter_id,target_id,attribute' });

  if (upsertError) throw upsertError;

  // 4. Recalculate stats
  await recalculateStats();
}

export async function recalculateStats() {
  // 1. Get all profiles
  const { data: profiles } = await supabase.from('profiles').select('id');
  if (!profiles) return;

  // 2. Get all votes
  const { data: allVotes } = await supabase.from('votes').select('*');
  if (!allVotes) return;

  // 3. Calculate averages and normalize
  const attributes: PlayerAttribute[] = ['Pace', 'Shot', 'Pass', 'Dribbling', 'Defense', 'Physical', 'GAY', 'PUTEADOR', 'TERMO'];
  
  // Group votes by target and attribute
  const scores: Record<string, Record<string, number[]>> = {};
  
  allVotes.forEach(vote => {
    if (!scores[vote.target_id]) scores[vote.target_id] = {};
    if (!scores[vote.target_id][vote.attribute]) scores[vote.target_id][vote.attribute] = [];
    scores[vote.target_id][vote.attribute].push(vote.score);
  });

  // Determine number of actual voters (V)
  // Actually, the normalization formula in the prompt uses "number_of_voters"
  // Let's assume it's the number of people who have cast at least one vote.
  const uniqueVoters = new Set(allVotes.map(v => v.voter_id));
  const V = uniqueVoters.size;

  if (V === 0) return;

  const statsToUpsert: any[] = [];

  for (const profile of profiles) {
    for (const attr of attributes) {
      const targetScores = scores[profile.id]?.[attr] || [];
      const totalScore = targetScores.reduce((a, b) => a + b, 0);
      
      // If someone hasn't received any votes yet, we can't really normalize or we give them 50.
      // But the formula says Min = 1 * V.
      // If they got 0 votes, they are below min? No, they probably should just be 50.
      
      const Min = 1 * V;
      const Max = 10 * V;
      
      let normalizedValue = 50;
      if (totalScore > 0) {
          // Map totalScore from [Min, Max] to [50, 99]
          // normalized = 50 + (score - Min) / (Max - Min) * (99 - 50)
          normalizedValue = 50 + ((totalScore - Min) / (Max - Min)) * (99 - 50);
          normalizedValue = Math.max(50, Math.min(99, Math.round(normalizedValue)));
      }

      statsToUpsert.push({
        user_id: profile.id,
        attribute: attr,
        value: normalizedValue
      });
    }
  }

  const { error: statsError } = await supabase
    .from('calculated_stats')
    .upsert(statsToUpsert, { onConflict: 'user_id,attribute' });

  if (statsError) throw statsError;
}

export async function getPlayerStats(profileId: string) {
    const { data, error } = await supabase
        .from('calculated_stats')
        .select('attribute, value')
        .eq('user_id', profileId);
    
    if (error) throw error;
    
    // Convert to PlayerStats object
    const stats: any = {
        Pace: 50, Shot: 50, Pass: 50, Dribbling: 50, Defense: 50, Physical: 50,
        GAY: 50, PUTEADOR: 50, TERMO: 50
    };
    
    data.forEach(s => {
        stats[s.attribute] = s.value;
    });
    
    return stats;
}

export async function getAllPlayersWithStats() {
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });
    
    if (pError) throw pError;

    const { data: stats, error: sError } = await supabase
        .from('calculated_stats')
        .select('*');
    
    if (sError) throw sError;

    return profiles.map(profile => {
        const playerStats: any = {
            Pace: 50, Shot: 50, Pass: 50, Dribbling: 50, Defense: 50, Physical: 50,
            GAY: 50, PUTEADOR: 50, TERMO: 50
        };
        
        stats
            .filter(s => s.user_id === profile.id)
            .forEach(s => {
                playerStats[s.attribute] = s.value;
            });
        
        return {
            ...profile,
            stats: playerStats
        };
    });
}

// Pick'Em Actions

export async function savePrediction(userId: string, matchId: string, homeScore: number, awayScore: number) {
  const { error } = await supabase
    .from('predictions')
    .upsert({
      user_id: userId,
      match_id: matchId,
      predicted_home: homeScore,
      predicted_away: awayScore,
    }, { onConflict: 'user_id,match_id' });

  if (error) throw error;
}

export async function getUserPredictions(userId: string) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function saveChampionPrediction(userId: string, teamName: string) {
  const { error } = await supabase
    .from('user_tournament_stats')
    .upsert({
      user_id: userId,
      champion_prediction: teamName,
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('user_tournament_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'no rows returned'
  return data;
}

// Economy & Betting Actions

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function creditGC(userId: string, amount: number, type: string, description: string) {
  // 1. Get current balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();
  
  if (profileError) throw profileError;

  const newBalance = (profile.balance || 0) + amount;

  // 2. Update balance
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ balance: newBalance })
    .eq('id', userId);
  
  if (updateError) throw updateError;

  // 3. Record transaction
  const { error: transError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: amount,
      type: type,
      description: description
    });
  
  if (transError) throw transError;
}

export async function debitGC(userId: string, amount: number, type: string, description: string) {
  // 1. Get current balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();
  
  if (profileError) throw profileError;
  if ((profile.balance || 0) < amount) throw new Error('Insufficient GuriCoins');

  const newBalance = profile.balance - amount;

  // 2. Update balance
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ balance: newBalance })
    .eq('id', userId);
  
  if (updateError) throw updateError;

  // 3. Record transaction
  const { error: transError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: -amount,
      type: type,
      description: description
    });
  
  if (transError) throw transError;
}

export async function createBettingEvent(title: string, description: string, type: 'SPORTS' | 'SOCIAL', options: Record<string, string>) {
  const { data, error } = await supabase
    .from('betting_events')
    .insert({
      title,
      description,
      type,
      options,
      status: 'OPEN',
      total_pool: 0
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getActiveBettingEvents() {
  const { data, error } = await supabase
    .from('betting_events')
    .select('*')
    .neq('status', 'SETTLED')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function placeBet(userId: string, eventId: string, outcome: string, amount: number) {
  // 1. Check if event is open
  const { data: event, error: eventError } = await supabase
    .from('betting_events')
    .select('*')
    .eq('id', eventId)
    .single();
  
  if (eventError) throw eventError;
  if (event.status !== 'OPEN') throw new Error('Betting is closed for this event');

  // 2. Check if user already bet
  const { data: existingBet } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();
  
  if (existingBet) throw new Error('You have already placed a bet on this event');

  // 3. Debit GC
  await debitGC(userId, amount, 'BET_PLACE', `Bet on ${event.title}: ${outcome}`);

  // 4. Record bet
  const { error: betError } = await supabase
    .from('bets')
    .insert({
      user_id: userId,
      event_id: eventId,
      outcome: outcome,
      amount: amount
    });
  
  if (betError) throw betError;

  // 5. Update total pool
  const { error: poolError } = await supabase
    .from('betting_events')
    .update({ total_pool: (event.total_pool || 0) + amount })
    .eq('id', eventId);
  
  if (poolError) throw poolError;
}

export async function settleEvent(eventId: string, winningOutcome: string) {
  // 1. Get event and bets
  const { data: event, error: eventError } = await supabase
    .from('betting_events')
    .select('*')
    .eq('id', eventId)
    .single();
  
  if (eventError) throw eventError;
  if (event.status === 'SETTLED') throw new Error('Event already settled');

  const { data: bets, error: betsError } = await supabase
    .from('bets')
    .select('*')
    .eq('event_id', eventId);
  
  if (betsError) throw betsError;

  const totalPool = event.total_pool || 0;
  const winningBets = bets.filter(b => b.outcome === winningOutcome);
  const totalWinningAmount = winningBets.reduce((sum, b) => sum + b.amount, 0);

  // 2. Distribute winnings
  if (totalWinningAmount > 0) {
    for (const bet of winningBets) {
      const share = bet.amount / totalWinningAmount;
      const payout = Math.floor(totalPool * share);
      await creditGC(bet.user_id, payout, 'BET_WIN', `Won bet on ${event.title}`);
    }
  }

  // 3. Mark as settled
  const { error: updateError } = await supabase
    .from('betting_events')
    .update({
      status: 'SETTLED',
      winning_outcome: winningOutcome
    })
    .eq('id', eventId);
  
  if (updateError) throw updateError;
}

export async function buyShopItem(userId: string, itemName: string, price: number) {
  await debitGC(userId, price, 'SHOP_BUY', `Bought ${itemName}`);
}

export async function requestRescue(userId: string) {
  // 1. Check balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();
  
  if (profileError) throw profileError;
  if (profile.balance >= 10) throw new Error('You still have enough GuriCoins');

  // 2. Give 100 GC and set debtor status
  await creditGC(userId, 100, 'LOAN', 'Rescate de emergencia');
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_debtor: true })
    .eq('id', userId);
  
  if (updateError) throw updateError;
}

export async function getHallOfFameData() {
  const [
    { data: pickem },
    { data: profiles },
    { data: stats },
    { data: casino },
    { data: tribunal }
  ] = await Promise.all([
    supabase.from('user_tournament_stats').select('user_id, total_points, profiles(full_name)').order('total_points', { ascending: false }),
    supabase.from('profiles').select('id, full_name, avatar_url'),
    supabase.from('calculated_stats').select('*'),
    supabase.from('transactions').select('user_id, amount').eq('type', 'BET_WIN'),
    supabase.from('tribunal_reports').select('target_id, fine_amount').eq('status', 'CULPABLE')
  ]);

  // 1. Pick'Em
  const pickemLeaderboard = pickem?.map(p => ({
    name: (p.profiles as any)?.full_name,
    score: p.total_points
  })) || [];

  // 2. FIFA (Highest Overall)
  const playersWithStats = profiles?.map(profile => {
    const pStats = stats?.filter(s => s.user_id === profile.id) || [];
    const avg = pStats.length > 0 
      ? Math.round(pStats.reduce((sum, s) => sum + s.value, 0) / pStats.length)
      : 50;
    return { name: profile.full_name, score: avg };
  }).sort((a, b) => b.score - a.score) || [];

  // 3. Casino (Highest net gain)
  const casinoGains: Record<string, number> = {};
  casino?.forEach(t => {
    casinoGains[t.user_id] = (casinoGains[t.user_id] || 0) + t.amount;
  });
  const casinoLeaderboard = profiles?.map(p => ({
    name: p.full_name,
    score: casinoGains[p.id] || 0
  })).sort((a, b) => b.score - a.score) || [];

  // 4. Most Wanted (Most fines)
  const finesCount: Record<string, number> = {};
  tribunal?.forEach(r => {
    finesCount[r.target_id] = (finesCount[r.target_id] || 0) + 1;
  });
  const mostWantedLeaderboard = profiles?.map(p => ({
    name: p.full_name,
    score: finesCount[p.id] || 0
  })).sort((a, b) => b.score - a.score) || [];

  return {
    pickem: pickemLeaderboard,
    fifa: playersWithStats,
    casino: casinoLeaderboard,
    wanted: mostWantedLeaderboard
  };
}
