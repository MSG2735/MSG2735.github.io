// Database schema for Supabase integration

// This file defines the database schema for the Deluxe Blackjack application
// It will be used to create the necessary tables in Supabase

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          created_at: string;
          updated_at: string;
          balance: number;
        };
        Insert: {
          id?: string;
          username: string;
          created_at?: string;
          updated_at?: string;
          balance?: number;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string;
          updated_at?: string;
          balance?: number;
        };
      };
      game_stats: {
        Row: {
          id: string;
          user_id: string;
          wins: number;
          losses: number;
          pushes: number;
          blackjacks: number;
          win_rate: number;
          profit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wins?: number;
          losses?: number;
          pushes?: number;
          blackjacks?: number;
          win_rate?: number;
          profit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wins?: number;
          losses?: number;
          pushes?: number;
          blackjacks?: number;
          win_rate?: number;
          profit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      match_history: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          result: string;
          player_cards: string; // JSON string of cards
          dealer_cards: string; // JSON string of cards
          bet: number;
          payout: number;
          profit: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          result: string;
          player_cards: string;
          dealer_cards: string;
          bet: number;
          payout: number;
          profit: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          result?: string;
          player_cards?: string;
          dealer_cards?: string;
          bet?: number;
          payout?: number;
          profit?: number;
          created_at?: string;
        };
      };
      purchase_history: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          amount?: number;
          created_at?: string;
        };
      };
      game_settings: {
        Row: {
          id: string;
          user_id: string;
          deck_count: number;
          blackjack_payout: number;
          dealer_stands_on: number;
          auto_stand_on_21: boolean;
          keep_bet_between_rounds: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deck_count?: number;
          blackjack_payout?: number;
          dealer_stands_on?: number;
          auto_stand_on_21?: boolean;
          keep_bet_between_rounds?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          deck_count?: number;
          blackjack_payout?: number;
          dealer_stands_on?: number;
          auto_stand_on_21?: boolean;
          keep_bet_between_rounds?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_state: {
        Row: {
          id: string;
          user_id: string;
          state: string; // JSON string of game state
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          state: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          state?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}