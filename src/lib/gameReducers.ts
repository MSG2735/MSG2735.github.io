import { GameState, Hand, Card, GameSettings, GameStats, MatchHistoryEntry, PurchaseHistoryEntry } from '@/types/game';
import { createDeck, dealCard, calculateHandValue, isBlackjack, isBusted, determineWinner, defaultSettings } from './gameUtils';
import { soundManager } from './soundEffects';

// Helper function to get ordinal suffix for numbers
function getOrdinalSuffix(num: number): string {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}

// Helper function to check if all hands are standing or busted
function areAllHandsComplete(hands: Hand[]): boolean {
  return hands.every(hand => hand.isStanding || hand.isBusted);
}

// Helper function to get settings from localStorage
function getSettingsFromStorage(): GameSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const settingsString = localStorage.getItem('blackjack-settings');
    return settingsString ? { ...defaultSettings, ...JSON.parse(settingsString) } : defaultSettings;
  } catch (e) {
    console.error('Error parsing settings:', e);
    return defaultSettings;
  }
}

// Betting phase reducer
export function handleBetPhase(state: GameState, bet: number): GameState {
  if (bet <= 0 || bet > state.player.balance) {
    return { ...state, message: 'Invalid bet amount.' };
  }

  soundManager?.play('placeBet');
  
  const newHand: Hand = {
    cards: [],
    bet,
    doubleDown: false,
    insurance: false,
    insuranceBet: 0,
    isStanding: false,
    isBusted: false,
    isBlackjack: false,
    isSplit: false,
  };

  return {
    ...state,
    player: {
      ...state.player,
      hands: [newHand],
      balance: state.player.balance - bet,
    },
    currentHandIndex: 0,
    gamePhase: 'playerTurn',
    message: 'Dealing cards...',
    gameResult: null,
    lastBetAmount: bet,
  };
}

// Initial deal reducer
export function handleInitialDeal(state: GameState): GameState {
  let newDeck = createDeck(6);
  let playerCard1: Card, dealerCard1: Card, playerCard2: Card, dealerCard2: Card;
  
  [playerCard1, newDeck] = dealCard(newDeck, true);
  soundManager?.play('cardSlide');
  [dealerCard1, newDeck] = dealCard(newDeck, true);
  soundManager?.play('cardSlide');
  [playerCard2, newDeck] = dealCard(newDeck, true);
  soundManager?.play('cardSlide');
  [dealerCard2, newDeck] = dealCard(newDeck, false);
  soundManager?.play('cardSlide');

  const playerHand = {
    ...state.player.hands[0],
    cards: [playerCard1, playerCard2],
    isBlackjack: isBlackjack({ cards: [playerCard1, playerCard2] } as Hand),
  };

  const dealerHand: Hand = {
    cards: [dealerCard1, dealerCard2],
    bet: 0,
    doubleDown: false,
    insurance: false,
    insuranceBet: 0,
    isStanding: false,
    isBusted: false,
    isBlackjack: isBlackjack({ cards: [dealerCard1, dealerCard2] } as Hand),
    isSplit: false,
  };

  const canSplitInitialHand = playerCard1.rank === playerCard2.rank;
  let message = canSplitInitialHand ? 'Hit, stand, double down, or split.' : 'Hit, stand, or double down.';
  let gamePhase = state.gamePhase;
  let gameResult = null;

  if (playerHand.isBlackjack) {
    if (dealerHand.isBlackjack) {
      gamePhase = 'gameOver';
      message = 'Both have blackjack - Push (Bet returned)';
      gameResult = 'push';
    } else {
      const blackjackPayout = playerHand.bet * 1.5;
      gamePhase = 'gameOver';
      message = `Blackjack! (+$${Math.floor(blackjackPayout)})`;
      gameResult = 'blackjack';
    }
  } else if (dealerHand.isBlackjack) {
    gamePhase = 'gameOver';
    message = `Dealer has blackjack (-$${playerHand.bet})`;
    gameResult = 'lose';
  } else {
    gamePhase = 'playerTurn';
  }

  return {
    ...state,
    deck: newDeck,
    player: { ...state.player, hands: [playerHand] },
    dealer: dealerHand,
    gamePhase,
    message,
    gameResult: gameResult as 'win' | 'lose' | 'push' | 'blackjack' | null,
  };
}

