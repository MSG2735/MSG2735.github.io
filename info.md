# Deluxe Blackjack - Technical Documentation

This document provides a comprehensive overview of the Deluxe Blackjack web application, detailing its architecture, game logic, state management, and data persistence mechanisms.

## Application Architecture

Deluxe Blackjack is built using a modern web technology stack:

- **Frontend Framework**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Animations**: Framer Motion for smooth transitions and effects
- **State Management**: React Context API for global state management
- **Data Persistence**: Browser's localStorage for saving game state and user preferences

## Page Structure

The application follows a standard Next.js page structure:

- **Home Page** (`/src/app/page.tsx`): Landing page with game features and navigation links
- **Login Page** (`/src/app/login/page.tsx`): User authentication screen
- **Game Page** (`/src/app/game/page.tsx`): Main blackjack gameplay interface
- **Profile Page** (`/src/app/profile/page.tsx`): User statistics and account management
- **Settings Page** (`/src/app/settings/page.tsx`): Game configuration options

The application uses Next.js App Router for navigation between these pages.

## Authentication Flow

The application implements a simple authentication system using localStorage:

1. Users enter a username on the login page
2. A random 4-digit player ID is generated
3. Both username and player ID are stored in localStorage
4. Protected routes check for the presence of these credentials
5. If credentials are missing, users are redirected to the login page

This approach provides a lightweight authentication mechanism without requiring a backend server.

## Game Logic Implementation

The core game logic is implemented in several key files:

### Game Types (`/src/types/game.ts`)

Defines TypeScript interfaces for game entities:
- `Card`: Represents a playing card with suit, rank, and face-up status
- `Hand`: Contains cards, bet amount, and various game states (busted, blackjack, etc.)
- `Player`: Manages multiple hands, balance, and player identification
- `GameState`: Tracks the overall game state including deck, dealer, player, and game phase
- `GameStats`: Records player statistics like wins, losses, and profit

### Game Utilities (`/src/lib/gameUtils.ts`)

Contains pure functions for game mechanics:
- `createDeck`: Generates and shuffles multiple decks of cards
- `dealCard`: Removes and returns a card from the deck
- `calculateHandValue`: Determines the numerical value of a hand, handling aces appropriately
- `isBlackjack`: Checks if a hand is a natural blackjack
- `isBusted`: Determines if a hand exceeds 21
- `determineWinner`: Compares player and dealer hands to determine the outcome

### Game Reducers (`/src/lib/gameReducers.ts`)

Implements state transitions for different game actions:
- `handleBetPhase`: Processes player bets
- `handleInitialDeal`: Deals the initial cards to player and dealer
- `handleHit`: Adds a card to the current hand
- `handleStand`: Ends the player's turn for the current hand
- `handleDoubleDown`: Doubles the bet and deals one final card
- `handleSplit`: Divides a pair into two separate hands
- `handleDealerPlay`: Automates the dealer's turn according to casino rules
- `handleEvaluateHands`: Determines winners and calculates payouts

## State Management

The application uses React's Context API for global state management, implemented in `/src/lib/GameContext.tsx`:

### Context Structure

- `GameContext`: Provides access to game state and actions
- `GameProvider`: Wraps the application and manages state updates

### State Categories

- `gameState`: Current game state including cards, bets, and game phase
- `gameStats`: Player statistics like wins, losses, and profit
- `matchHistory`: Record of previous game outcomes
- `purchaseHistory`: Record of balance additions
- `settings`: Game configuration options

### Reducers

Separate reducers handle different aspects of state:
- `gameReducer`: Manages the core game state
- `statsReducer`: Updates player statistics
- `matchHistoryReducer`: Records game outcomes
- `purchaseHistoryReducer`: Tracks balance additions
- `settingsReducer`: Handles game configuration changes

## UI Components

The UI is organized into reusable components:

### Layout Components
- `Header`: Navigation and app branding
- `Footer`: Copyright and additional links

### Game Components
- `GameBoard`: Main game interface container
- `Hand`: Displays cards for player or dealer
- `GameControls`: Action buttons (Hit, Stand, etc.)
- `GameStatus`: Shows current balance and game information
- `BettingControls`: Chip selection for placing bets

### UI Components
- Various buttons, modals, and utility components

## Local Storage Persistence

The application uses localStorage to persist data between sessions:

### Stored Data

- `blackjack-username`: Player's username
- `blackjack-player-id`: Unique player identifier
- `blackjack-game-state`: Complete game state
- `blackjack-balance`: Player's current balance
- `blackjack-stats`: Win/loss statistics
- `blackjack-history`: Record of previous games
- `blackjack-purchase-history`: Record of balance additions
- `blackjack-settings`: Game configuration options

### Persistence Logic

The `GameProvider` component:
1. Loads initial state from localStorage on mount
2. Updates localStorage when relevant state changes
3. Handles data serialization/deserialization
4. Provides fallback defaults when stored data is unavailable

## Sound Effects

The game includes sound effects for various actions:

- Card dealing and flipping
- Chip placement for betting
- Win, lose, and push outcomes
- Blackjack celebrations

Sound effects are managed by the `soundManager` in `/src/lib/soundEffects.ts`, which handles loading, playing, and volume control.

## Progressive Web App Features

The application includes PWA capabilities:

- Web manifest (`/public/manifest.json`) for installability
- Responsive design for all device sizes
- Offline functionality through localStorage persistence

## Game Rules and Settings

The game implements standard casino blackjack rules with configurable options:

- Multiple deck play (configurable deck count)
- Dealer stands on soft 17 (configurable)
- Blackjack pays 3:2 (configurable payout ratio)
- Options for surrender, insurance, and splitting
- Double down after split (configurable)
- Minimum and maximum bet limits

These settings can be adjusted in the Settings page and are stored in localStorage.

## Conclusion

Deluxe Blackjack demonstrates a modern approach to web game development, leveraging React and Next.js to create an engaging, responsive, and feature-rich casino game experience without requiring server-side components for core gameplay.