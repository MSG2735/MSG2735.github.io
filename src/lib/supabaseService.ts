// Supabase service for data operations
import { supabase } from './supabase';
import { GameState, GameStats, GameSettings, MatchHistoryEntry, PurchaseHistoryEntry } from '@/types/game';
import { defaultSettings } from './gameUtils';
import { Database } from './supabaseSchema';

// Authentication services
export const authService = {
  // Sign up a new user
  async signUp(email: string, password: string, username: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // If sign up successful, create a user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            username,
            balance: 1000, // Default starting balance
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        // Create default game stats for the user
        await gameStatsService.createInitialStats(authData.user.id);
        
        // Create default game settings for the user
        await gameSettingsService.createInitialSettings(authData.user.id);
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { user: null, error };
    }
  },

  // Sign in an existing user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { user: null, error };
    }
  },

  // Sign out the current user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  },

  // Get the current user
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null, error };
    }
  },
};

// User profile services
export const userService = {
  // Get user profile by ID
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { profile: data, error: null };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { profile: null, error };
    }
  },

  // Update user balance
  async updateBalance(userId: string, balance: number) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ balance, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { profile: data, error: null };
    } catch (error) {
      console.error('Error updating balance:', error);
      return { profile: null, error };
    }
  },

  // Add funds to user balance
  async addFunds(userId: string, amount: number) {
    try {
      // Get current balance
      const { profile, error: getError } = await this.getUserProfile(userId);
      if (getError) throw getError;
      if (!profile) throw new Error('User profile not found');

      const newBalance = profile.balance + amount;

      // Update balance
      const { profile: updatedProfile, error: updateError } = await this.updateBalance(userId, newBalance);
      if (updateError) throw updateError;

      // Record purchase history
      await purchaseHistoryService.addPurchase(userId, amount);

      return { profile: updatedProfile, error: null };
    } catch (error) {
      console.error('Error adding funds:', error);
      return { profile: null, error };
    }
  },
};