// Player actions reducers
export function handleHit(state: GameState): GameState {
  const currentHandIndex = state.currentHandIndex;
  const currentHand = state.player.hands[currentHandIndex];
  let [newCard, newDeck] = dealCard([...state.deck], true);
  soundManager?.play('revealCard');

  const updatedHand: Hand = {
    ...currentHand,
    cards: [...currentHand.cards, newCard],
    isBusted: isBusted({ ...currentHand, cards: [...currentHand.cards, newCard] }),
  };

  const updatedHands = [...state.player.hands];
  updatedHands[currentHandIndex] = updatedHand;

  let gamePhase = state.gamePhase;
  let message = state.message;
  let nextHandIndex = currentHandIndex;

  if (updatedHand.isBusted) {
    const allHandsBusted = updatedHands.every(hand => hand.isBusted);
    if (allHandsBusted) {
      gamePhase = 'evaluating';
      message = `All hands busted (-$${updatedHands.reduce((sum, hand) => sum + hand.bet, 0)})`;
    } else if (areAllHandsComplete(updatedHands)) {
      gamePhase = 'dealerTurn';
      message = 'Dealer\'s turn.';
    } else {
      nextHandIndex = currentHandIndex + 1;
      gamePhase = 'playerTurn';
      message = `Playing ${nextHandIndex + 1}${getOrdinalSuffix(nextHandIndex + 1)} hand. Hit, stand, or double down.`;
    }
  } else {
    const { total } = calculateHandValue(updatedHand);
    const settings = getSettingsFromStorage();

    if (total === 21 && settings.autoStandOn21) {
      updatedHands[currentHandIndex] = { ...updatedHand, isStanding: true };
      if (areAllHandsComplete(updatedHands)) {
        gamePhase = 'dealerTurn';
        message = 'Player stands with 21. Dealer\'s turn.';
      } else {
        nextHandIndex = currentHandIndex + 1;
        gamePhase = 'playerTurn';
        message = `Playing ${nextHandIndex + 1}${getOrdinalSuffix(nextHandIndex + 1)} hand. Hit, stand, or double down.`;
      }
    } else {
      message = total === 21 ? 'You have 21! Hit or Stand?' : 'Hit or Stand?';
    }
  }

  return {
    ...state,
    deck: newDeck,
    player: { ...state.player, hands: updatedHands },
    currentHandIndex: nextHandIndex,
    gamePhase,
    message,
  };
}

// Stand action reducer
export function handleStand(state: GameState): GameState {
  const currentHandIndex = state.currentHandIndex;
  const updatedHands = [...state.player.hands];
  
  soundManager?.play('cardSlide');
  
  // Mark the current hand as standing
  updatedHands[currentHandIndex] = {
    ...updatedHands[currentHandIndex],
    isStanding: true,
  };
  
  // Determine next game phase
  let gamePhase = state.gamePhase;
  let message = state.message;
  let nextHandIndex = currentHandIndex;
  
  // Check if the player busted after doubling down
  const currentHand = updatedHands[currentHandIndex];
  if (currentHand.isBusted) {
    // If busted, go straight to evaluating (skip dealer's turn)
    gamePhase = 'evaluating';
    message = `Busted after doubling down! (-$${currentHand.bet})`;
    soundManager?.play('playerLoses');
  } else if (areAllHandsComplete(updatedHands)) {
    gamePhase = 'dealerTurn';
    message = 'Dealer\'s turn.';
  } else {
    // Move to the next hand
    nextHandIndex = currentHandIndex + 1;
    if (nextHandIndex < updatedHands.length) {
      gamePhase = 'playerTurn';
      message = `Playing ${nextHandIndex + 1}${getOrdinalSuffix(nextHandIndex + 1)} hand. Hit, stand, or double down.`;
    } else {
      gamePhase = 'dealerTurn';
      message = 'Dealer\'s turn.';
    }
  }
  
  return {
    ...state,
    player: {
      ...state.player,
      hands: updatedHands,
    },
    gamePhase,
    message,
    currentHandIndex: nextHandIndex,
  };
}

