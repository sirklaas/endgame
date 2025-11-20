// Endgame Application - Shared State Management

// Card Configuration
const cards = [
  { id: 'bedrieglijk', name: 'Bedrieglijk', image: 'bedrieglijk.png', video: 'bedrieglijk.m4v' },
  { id: 'beschermend', name: 'Beschermend', image: 'beschermend.png', video: null },
  { id: 'creatief', name: 'Creatief', image: 'creatief.png', video: null },
  { id: 'dapper', name: 'Dapper', image: 'dapper.png', video: null },
  { id: 'doorzetter', name: 'Doorzetter', image: 'doorzetter.png', video: null },
  { id: 'sinister', name: 'Sinister', image: 'sinister.png', video: null },
  { id: 'vreugdevol', name: 'Vreugdevol', image: 'vreugdevol.png', video: null },
  { id: 'wreed', name: 'Wreed', image: 'wreed.png', video: null }
];

// State Management
class EndgameState {
  constructor() {
    this.selectedCard = null;
    this.playbackState = 'grid'; // 'grid', 'paused', 'playing'
    this.usedCards = new Set();
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem('endgameState');
      if (saved) {
        const state = JSON.parse(saved);
        this.selectedCard = state.selectedCard || null;
        this.playbackState = state.playbackState || 'grid';
        this.usedCards = new Set(state.usedCards || []);
      }
    } catch (e) {
      console.error('Error loading state:', e);
    }
  }

  saveState() {
    const state = {
      selectedCard: this.selectedCard,
      playbackState: this.playbackState,
      usedCards: Array.from(this.usedCards),
      timestamp: Date.now()
    };
    localStorage.setItem('endgameState', JSON.stringify(state));
  }

  selectCard(cardId) {
    if (this.usedCards.has(cardId)) return false;
    this.selectedCard = cardId;
    this.playbackState = 'paused';
    this.saveState();
    return true;
  }

  playVideo() {
    if (this.playbackState === 'paused') {
      this.playbackState = 'playing';
      this.saveState();
      return true;
    }
    return false;
  }

  returnToGrid() {
    if (this.selectedCard) {
      this.usedCards.add(this.selectedCard);
    }
    this.selectedCard = null;
    this.playbackState = 'grid';
    this.saveState();
  }

  reset() {
    this.selectedCard = null;
    this.playbackState = 'grid';
    this.usedCards.clear();
    this.saveState();
  }

  isCardUsed(cardId) {
    return this.usedCards.has(cardId);
  }
}

// Video Controller
class VideoController {
  constructor(videoElement, titleElement) {
    this.video = videoElement;
    this.title = titleElement;
    this.currentCard = null;
  }

  loadCard(card) {
    this.currentCard = card;
    
    if (card.video) {
      // Has video - load and show first frame
      this.video.src = card.video;
      this.video.load();
      this.video.currentTime = 0;
      this.video.style.display = 'block';
    } else {
      // No video - use static image
      this.video.style.display = 'none';
      this.video.poster = card.image;
    }
    
    if (this.title) {
      this.title.textContent = card.name;
      this.title.classList.remove('hidden');
    }
  }

  async play() {
    if (this.currentCard && this.currentCard.video) {
      try {
        this.video.currentTime = 0;
        if (this.title) {
          this.title.classList.add('hidden');
        }
        await this.video.play();
        return true;
      } catch (e) {
        console.error('Error playing video:', e);
        return false;
      }
    } else {
      // No video - just show image for a moment
      if (this.title) {
        this.title.classList.add('hidden');
      }
      return true;
    }
  }

  pause() {
    if (this.video) {
      this.video.pause();
    }
  }

  reset() {
    if (this.video) {
      this.video.pause();
      this.video.currentTime = 0;
      this.video.src = '';
    }
    if (this.title) {
      this.title.textContent = '';
      this.title.classList.add('hidden');
    }
    this.currentCard = null;
  }
}

// Utility Functions
function getCardById(cardId) {
  return cards.find(card => card.id === cardId);
}

function updateCardVisuals(cardElement, cardId, state) {
  if (state.isCardUsed(cardId)) {
    cardElement.classList.add('used');
  } else {
    cardElement.classList.remove('used');
  }

  if (state.selectedCard === cardId && state.playbackState !== 'grid') {
    cardElement.classList.add('selected');
  } else {
    cardElement.classList.remove('selected');
  }
}

// Event Debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
