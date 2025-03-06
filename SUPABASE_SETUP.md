# Supabase Integration for Deluxe Blackjack

This document provides instructions for setting up and using Supabase with the Deluxe Blackjack application.

## Overview

Deluxe Blackjack is transitioning from using localStorage for data persistence to using Supabase, a powerful open-source Firebase alternative. This migration will provide:

- Secure user authentication
- Server-side data storage
- Real-time data synchronization
- Improved data integrity and reliability

## Setup Instructions

### 1. Create a Supabase Account and Project

1. Go to [supabase.com](https://supabase.com/) and sign up for an account
2. Create a new project and note your project URL and anon key
3. Set up your project with a name and password

### 2. Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`
2. Replace the placeholder values with your actual Supabase project credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Set Up Database Tables

Execute the following SQL in your Supabase SQL editor to create the necessary tables:

```sql
-- Users table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game stats table
CREATE TABLE public.game_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  pushes INTEGER NOT NULL DEFAULT 0,
  blackjacks INTEGER NOT NULL DEFAULT 0,
  win_rate FLOAT NOT NULL DEFAULT 0,
  profit INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match history table
CREATE TABLE public.match_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  result TEXT NOT NULL,
  player_cards TEXT NOT NULL, -- JSON string of cards
  dealer_cards TEXT NOT NULL, -- JSON string of cards
  bet INTEGER NOT NULL,
  payout INTEGER NOT NULL,
  profit INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase history table
CREATE TABLE public.purchase_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game settings table
CREATE TABLE public.game_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  deck_count INTEGER NOT NULL DEFAULT 6,
  blackjack_payout FLOAT NOT NULL DEFAULT 1.5,
  dealer_stands_on_soft17 BOOLEAN NOT NULL DEFAULT true,
  auto_stand_on_21 BOOLEAN NOT NULL DEFAULT true,
  keep_bet_between_rounds BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game state table
CREATE TABLE public.game_state (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  state TEXT NOT NULL, -- JSON string of game state
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Set Up Row Level Security (RLS)

To secure your data, enable Row Level Security on all tables and add policies:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;

-- Add policies for users table
CREATE POLICY "Users can view their own data" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Add similar policies for other tables
-- Example for game_stats:
CREATE POLICY "Users can view their own stats" 
  ON public.game_stats FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
  ON public.game_stats FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
  ON public.game_stats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

Add similar policies for the remaining tables.

## Using the Supabase Integration

### Authentication

The application now uses Supabase Auth for user authentication. The `authService` provides methods for:

- `signUp`: Register a new user
- `signIn`: Log in an existing user
- `signOut`: Log out the current user
- `getCurrentUser`: Get the currently authenticated user

### Data Services

The following services are available for data operations:

- `userService`: Manage user profiles and balances
- `gameStateService`: Save and load game state
- `gameStatsService`: Track and update game statistics
- `matchHistoryService`: Record and retrieve match history
- `purchaseHistoryService`: Track balance additions
- `gameSettingsService`: Manage game settings

## Migration from localStorage

To migrate existing users from localStorage to Supabase:

1. When a user signs up or logs in, check if they have existing localStorage data
2. If localStorage data exists, migrate it to Supabase using the appropriate service methods
3. Clear the localStorage data after successful migration

Example migration code:

```typescript
async function migrateLocalStorageToSupabase(userId: string) {
  // Migrate game state
  const localGameState = localStorage.getItem('blackjack-game-state');
  if (localGameState) {
    const gameState = JSON.parse(localGameState) as GameState;
    await gameStateService.saveGameState(userId, gameState);
  }

  // Migrate stats
  const localStats = localStorage.getItem('blackjack-stats');
  if (localStats) {
    const gameStats = JSON.parse(localStats) as GameStats;
    await gameStatsService.updateGameStats(userId, gameStats);
  }

  // Migrate settings
  const localSettings = localStorage.getItem('blackjack-settings');
  if (localSettings) {
    const gameSettings = JSON.parse(localSettings) as GameSettings;
    await gameSettingsService.updateGameSettings(userId, gameSettings);
  }

  // Clear localStorage after migration
  localStorage.removeItem('blackjack-game-state');
  localStorage.removeItem('blackjack-stats');
  localStorage.removeItem('blackjack-settings');
  localStorage.removeItem('blackjack-history');
  localStorage.removeItem('blackjack-purchase-history');
}
```

## Next Steps

1. Update the `GameContext.tsx` file to use Supabase services instead of localStorage
2. Create authentication pages (sign up, login, password reset)
3. Add protected routes that require authentication
4. Implement real-time updates using Supabase subscriptions
5. Add error handling and loading states for API operations

## Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Next.js with Supabase Auth](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)