// Double down action reducer
export function handleDoubleDown(state: GameState): GameState {
  const currentHandIndex = state.currentHandIndex;
  const currentHand = state.player.hands[currentHandIndex];
  const bet = currentHand.bet;
  
  // Validation checks
  if (currentHand.cards.length !== 2) {
    return { ...state, message: 'Can only double down on first two cards.' };
  }
  
  if (state.player.balance < bet) {
    return { ...state, message: 'Not enough balance to double down.' };
  }
  
  // Check if doubling after split is allowed
  const settings = getSettingsFromStorage();
  if (currentHand.isSplit && !settings.allowDoubleAfterSplit) {
    return { ...state, message: 'Doubling down after split is not allowed.' };
  }
  
  // Deal one more card
  let [newCard, newDeck] = dealCard([...state.deck], true);
  soundManager?.play('revealCard');
  
  // Update hand
  const updatedHand: Hand = {
    ...currentHand,
    cards: [...currentHand.cards, newCard],
    bet: bet * 2, // Double the bet
    doubleDown: true,
    isStanding: true, // Player must stand after doubling down
    isBusted: isBusted({ ...currentHand, cards: [...currentHand.cards, newCard] }),
  };
  
  const updatedHands = [...state.player.hands];
  updatedHands[currentHandIndex] = updatedHand;
  
  // Determine next game phase
  let gamePhase = state.gamePhase;
  let message = state.message;
  let nextHandIndex = currentHandIndex;
  
  // Check if the player busted after doubling down
  if (updatedHand.isBusted) {
    // If busted, go straight to evaluating (skip dealer's turn)
    gamePhase = 'evaluating';
    message = `Busted after doubling down! (-$${updatedHand.bet})`;
    soundManager?.play('playerLoses');
  } else if (areAllHandsComplete(updatedHands)) {
    gamePhase = 'dealerTurn';
    message = 'Dealer\'s turn.';
  } else {
    // Move to the next hand
    nextHandIndex = currentHandIndex + 1;
    if (nextHandIndex < updatedHands.length) {
      gamePhase = 'playerTurn';
      message = `Playing ${nextHandIndex + 1}${getOrdinalSuffix(nextHandIndex + 1)} hand. Hit, stand, or double down.`;
    } else {
      gamePhase = 'dealerTurn';
      message = 'Dealer\'s turn.';
    }
  }
  
  return {
    ...state,
    deck: newDeck,
    player: {
      ...state.player,
      hands: updatedHands,
      balance: state.player.balance - bet, // Deduct the additional bet
    },
    gamePhase,
    message,
    currentHandIndex: nextHandIndex,
  };
}

// Split action reducer
export function handleSplit(state: GameState): GameState {
  const currentHandIndex = state.currentHandIndex;
  const currentHand = state.player.hands[currentHandIndex];
  
  // Validation checks
  if (currentHand.cards.length !== 2 || currentHand.cards[0].rank !== currentHand.cards[1].rank) {
    return { ...state, message: 'This hand cannot be split.' };
  }
  
  if (state.player.balance < currentHand.bet) {
    return { ...state, message: 'Not enough balance to split.' };
  }
  
  // Create two new hands from the split
  const firstCard = currentHand.cards[0];
  const secondCard = currentHand.cards[1];
  
  let newDeck = [...state.deck];
  let newCard1: Card, newCard2: Card;
  
  [newCard1, newDeck] = dealCard(newDeck, true);
  soundManager?.play('cardSlide');
  [newCard2, newDeck] = dealCard(newDeck, true);
  soundManager?.play('cardSlide');
  
  const firstHand: Hand = {
    cards: [firstCard, newCard1],
    bet: currentHand.bet,
    doubleDown: false,
    insurance: false,
    insuranceBet: 0,
    isStanding: false,
    isBusted: false,
    isBlackjack: false, // A split hand cannot be a blackjack
    isSplit: true,
  };
  
  const secondHand: Hand = {
    cards: [secondCard, newCard2],
    bet: currentHand.bet,
    doubleDown: false,
    insurance: false,
    insuranceBet: 0,
    isStanding: false,
    isBusted: false,
    isBlackjack: false, // A split hand cannot be a blackjack
    isSplit: true,
  };
  
  // Replace the current hand with the two new hands
  const newHands = [...state.player.hands];
  newHands.splice(currentHandIndex, 1, firstHand, secondHand);
  
  return {
    ...state,
    deck: newDeck,
    player: {
      ...state.player,
      hands: newHands,
      balance: state.player.balance - currentHand.bet, // Deduct the additional bet
    },
    gamePhase: 'playerTurn',
    message: 'Playing 1st hand. Hit, stand, or double down.',
  };
}

// Dealer play action reducer
export function handleDealerPlay(state: GameState): GameState {
  // Flip dealer's second card and play sound
  const dealerCards = state.dealer.cards.map((card, index) => {
    if (index === 1) {
      soundManager?.play('revealCard');
      return { ...card, faceUp: true };
    }
    return card;
  });
  
  let dealerHand: Hand = {
    ...state.dealer,
    cards: dealerCards,
    isBlackjack: isBlackjack({ ...state.dealer, cards: dealerCards }),
  };
  
  // Dealer must hit until 17 or higher
  let newDeck = [...state.deck];
  while (calculateHandValue(dealerHand).total < 17) {
    let newCard: Card;
    [newCard, newDeck] = dealCard(newDeck, true);
    soundManager?.play('cardSlide'); // Play sound for each new card
    dealerHand.cards.push(newCard);
  }
  
  // Check if dealer busted
  dealerHand.isBusted = isBusted(dealerHand);
  
  return {
    ...state,
    deck: newDeck,
    dealer: dealerHand,
    gamePhase: 'evaluating',
    message: 'Evaluating hands...',
  };
}

