'use client';

import { motion } from 'framer-motion';

interface ChipProps {
  value: number;
  onClick: () => void;
  disabled?: boolean;
}

export default function Chip({ value, onClick, disabled = false }: ChipProps) {
  // Define color based on chip value
  const getChipColors = (value: number) => {
    switch (value) {
      case 5:
        return {
          border: 'border-red-800',
          background: 'bg-red-600',
          shadowColor: '#7f1d1d'
        };
      case 10:
        return {
          border: 'border-blue-800',
          background: 'bg-blue-600',
          shadowColor: '#1e3a8a'
        };
      case 25:
        return {
          border: 'border-green-800',
          background: 'bg-green-600',
          shadowColor: '#166534'
        };
      case 50:
        return {
          border: 'border-purple-800',
          background: 'bg-purple-600',
          shadowColor: '#581c87'
        };
      case 100:
        return {
          border: 'border-amber-800',
          background: 'bg-amber-600',
          shadowColor: '#92400e'
        };
      default:
        return {
          border: 'border-gray-800',
          background: 'bg-gray-600',
          shadowColor: '#1f2937'
        };
    }
  };

  const { border, background, shadowColor } = getChipColors(value);

  return (
    <motion.div
      className={`chip ${border} ${background} text-white w-16 h-16 text-lg font-bold
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      style={{ boxShadow: !disabled ? `0 4px 6px ${shadowColor}` : 'none' }}
    >
      ${value}
    </motion.div>
  );
} 