// Game state services
export const gameStateService = {
  // Save game state
  async saveGameState(userId: string, gameState: GameState) {
    try {
      // Check if game state exists for this user
      const { data: existingState, error: checkError } = await supabase
        .from('game_state')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      // Convert gameState to string for storage
      const stateString = JSON.stringify(gameState);

      let result;
      if (existingState) {
        // Update existing state
        result = await supabase
          .from('game_state')
          .update({ 
            state: stateString,
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Create new state
        result = await supabase
          .from('game_state')
          .insert({ 
            user_id: userId, 
            state: stateString,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error saving game state:', error);
      return { data: null, error };
    }
  },

  // Load game state
  async loadGameState(userId: string) {
    try {
      const { data, error } = await supabase
        .from('game_state')
        .select('state')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Parse the state string back to an object
        const gameState = JSON.parse(data.state) as GameState;
        return { gameState, error: null };
      }

      return { gameState: null, error: null };
    } catch (error) {
      console.error('Error loading game state:', error);
      return { gameState: null, error };
    }
  },
};

// Game stats services
export const gameStatsService = {
  // Create initial stats for a new user
  async createInitialStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .insert({
          user_id: userId,
          wins: 0,
          losses: 0,
          pushes: 0,
          blackjacks: 0,
          win_rate: 0,
          profit: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { stats: data, error: null };
    } catch (error) {
      console.error('Error creating initial stats:', error);
      return { stats: null, error };
    }
  },

  // Get game stats for a user
  async getGameStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const gameStats: GameStats = {
        wins: data.wins,
        losses: data.losses,
        pushes: data.pushes,
        blackjacks: data.blackjacks,
        winRate: data.win_rate,
        profit: data.profit,
      };

      return { gameStats, error: null };
    } catch (error) {
      console.error('Error getting game stats:', error);
      return { gameStats: null, error };
    }
  },

  // Update game stats
  async updateGameStats(userId: string, gameStats: GameStats) {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .update({
          wins: gameStats.wins,
          losses: gameStats.losses,
          pushes: gameStats.pushes,
          blackjacks: gameStats.blackjacks,
          win_rate: gameStats.winRate,
          profit: gameStats.profit,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { stats: data, error: null };
    } catch (error) {
      console.error('Error updating game stats:', error);
      return { stats: null, error };
    }
  },

  // Reset game stats
  async resetGameStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .update({
          wins: 0,
          losses: 0,
          pushes: 0,
          blackjacks: 0,
          win_rate: 0,
          profit: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { stats: data, error: null };
    } catch (error) {
      console.error('Error resetting game stats:', error);
      return { stats: null, error };
    }
  },
};

// Match history services
export const matchHistoryService = {
  // Add match to history
  async addMatch(userId: string, match: MatchHistoryEntry) {
    try {
      const { data, error } = await supabase
        .from('match_history')
        .insert({
          user_id: userId,
          date: match.date.toISOString(),
          result: match.result,
          player_cards: JSON.stringify(match.playerCards),
          dealer_cards: JSON.stringify(match.dealerCards),
          bet: match.bet,
          payout: match.payout,
          profit: match.profit,
        })
        .select()
        .single();

      if (error) throw error;

      return { match: data, error: null };
    } catch (error) {
      console.error('Error adding match to history:', error);
      return { match: null, error };
    }
  },

  // Get match history for a user
  async getMatchHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('match_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      // Convert database records to MatchHistoryEntry objects
      const matchHistory: MatchHistoryEntry[] = data.map(record => ({
        id: record.id,
        date: new Date(record.date),
        result: record.result,
        playerCards: JSON.parse(record.player_cards),
        dealerCards: JSON.parse(record.dealer_cards),
        bet: record.bet,
        payout: record.payout,
        profit: record.profit,
      }));

      return { matchHistory, error: null };
    } catch (error) {
      console.error('Error getting match history:', error);
      return { matchHistory: [], error };
    }
  },

  // Clear match history for a user
  async clearMatchHistory(userId: string) {
    try {
      const { error } = await supabase
        .from('match_history')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error clearing match history:', error);
      return { error };
    }
  },
};

// Purchase history services
export const purchaseHistoryService = {
  // Add purchase to history
  async addPurchase(userId: string, amount: number) {
    try {
      const { data, error } = await supabase
        .from('purchase_history')
        .insert({
          user_id: userId,
          date: new Date().toISOString(),
          amount,
        })
        .select()
        .single();

      if (error) throw error;

      return { purchase: data, error: null };
    } catch (error) {
      console.error('Error adding purchase to history:', error);
      return { purchase: null, error };
    }
  },

  // Get purchase history for a user
  async getPurchaseHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('purchase_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      // Convert database records to PurchaseHistoryEntry objects
      const purchaseHistory: PurchaseHistoryEntry[] = data.map(record => ({
        id: record.id,
        date: new Date(record.date),
        amount: record.amount,
      }));

      return { purchaseHistory, error: null };
    } catch (error) {
      console.error('Error getting purchase history:', error);
      return { purchaseHistory: [], error };
    }
  },

  // Clear purchase history for a user
  async clearPurchaseHistory(userId: string) {
    try {
      const { error } = await supabase
        .from('purchase_history')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error clearing purchase history:', error);
      return { error };
    }
  },
};

// Game settings services
export const gameSettingsService = {
  // Create initial settings for a new user
  async createInitialSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .insert({
          user_id: userId,
          deck_count: defaultSettings.deckCount,
          blackjack_payout: defaultSettings.blackjackPayout,
          dealer_stands_on: defaultSettings.dealerStandsOnSoft17,
          auto_stand_on_21: defaultSettings.autoStandOn21,
          keep_bet_between_rounds: defaultSettings.keepBetBetweenRounds,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { settings: data, error: null };
    } catch (error) {
      console.error('Error creating initial settings:', error);
      return { settings: null, error };
    }
  },

  // Get game settings for a user
  async getGameSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Convert database record to GameSettings object
      const gameSettings: GameSettings = {
        deckCount: data.deck_count,
        blackjackPayout: data.blackjack_payout,
        dealerStandsOnSoft17: data.dealer_stands_on,
        allowSurrender: data.allow_surrender,
        allowDoubleAfterSplit: data.allow_double_after_split,
        minimumBet: data.minimum_bet,
        maximumBet: data.maximum_bet,
        volume: data.volume,
        autoStandOn21: data.auto_stand_on_21,
        keepBetBetweenRounds: data.keep_bet_between_rounds,
      };

      return { gameSettings, error: null };
    } catch (error) {
      console.error('Error getting game settings:', error);
      return { gameSettings: null, error };
    }
  },

  // Update game settings
  async updateGameSettings(userId: string, gameSettings: GameSettings) {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .update({
          deck_count: gameSettings.deckCount,
          blackjack_payout: gameSettings.blackjackPayout,
          dealer_stands_on: gameSettings.dealerStandsOnSoft17,
          allow_surrender: gameSettings.allowSurrender,
          allow_double_after_split: gameSettings.allowDoubleAfterSplit,
          minimum_bet: gameSettings.minimumBet,
          maximum_bet: gameSettings.maximumBet,
          volume: gameSettings.volume,
          auto_stand_on_21: gameSettings.autoStandOn21,
          keep_bet_between_rounds: gameSettings.keepBetBetweenRounds,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { settings: data, error: null };
    } catch (error) {
      console.error('Error updating game settings:', error);
      return { settings: null, error };
    }
  },
};