// Evaluate hands action reducer
export function handleEvaluateHands(state: GameState): GameState {
  const playerHands = state.player.hands;
  const dealerHand = state.dealer;
  
  // Calculate the total payout
  let totalPayout = 0;
  let result: GameState['gameResult'] = null;
  
  // Store the last bet amount (from the first hand if multiple hands)
  const lastBetAmount = playerHands[0]?.bet || 0;
  
  // For a single hand, we can determine a specific result
  const handResults: { result: string; payout: number; index: number }[] = [];
  
  // Get game settings
  const gameSettings = getSettingsFromStorage();
  
  // Evaluate each hand
  if (playerHands.length === 1) {
    // Single hand evaluation
    const { result: handResult, payout } = determineWinner(playerHands[0], dealerHand, gameSettings);
    totalPayout = payout;
    result = handResult;
  } else {
    // Multiple hands evaluation
    playerHands.forEach((hand, index) => {
      const { result: handResult, payout } = determineWinner(hand, dealerHand, gameSettings);
      handResults.push({ result: handResult, payout, index });
      totalPayout += payout;
    });
  }
  
  let message = '';
  if (playerHands.length === 1) {
    const bet = playerHands[0].bet;
    const netWin = totalPayout - bet;
    
    switch (result) {
      case 'win':
        soundManager?.play('playerWins');
        message = `You win (+$${netWin})`;
        break;
      case 'lose':
        soundManager?.play('playerLoses');
        message = `You lose (-$${bet})`;
        break;
      case 'push':
        soundManager?.play('gameTie');
        message = 'Push (Bet returned)';
        break;
      case 'blackjack':
        soundManager?.play('playerBlackjack');
        message = `Blackjack! (+$${netWin})`;
        break;
    }
  } else {
    // For split hands, create a detailed message showing the result of each hand
    const handResultsText = handResults.map(({ result, index }) => {
      switch (result) {
        case 'win':
          return `Hand ${index + 1}: Win`;
        case 'lose':
          return `Hand ${index + 1}: Lose`;
        case 'push':
          return `Hand ${index + 1}: Push`;
        case 'blackjack':
          return `Hand ${index + 1}: Blackjack!`;
        default:
          return `Hand ${index + 1}: ${result}`;
      }
    }).join(' | ');
    
    // Add the total net win/loss
    const totalBet = state.player.hands.reduce((sum, hand) => sum + hand.bet, 0);
    const netWin = totalPayout - totalBet;
    
    if (netWin > 0) {
      soundManager?.play('playerWins');
      message = `${handResultsText} | Total: +$${netWin}`;
    } else if (netWin < 0) {
      soundManager?.play('playerLoses');
      message = `${handResultsText} | Total: -$${Math.abs(netWin)}`;
    } else {
      soundManager?.play('gameTie');
      message = `${handResultsText} | Total: Push`;
    }
  }
  
  return {
    ...state,
    player: {
      ...state.player,
      balance: state.player.balance + totalPayout,
    },
    gamePhase: 'gameOver',
    message,
    gameResult: result,
    handResults: handResults,
    lastBetAmount: lastBetAmount,
  };
}

// New game action reducer
export function handleNewGame(state: GameState): GameState {
  // Get keepBetBetweenRounds setting
  const settings = getSettingsFromStorage();
  const keepBetBetweenRounds = settings.keepBetBetweenRounds;
  
  const initialGameState = {
    deck: [],
    dealer: {
      cards: [],
      bet: 0,
      doubleDown: false,
      insurance: false,
      insuranceBet: 0,
      isStanding: false,
      isBusted: false,
      isBlackjack: false,
      isSplit: false,
    },
    player: {
      hands: [
        {
          cards: [],
          bet: 0,
          doubleDown: false,
          insurance: false,
          insuranceBet: 0,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isSplit: false,
        },
      ],
      balance: state.player.balance,
      name: state.player.name,
      id: state.player.id,
    },
    currentHandIndex: 0,
    gamePhase: 'betting',
    message: 'Place your bet to start the game.',
    gameResult: null,
    handResults: null,
    lastBetAmount: keepBetBetweenRounds ? state.lastBetAmount : 0,
  };
  
return initialGameState as GameState;
}