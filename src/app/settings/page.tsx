'use client';

import { useGame } from '@/lib/GameContext';
import { useTheme } from '@/lib/ThemeContext';
import { defaultSettings } from '@/lib/gameUtils';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    soundManager?: {
      setVolume: (value: number) => void;
    };
  }
}

export default function SettingsPage() {
  const { dispatch } = useGame();
  const { 
    theme, 
    cardStyle, 
    tableColor, 
    fontSize, 
    updateTheme,
    updateCardStyle,
    updateTableColor,
    updateFontSize,
    toggleDarkMode
  } = useTheme();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  // User profile settings
  const [userSettings, setUserSettings] = useState({
    username: '',
    displayBalance: true,
    soundEffects: true,
    animations: true,
    autoStandOn21: true,
    keepBetBetweenRounds: true
  });
  
  // Volume state for real-time updates
  const [volumeLevel, setVolumeLevel] = useState<number>(
    typeof window !== 'undefined' 
      ? parseFloat(localStorage.getItem('blackjack-volume') || '0.5')
      : 0.5
  );
  
  // Check if user is logged in
  useEffect(() => {
    const username = localStorage.getItem('blackjack-username');
    if (!username) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setUserSettings(prev => ({
        ...prev,
        username: username,
        displayBalance: localStorage.getItem('blackjack-displayBalance') !== 'false',
        soundEffects: localStorage.getItem('blackjack-soundEffects') !== 'false',
        animations: localStorage.getItem('blackjack-animations') !== 'false',
        autoStandOn21: localStorage.getItem('blackjack-autoStandOn21') !== 'false',
        keepBetBetweenRounds: localStorage.getItem('blackjack-keepBetBetweenRounds') !== 'false'
      }));
      
      // Initialize volume level from localStorage
      const savedVolume = localStorage.getItem('blackjack-volume');
      if (savedVolume) {
        setVolumeLevel(parseFloat(savedVolume));
      }
    }
    setIsLoading(false);
  }, [router]);
  
  // Handle form changes for user settings
  const handleUserSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert value based on input type
    let parsedValue: string | boolean = value;
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    
    // Set the value directly since we no longer have nested properties
    setUserSettings(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };
  
  // Handle appearance settings changes
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'theme':
        updateTheme(value as any);
        break;
      case 'cardStyle':
        updateCardStyle(value as any);
        break;
      case 'tableColor':
        updateTableColor(value as any);
        break;
      case 'fontSize':
        updateFontSize(value as any);
        break;
    }
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    toggleDarkMode();
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save user settings to localStorage
    localStorage.setItem('blackjack-username', userSettings.username);
    localStorage.setItem('blackjack-displayBalance', userSettings.displayBalance.toString());
    localStorage.setItem('blackjack-soundEffects', userSettings.soundEffects.toString());
    localStorage.setItem('blackjack-animations', userSettings.animations.toString());
    localStorage.setItem('blackjack-autoStandOn21', userSettings.autoStandOn21.toString());
    localStorage.setItem('blackjack-keepBetBetweenRounds', userSettings.keepBetBetweenRounds.toString());
    
    // Update game settings
    const settingsString = localStorage.getItem('blackjack-settings');
    const gameSettings = settingsString ? JSON.parse(settingsString) : defaultSettings;
    const updatedSettings = {
      ...gameSettings,
      autoStandOn21: userSettings.autoStandOn21,
      keepBetBetweenRounds: userSettings.keepBetBetweenRounds
    };
    localStorage.setItem('blackjack-settings', JSON.stringify(updatedSettings));
    
    setSuccessMessage('Settings saved successfully!');
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };
  
  // Handle resetting all game data
  const handleResetData = () => {
    if (showResetConfirm) {
      // Save all user settings before clearing
      const userSettingsToPreserve = {
        username: localStorage.getItem('blackjack-username'),
        displayBalance: localStorage.getItem('blackjack-displayBalance'),
        darkMode: localStorage.getItem('blackjack-darkMode'),
        soundEffects: localStorage.getItem('blackjack-soundEffects'),
        animations: localStorage.getItem('blackjack-animations'),
        theme: localStorage.getItem('blackjack-theme'),
        cardStyle: localStorage.getItem('blackjack-cardStyle'),
        tableColor: localStorage.getItem('blackjack-tableColor'),
        fontSize: localStorage.getItem('blackjack-fontSize')
      };
      
      // Clear localStorage except user settings
      localStorage.clear();
      
      // Restore the user settings
      Object.entries(userSettingsToPreserve).forEach(([key, value]) => {
        if (value !== null) {
          localStorage.setItem(`blackjack-${key}`, value);
        }
      });
      
      // Reset all game data in the context
      dispatch({ type: 'RESET_ALL_DATA' });
      dispatch({ type: 'RESET_STATS' });
      dispatch({ type: 'CLEAR_HISTORY' });
      
      // Show success message
      setSuccessMessage('Game data has been reset successfully! Your settings have been preserved.');
      setShowSuccess(true);
      
      // Reset the confirmation state
      setShowResetConfirm(false);
    } else {
      // Show confirmation first
      setShowResetConfirm(true);
    }
  };
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-yellow-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <motion.div 
        className="bg-black/30 p-6 rounded-xl backdrop-blur-sm shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 border-b border-white/20 pb-4">
          Settings
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account Settings */}
          <div>
            <h2 className="text-xl font-bold mb-4">Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input 
                  type="text" 
                  id="username" 
                  name="username"
                  value={userSettings.username}
                  onChange={handleUserSettingsChange}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Your display name in the game
                </p>
              </div>
            </div>
          </div>
          
          {/* Appearance */}
          <div>
            <h2 className="text-xl font-bold mb-4">Appearance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme */}
              <div>
                <label htmlFor="theme" className="block text-sm font-medium mb-2">
                  Theme
                </label>
                <select 
                  id="theme" 
                  name="theme" 
                  value={theme}
                  onChange={handleAppearanceChange}
                  className="w-full bg-gray-800 text-white border border-white/30 rounded-md px-4 py-2 font-medium shadow-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  style={{ color: 'white', backgroundColor: '#1f2937' }}
                >
                  <option value="default" style={{ backgroundColor: '#1f2937', color: 'white' }}>Default</option>
                  <option value="classic" style={{ backgroundColor: '#1f2937', color: 'white' }}>Classic Casino</option>
                  <option value="modern" style={{ backgroundColor: '#1f2937', color: 'white' }}>Modern Minimalist</option>
                  <option value="neon" style={{ backgroundColor: '#1f2937', color: 'white' }}>Neon Vegas</option>
                  <option value="dark" style={{ backgroundColor: '#1f2937', color: 'white' }}>Dark Mode</option>
                </select>
              </div>
              
              {/* Card Style */}
              <div>
                <label htmlFor="cardStyle" className="block text-sm font-medium mb-2">
                  Card Style
                </label>
                <select 
                  id="cardStyle" 
                  name="cardStyle" 
                  value={cardStyle}
                  onChange={handleAppearanceChange}
                  className="w-full bg-gray-800 text-white border border-white/30 rounded-md px-4 py-2 font-medium shadow-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  style={{ color: 'white', backgroundColor: '#1f2937' }}
                >
                  <option value="classic" style={{ backgroundColor: '#1f2937', color: 'white' }}>Classic</option>
                  <option value="minimal" style={{ backgroundColor: '#1f2937', color: 'white' }}>Minimal</option>
                  <option value="vintage" style={{ backgroundColor: '#1f2937', color: 'white' }}>Vintage</option>
                  <option value="modern" style={{ backgroundColor: '#1f2937', color: 'white' }}>Modern</option>
                </select>
              </div>
              
              {/* Table Color */}
              <div>
                <label htmlFor="tableColor" className="block text-sm font-medium mb-2">
                  Table Color
                </label>
                <select 
                  id="tableColor" 
                  name="tableColor" 
                  value={tableColor}
                  onChange={handleAppearanceChange}
                  className="w-full bg-gray-800 text-white border border-white/30 rounded-md px-4 py-2 font-medium shadow-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  style={{ color: 'white', backgroundColor: '#1f2937' }}
                >
                  <option value="green" style={{ backgroundColor: '#1f2937', color: 'white' }}>Green</option>
                  <option value="blue" style={{ backgroundColor: '#1f2937', color: 'white' }}>Blue</option>
                  <option value="red" style={{ backgroundColor: '#1f2937', color: 'white' }}>Red</option>
                  <option value="purple" style={{ backgroundColor: '#1f2937', color: 'white' }}>Purple</option>
                  <option value="black" style={{ backgroundColor: '#1f2937', color: 'white' }}>Black</option>
                </select>
              </div>
              
              {/* Font Size */}
              <div>
                <label htmlFor="fontSize" className="block text-sm font-medium mb-2">
                  Font Size
                </label>
                <select 
                  id="fontSize" 
                  name="fontSize" 
                  value={fontSize}
                  onChange={handleAppearanceChange}
                  className="w-full bg-gray-800 text-white border border-white/30 rounded-md px-4 py-2 font-medium shadow-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  style={{ color: 'white', backgroundColor: '#1f2937' }}
                >
                  <option value="small" style={{ backgroundColor: '#1f2937', color: 'white' }}>Small</option>
                  <option value="medium" style={{ backgroundColor: '#1f2937', color: 'white' }}>Medium</option>
                  <option value="large" style={{ backgroundColor: '#1f2937', color: 'white' }}>Large</option>
                  <option value="x-large" style={{ backgroundColor: '#1f2937', color: 'white' }}>Extra Large</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Game Experience */}
          <div>
            <h2 className="text-xl font-bold mb-4">Game Experience</h2>
            <div className="space-y-4">
              {/* Display Balance */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="displayBalance" 
                  name="displayBalance"
                  checked={userSettings.displayBalance}
                  onChange={handleUserSettingsChange}
                  className="w-5 h-5 bg-white/10 border border-white/20 rounded"
                />
                <label htmlFor="displayBalance" className="ml-3 text-sm font-medium">
                  Display Balance on Game Screen
                </label>
                <p className="text-sm text-gray-400 ml-4">
                  Show your current balance during gameplay
                </p>
              </div>
              
              {/* Sound Effects */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="soundEffects" 
                  name="soundEffects"
                  checked={userSettings.soundEffects}
                  onChange={handleUserSettingsChange}
                  className="w-5 h-5 bg-white/10 border border-white/20 rounded"
                />
                <label htmlFor="soundEffects" className="ml-3 text-sm font-medium">
                  Enable Sound Effects
                </label>
              </div>

              {/* Volume Slider */}
              <div className={`flex flex-col mb-6 ${!userSettings.soundEffects ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="volume" className="text-sm font-medium">
                    Volume
                  </label>
                  <span className="text-sm font-medium bg-gray-800 px-2 py-1 rounded-md">
                    {Math.round(volumeLevel * 100)}%
                  </span>
                </div>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-1 bg-gray-700 rounded-full"></div>
                  </div>
                  <input 
                    type="range" 
                    id="volume" 
                    name="volume"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue={volumeLevel}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setVolumeLevel(value);
                      localStorage.setItem('blackjack-volume', value.toString());
                      if (window.soundManager) {
                        window.soundManager.setVolume(value);
                      }
                    }}
                    disabled={!userSettings.soundEffects}
                    className="w-full h-6 appearance-none bg-transparent cursor-pointer relative z-10"
                    style={{
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                  />
                </div>
                <style jsx>{`
                  input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #f59e0b;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                    transition: all 0.2s ease;
                  }
                  
                  input[type=range]::-webkit-slider-thumb:hover {
                    background: #fbbf24;
                    transform: scale(1.1);
                    box-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
                  }
                  
                  input[type=range]::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #f59e0b;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                    transition: all 0.2s ease;
                    border: none;
                  }
                  
                  input[type=range]::-moz-range-thumb:hover {
                    background: #fbbf24;
                    transform: scale(1.1);
                    box-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
                  }
                  
                  input[type=range]::-ms-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #f59e0b;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                    transition: all 0.2s ease;
                  }
                  
                  input[type=range]::-ms-thumb:hover {
                    background: #fbbf24;
                    transform: scale(1.1);
                    box-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
                  }
                  
                  input[type=range]:disabled::-webkit-slider-thumb {
                    background: #6b7280;
                  }
                  
                  input[type=range]:disabled::-moz-range-thumb {
                    background: #6b7280;
                  }
                  
                  input[type=range]:disabled::-ms-thumb {
                    background: #6b7280;
                  }
                `}</style>
              </div>
              
              {/* Animations */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="animations" 
                  name="animations"
                  checked={userSettings.animations}
                  onChange={handleUserSettingsChange}
                  className="w-5 h-5 bg-white/10 border border-white/20 rounded"
                />
                <label htmlFor="animations" className="ml-3 text-sm font-medium">
                  Enable Animations
                </label>
              </div>
              
              {/* Auto Stand on 21 */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="autoStandOn21" 
                  name="autoStandOn21"
                  checked={userSettings.autoStandOn21}
                  onChange={handleUserSettingsChange}
                  className="w-5 h-5 bg-white/10 border border-white/20 rounded"
                />
                <label htmlFor="autoStandOn21" className="ml-3 text-sm font-medium">
                  Auto Stand on 21
                </label>
                <p className="text-sm text-gray-400 ml-4">
                  Automatically stand when your hand reaches 21
                </p>
              </div>
              
              {/* Keep Bet Between Rounds */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="keepBetBetweenRounds" 
                  name="keepBetBetweenRounds"
                  checked={userSettings.keepBetBetweenRounds}
                  onChange={handleUserSettingsChange}
                  className="w-5 h-5 bg-white/10 border border-white/20 rounded"
                />
                <label htmlFor="keepBetBetweenRounds" className="ml-3 text-sm font-medium">
                  Keep Bet Between Rounds
                </label>
                <p className="text-sm text-gray-400 ml-4">
                  Remember your last bet amount for the next round
                </p>
              </div>
            </div>
          </div>
          
          {/* Local Storage Info */}
          <div>
            <h2 className="text-xl font-bold mb-4">Data Storage</h2>
            <div className="bg-black/40 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">
                All game data is stored locally on your device. No information is sent to any server.
              </p>
              <p className="text-sm text-gray-400">
                Your game progress, statistics, and settings are saved in your browser's local storage.
              </p>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <button 
              type="submit"
              className="btn btn-primary px-6"
            >
              Save Settings
            </button>
            
            {/* Success Message */}
            {showSuccess && (
              <motion.p 
                className="text-green-500 font-medium"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                {successMessage}
              </motion.p>
            )}
          </div>
        </form>
        
        {/* Reset Data Section */}
        <div className="mt-10 pt-6 border-t border-white/20">
          <h2 className="text-xl font-bold mb-4 text-red-500">Danger Zone</h2>
          <div className="bg-black/40 p-4 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Reset Game Data</h3>
                <p className="text-sm text-gray-400 mb-4 md:mb-0">
                  This will reset all your game data including balance, stats, and history. Your settings will be preserved.
                </p>
              </div>
              <button 
                className={`btn ${showResetConfirm ? 'btn-danger animate-pulse' : 'btn-danger'}`}
                onClick={handleResetData}
                type="button"
              >
                {showResetConfirm ? 'Confirm Reset' : 'Reset Stats'}
              </button>
            </div>
            
            {showResetConfirm && (
              <motion.p 
                className="text-red-500 mt-4 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                This will reset all your game data including balance, stats, and history. Your settings will be preserved and you'll remain logged in. Click again to confirm.
              </motion.p>
            )}
            
            {showSuccess && (
              <motion.p 
                className="text-green-500 mt-4 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {successMessage}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 