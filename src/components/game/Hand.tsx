'use client';

import { Hand as HandType } from '@/types/game';
import { calculateHandValue } from '@/lib/gameUtils';
import Card from './Card';

interface HandProps {
  hand: HandType;
  isDealer?: boolean;
  currentHand?: boolean;
}

const Hand = ({ hand, isDealer = false, currentHand = false }: HandProps) => {
  const { cards, bet, isBlackjack, isBusted, doubleDown } = hand;
  const { total, isSoft } = calculateHandValue(hand);

  // Border color based on hand state
  const getBorderColor = () => {
    // Special states take precedence
    if (isBlackjack) return 'border-yellow-400';
    if (isBusted) return 'border-red-500';
    
    // For player hands, always use golden border unless it's a special state
    if (!isDealer) return 'border-yellow-500';
    
    // For dealer hands, use blue border or highlight if it's the current hand
    if (currentHand) return 'border-blue-400';
    return 'border-blue-500/70';
  };

  // Background color based on dealer/player
  const getBackgroundColor = () => {
    return isDealer ? 'bg-blue-900/10' : 'bg-gradient-to-b from-yellow-900/10 to-yellow-600/5';
  };

  // Calculate offset for card centering
  const getCardOffset = () => {
    if (cards.length <= 1) return 0;
    // For multiple cards, we need to calculate an offset
    // Each overlapping card adds ~30px to the width
    const cardStackWidth = 100 + ((cards.length - 1) * 30);
    return cardStackWidth / 2;
  };

  return (
    <div className="mb-1 flex flex-col items-center">
      {/* Title */}
      <div className="mb-0.5 text-center">
        <span className="text-xl font-bold">
          {isDealer ? 'Dealer' : 'Your Hand'}
          {!isDealer && bet > 0 && (
            <span className="ml-2 text-yellow-400">
              ${bet}{doubleDown && ' (Double Down)'}
            </span>
          )}
        </span>
      </div>

      {/* Card display container - fixed size */}
      <div className="relative" style={{ width: '300px', height: '155px' }}>
        {/* Border container */}
        <div 
          className={`absolute inset-0 border-2 ${getBorderColor()} rounded-lg flex items-center justify-center p-3 ${getBackgroundColor()}`}
        >
          {cards.length === 0 && (
            <div className="flex h-full w-full items-center justify-center text-white/50">
              {isDealer ? "Dealer's cards" : "Your cards"}
            </div>
          )}
        </div>
        
        {/* Cards - centered positioning with fixed layout */}
        {cards.length > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex justify-center" style={{ minWidth: '200px' }}>
            {cards.map((card, index) => (
              <div
                key={`${card.suit}-${card.rank}-${index}`}
                style={{
                  marginLeft: index === 0 ? '0' : '-65px',
                  zIndex: cards.length - index,
                }}
              >
                <Card card={card} index={index} isDealer={isDealer} />
              </div>
            ))}
          </div>
        )}
        
        {/* Total indicator */}
        {cards.length > 0 && (
          <div 
            className={`absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-lg z-50
              ${isBusted ? 'bg-red-500' : isBlackjack ? 'bg-yellow-400 text-black' : 'bg-white/20'}`}
          >
            {isBusted ? 'Bust' : total}{isSoft && !isBusted && '*'}
          </div>
        )}
      </div>
      
      {/* Status messages - fixed height container */}
      <div className="h-8 flex items-center justify-center">
        {isBlackjack && (
          <div className="text-xl font-bold text-yellow-400">
            BLACKJACK!
          </div>
        )}
        
        {isBusted && (
          <div className="text-xl font-bold text-red-500">
            BUSTED!
          </div>
        )}
      </div>
    </div>
  );
};

export default Hand; 