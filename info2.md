# Blackjack Game Technical Documentation

This document provides an in-depth analysis of the game mechanics, state management, and component structure of the Blackjack game.

## Table of Contents
1. [Game State Logic](#game-state-logic)
2. [Stat Tracking](#stat-tracking)
3. [Game Loop](#game-loop)
4. [Settings](#settings)
5. [Variables and Types](#variables-and-types)

## Game State Logic

### Core State Structure
The game's state is managed through a React Context system (`GameContext.tsx`) which provides global access to game state, statistics, match history, purchase history, and settings.

#### GameState Interface
The `GameState` interface defines the core game state with the following properties:
- `deck`: Array of `Card` objects representing the current deck
- `dealer`: `Hand` object representing the dealer's cards and state
- `player`: `Player` object with hands, balance, name, and ID
- `currentHandIndex`: Index of the player's current active hand (used for split hands)
- `gamePhase`: Current phase of the game ('betting', 'playerTurn', 'dealerTurn', 'evaluating', 'gameOver')
- `message`: Text message to display to the player
- `gameResult`: Outcome of the game ('win', 'lose', 'push', 'blackjack', or null)
- `handResults`: Array of results for each hand when evaluating multiple hands
- `lastBetAmount`: The previous bet amount (used for consecutive games)

### State Management
The game uses the React `useReducer` hook with several reducer functions to manage different aspects of the state:

1. **gameReducer**: Handles game state transitions
2. **statsReducer**: Updates game statistics
3. **matchHistoryReducer**: Manages match history entries
4. **purchaseHistoryReducer**: Manages purchase history entries
5. **settingsReducer**: Updates game settings

### State Transitions
The game state transitions through the following reducers:

#### Betting Phase (`handleBetPhase`)
- Validates bet amount
- Updates player balance
- Creates initial hand structure
- Transitions to player turn

#### Initial Deal (`handleInitialDeal`)
- Creates a new shuffled deck
- Deals two cards to player and dealer
- Checks for blackjacks
- Determines immediate game outcomes (blackjack)
- Updates player balance based on initial outcomes

#### Player Actions
1. **Hit (`handleHit`)**
   - Deals additional card to current hand
   - Checks if hand is busted
   - Transitions to next hand or dealer turn if all hands complete

2. **Stand (`handleStand`)**
   - Marks current hand as standing
   - Transitions to next hand or dealer turn if all hands complete

3. **Double Down (`handleDoubleDown`)**
   - Doubles the bet on current hand
   - Deals one additional card
   - Marks hand as standing
   - Transitions to next hand or dealer turn

4. **Split (`handleSplit`)**
   - Separates a pair into two hands
   - Deals additional cards to both hands
   - Updates player balance
   - Transitions to playing first hand

#### Dealer Play (`handleDealerPlay`)
- Reveals dealer's hole card
- Deals cards to dealer according to standard rules
- Dealer hits until reaching 17 or higher
- Accounts for "soft 17" based on settings

#### Hand Evaluation (`handleEvaluateHands`)
- Evaluates each player hand against dealer hand
- Calculates payouts based on hand results
- Updates player balance
- Updates match history

#### New Game (`handleNewGame`)
- Resets game to betting phase
- Carries over balance and stats
- Optionally keeps previous bet amount

## Stat Tracking

### GameStats Interface
The `GameStats` interface tracks player performance with the following properties:
- `wins`: Number of winning hands
- `losses`: Number of losing hands
- `pushes`: Number of pushes (ties)
- `blackjacks`: Number of blackjacks achieved
- `winRate`: Percentage of hands won
- `profit`: Total accumulated profit

### Match History
The game maintains a match history of previous games, stored as `MatchHistoryEntry` objects:
- `id`: Unique identifier
- `date`: Date when the match occurred
- `result`: Outcome ('win', 'lose', 'push', 'blackjack')
- `playerCards`: Cards in player's hand
- `dealerCards`: Cards in dealer's hand
- `bet`: Amount wagered
- `payout`: Amount received
- `profit`: Net profit from the hand

### Purchase History
The game tracks purchase history for adding funds, stored as `PurchaseHistoryEntry` objects:
- `id`: Unique identifier
- `date`: Date of purchase
- `amount`: Amount added to balance

## Game Loop

The game follows a typical blackjack game loop:

1. **Betting Phase**
   - Player places a bet
   - Game verifies bet is valid

2. **Initial Deal**
   - Two cards dealt to player (face up)
   - Two cards dealt to dealer (one face up, one face down)
   - Check for natural blackjacks

3. **Player's Turn**
   - Player chooses actions (hit, stand, double down, split)
   - If player busts, turn ends
   - If player reaches 21, turn may auto-end (based on settings)
   - If player has multiple hands (after split), plays each in sequence

4. **Dealer's Turn**
   - Dealer reveals hole card
   - Dealer follows fixed strategy (hit until 17+)
   - Strategy may vary for soft 17 (Ace + 6) based on settings

5. **Hand Evaluation**
   - Compare player and dealer hands
   - Calculate payouts based on game rules
   - Update stats and history

6. **Game Reset**
   - Return to betting phase
   - Apply stat updates

## Settings

### GameSettings Interface
The `GameSettings` interface controls game rules and behavior:
- `deckCount`: Number of decks used (default: 6)
- `blackjackPayout`: Payout ratio for blackjack (default: 1.5)
- `dealerStandsOnSoft17`: Whether dealer stands on soft 17 (default: true)
- `allowSurrender`: Whether surrender is allowed (default: true)
- `allowDoubleAfterSplit`: Whether doubling down is allowed after splitting (default: true)
- `minimumBet`: Minimum allowed bet amount (default: 5)
- `maximumBet`: Maximum allowed bet amount (default: 1000)
- `volume`: Game sound volume (default: 0.5)
- `autoStandOn21`: Whether to automatically stand when reaching 21 (default: true)
- `keepBetBetweenRounds`: Whether to maintain the same bet between rounds (default: true)

## Variables and Types

### Card Types
- `Suit`: 'hearts' | 'diamonds' | 'clubs' | 'spades'
- `Rank`: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
- `Card`: Interface with `suit`, `rank`, and `faceUp` properties

### Hand Structure
The `Hand` interface defines a single hand of cards:
- `cards`: Array of Card objects
- `bet`: Amount bet on this hand
- `doubleDown`: Whether the hand was doubled down
- `insurance`: Whether insurance was taken
- `insuranceBet`: Amount bet on insurance
- `isStanding`: Whether the player has stood on this hand
- `isBusted`: Whether the hand exceeds 21
- `isBlackjack`: Whether the hand is a natural blackjack
- `isSplit`: Whether the hand resulted from a split

### Player Structure
The `Player` interface defines the player:
- `hands`: Array of Hand objects (multiple hands possible after splitting)
- `balance`: Current player balance
- `name`: Player name
- `id`: Unique player identifier

### Game Utility Functions

#### Card Operations
- `createDeck`: Creates a shuffled deck of cards
- `dealCard`: Removes and returns a card from the deck
- `calculateHandValue`: Calculates the numerical value of a hand
- `isBlackjack`: Checks if a hand is a blackjack
- `isBusted`: Checks if a hand exceeds 21
- `canSplit`: Checks if a hand can be split
- `canDoubleDown`: Checks if a hand can be doubled down
- `determineWinner`: Compares hands and determines the winner and payout

#### Helper Functions
- `getOrdinalSuffix`: Returns the ordinal suffix for a number (1st, 2nd, 3rd, etc.)
- `areAllHandsComplete`: Checks if all player hands are completed
- `getSettingsFromStorage`: Retrieves settings from localStorage
- `calculatePayout`: Calculates payout based on hand result
- `calculateProfit`: Calculates profit based on hand result

### Sound Effects
The game incorporates sound effects for various game actions:
- Card slides
- Card reveals
- Bet placements
- Win/lose notifications

Sound volume can be adjusted through the settings interface, and sound effects are managed by the `soundManager` from `soundEffects.ts`.

### Local Storage
The game persists data across sessions using localStorage for:
- Game statistics
- Match history
- Purchase history
- Game settings

This allows players to continue their progress when returning to the game.
