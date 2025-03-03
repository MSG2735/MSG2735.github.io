import { Howl } from 'howler';

// Define sound effects with their base volumes
const sounds = {
  cardDeal: new Howl({ src: ['/sounds/card-deal.mp3'], volume: 0.1 }),
  cardFlip: new Howl({ src: ['/sounds/card-flip.mp3'], volume: 0.1 }),
  chipStack: new Howl({ src: ['/sounds/chip-stack.mp3'], volume: 0.1 }),
  win: new Howl({ src: ['/sounds/win-casino-new.mp3'], volume: 0.1 }),
  lose: new Howl({ src: ['/sounds/lose-casino-new.mp3'], volume: 0.1 }),
  push: new Howl({ src: ['/sounds/push.mp3'], volume: 0.1 }),
  blackjack: new Howl({ src: ['/sounds/blackjack.mp3'], volume: 0.1 }),
  volumeChange: new Howl({ src: ['/sounds/volume-change.mp3'], volume: 0.1, preload: true })
};

// Store the original base volumes for each sound
const baseVolumes: Record<keyof typeof sounds, number> = {
  cardDeal: 0.1,
  cardFlip: 0.1,
  chipStack: 0.1,
  win: 0.1,
  lose: 0.1,
  push: 0.1,
  blackjack: 0.1,
  volumeChange: 0.1
};

class SoundManager {
  private enabled: boolean = false;
  private volume: number = 0.5;
  private volumeChangeTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    
    this.enabled = localStorage.getItem('blackjack-soundEffects') !== 'false';
    this.volume = parseFloat(localStorage.getItem('blackjack-volume') || '0.5');
    
    // Set initial volume for all sounds as a factor of their base volume
    this.applyVolumeToAllSounds();
  }

  // Apply the current volume factor to all sounds
  private applyVolumeToAllSounds() {
    Object.entries(sounds).forEach(([key, sound]) => {
      const soundKey = key as keyof typeof sounds;
      const baseVolume = baseVolumes[soundKey];
      sound.volume(baseVolume * this.volume);
    });
  }

  play(soundName: keyof typeof sounds) {
    if (typeof window === 'undefined' || !this.enabled) return;
    sounds[soundName].play();
  }

  // Play volume change sound with debounce to avoid too many sounds
  playVolumeChange() {
    if (typeof window === 'undefined' || !this.enabled) return;
    
    // Clear previous timeout if it exists
    if (this.volumeChangeTimeout) {
      clearTimeout(this.volumeChangeTimeout);
    }
    
    // Set a new timeout
    this.volumeChangeTimeout = setTimeout(() => {
      sounds.volumeChange.play();
      this.volumeChangeTimeout = null;
    }, 50);
  }

  setVolume(volume: number) {
    if (typeof window === 'undefined') return;
    this.volume = volume;
    
    // Apply the new volume factor to all sounds
    this.applyVolumeToAllSounds();
    
    this.playVolumeChange();
  }

  enable() {
    if (typeof window === 'undefined') return;
    this.enabled = true;
    localStorage.setItem('blackjack-soundEffects', 'true');
  }

  disable() {
    if (typeof window === 'undefined') return;
    this.enabled = false;
    localStorage.setItem('blackjack-soundEffects', 'false');
  }
}

// Create a singleton instance
const soundManager = typeof window !== 'undefined' ? new SoundManager() : null;

// Add to window object for global access
if (typeof window !== 'undefined') {
  (window as any).soundManager = soundManager;
}

export { soundManager };
export type { SoundManager };