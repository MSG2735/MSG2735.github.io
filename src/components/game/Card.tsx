'use client';

import { motion } from 'framer-motion';
import { Card as CardType } from '@/types/game';

interface CardProps {
  card: CardType;
  index: number;
  isDealer?: boolean;
}

export default function Card({ card, index, isDealer = false }: CardProps) {
  const { suit, rank, faceUp } = card;
  
  // Define colors for suits
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const textColor = isRed ? 'text-red-600' : 'text-black';
  
  // Card back design
  if (!faceUp) {
    return (
      <motion.div
        className="card card-back bg-white rounded-md shadow-md"
        style={{
          width: '95px',
          height: '135px',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <div className="h-full grid grid-cols-3 grid-rows-3 gap-1 p-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-red-800 rounded-sm"></div>
          ))}
        </div>
      </motion.div>
    );
  }
  
  // Get suit symbol
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };
  
  // Card front design
  return (
    <motion.div
      className="card card-front bg-white rounded-md shadow-md"
      style={{
        width: '95px',
        height: '135px',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="p-2 flex flex-col h-full justify-between">
        <div className={`text-lg font-bold ${textColor} flex justify-between`}>
          <div>{rank}</div>
          <div>{getSuitSymbol(suit)}</div>
        </div>
        
        <div className={`text-4xl font-bold ${textColor} flex justify-center items-center flex-grow`}>
          {getSuitSymbol(suit)}
        </div>
        
        <div className={`text-lg font-bold ${textColor} flex justify-between rotate-180`}>
          <div>{rank}</div>
          <div>{getSuitSymbol(suit)}</div>
        </div>
      </div>
    </motion.div>
  );
} 