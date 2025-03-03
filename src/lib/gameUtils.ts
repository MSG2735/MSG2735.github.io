import { Card, Rank, Suit, Hand, GameSettings } from '@/types/game';

// Default game settings
export const defaultSettings: GameSettings = {
  deckCount: 6,
  blackjackPayout: 1.5,
  dealerStandsOnSoft17: true,
  allowSurrender: true,
  allowDoubleAfterSplit: true,
  minimumBet: 5,
  maximumBet: 1000
};

// Create a shuffled deck of cards
export const createDeck = (deckCount: number = 6): Card[] => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let deck: Card[] = [];

  // Create multiple decks
  for (let d = 0; d < deckCount; d++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank, faceUp: true });
      }
    }
  }

  // Shuffle deck using Fisher-Yates algorithm
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

// Deal a card from the deck
export const dealCard = (deck: Card[], faceUp: boolean = true): [Card, Card[]] => {
  if (deck.length === 0) {
    throw new Error('Deck is empty');
  }
  
  const newDeck = [...deck];
  const card = { ...newDeck.pop()!, faceUp };
  
  return [card, newDeck];
};

// Calculate the value of a hand
export const calculateHandValue = (hand: Hand): { total: number; isSoft: boolean } => {
  let total = 0;
  let aceCount = 0;
  let isSoft = false;

  // Count non-ace cards
  hand.cards.forEach(card => {
    if (!card.faceUp) return;

    if (card.rank === 'A') {
      aceCount += 1;
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      total += 10;
    } else {
      total += parseInt(card.rank);
    }
  });

  // Add aces
  if (aceCount > 0) {
    if (total + 11 + (aceCount - 1) <= 21) {
      total += 11 + (aceCount - 1);
      isSoft = true;
    } else {
      total += aceCount;
    }
  }

  return { total, isSoft };
};

// Check if a hand is a blackjack
export const isBlackjack = (hand: Hand): boolean => {
  if (hand.cards.length !== 2) return false;
  
  const { total } = calculateHandValue(hand);
  return total === 21;
};

// Check if a hand is busted
export const isBusted = (hand: Hand): boolean => {
  const { total } = calculateHandValue(hand);
  return total > 21;
};

// Check if a hand can be split
export const canSplit = (hand: Hand): boolean => {
  if (hand.cards.length !== 2) return false;
  
  const [card1, card2] = hand.cards;
  return card1.rank === card2.rank;
};

// Check if a player can double down
export const canDoubleDown = (hand: Hand, balance: number, settings?: GameSettings): boolean => {
  // Can only double down if hand has exactly 2 cards
  if (hand.cards.length !== 2) return false;
  
  // Check if player has enough balance to double down
  if (balance < hand.bet) return false;
  
  // If the hand is a split hand, check if doubling after split is allowed
  if (hand.isSplit && settings && !settings.allowDoubleAfterSplit) return false;
  
  return true;
};

// Determine winner and calculate payout
export const determineWinner = (
  playerHand: Hand, 
  dealerHand: Hand, 
  settings: GameSettings
): { result: 'win' | 'lose' | 'push' | 'blackjack'; payout: number } => {
  const playerValue = calculateHandValue(playerHand).total;
  const dealerValue = calculateHandValue(dealerHand).total;
  
  // Handle bust cases
  if (playerValue > 21) {
    return { result: 'lose', payout: 0 };
  }
  
  if (dealerValue > 21) {
    return { result: 'win', payout: playerHand.bet * 2 };
  }
  
  // Handle blackjack
  if (isBlackjack(playerHand) && !isBlackjack(dealerHand)) {
    return { 
      result: 'blackjack', 
      payout: playerHand.bet * (1 + settings.blackjackPayout) 
    };
  }
  
  if (!isBlackjack(playerHand) && isBlackjack(dealerHand)) {
    return { result: 'lose', payout: 0 };
  }
  
  if (isBlackjack(playerHand) && isBlackjack(dealerHand)) {
    return { result: 'push', payout: playerHand.bet };
  }
  
  // Handle regular comparisons
  if (playerValue > dealerValue) {
    return { result: 'win', payout: playerHand.bet * 2 };
  }
  
  if (playerValue < dealerValue) {
    return { result: 'lose', payout: 0 };
  }
  
  return { result: 'push', payout: playerHand.bet };
}; 