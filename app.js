// Configuration
const TOTAL_PAIRS = 12;
const IMAGE_EXTENSION = '.png';

// Global state
let pairs = [];
let currentIndex = 0;
let score = 0;
let hasAnswered = false;

// DOM elements
let elements = {};

// Initialize app
async function init() {
  cacheElements();
  attachListeners();
  
  try {
    const viewData = await loadViewData();
    pairs = generatePairs(viewData);
    renderQuestion();
  } catch (error) {
    console.error('Failed to load data:', error);
    alert('Failed to load quiz data. Please make sure data.json exists.');
  }
}

// Cache DOM elements
function cacheElements() {
  elements = {
    startModal: document.getElementById('start-modal'),
    startButton: document.getElementById('start-button'),
    quizScreen: document.getElementById('quiz-screen'),
    resultScreen: document.getElementById('result-screen'),
    progressText: document.getElementById('progress-text'),
    progressFill: document.getElementById('progress-fill'),
    leftImage: document.getElementById('left-image'),
    rightImage: document.getElementById('right-image'),
    leftBlur: document.getElementById('left-blur'),
    rightBlur: document.getElementById('right-blur'),
    leftViews: document.getElementById('left-views'),
    rightViews: document.getElementById('right-views'),
    nextButton: document.getElementById('next-button'),
    restartButton: document.getElementById('restart-button'),
    resultScore: document.getElementById('result-score'),
    resultMessage: document.getElementById('result-message'),
    leftCard: document.querySelector('[data-side="left"].card'),
    rightCard: document.querySelector('[data-side="right"].card'),
  };
}

// Attach event listeners
function attachListeners() {
  elements.startButton.addEventListener('click', startQuiz);
  
  const buttons = document.querySelectorAll('.card-button');
  buttons.forEach(btn => {
    const side = btn.getAttribute('data-side');
    btn.addEventListener('click', () => handleChoice(side));
  });
  
  elements.nextButton.addEventListener('click', nextQuestion);
  elements.restartButton.addEventListener('click', restart);
}

// Start quiz (hide modal)
function startQuiz() {
  elements.startModal.classList.add('hidden');
}

// Load view data from JSON
async function loadViewData() {
  const response = await fetch('data.json');
  if (!response.ok) {
    throw new Error('Failed to load data.json');
  }
  return await response.json();
}

// Generate pairs from view data
function generatePairs(viewData) {
  const pairs = [];
  
  for (let i = 1; i <= TOTAL_PAIRS; i++) {
    const winnerKey = `w${i}`;
    const loserKey = `l${i}`;
    
    if (!viewData.winners[winnerKey] || !viewData.losers[loserKey]) {
      console.warn(`Missing data for pair ${i}`);
      continue;
    }
    
    // Randomly place winner on left or right
    const winnerOnLeft = Math.random() < 0.5;
    
    const pair = {
      id: i,
      left: {
        image: winnerOnLeft ? `winners/w${i}${IMAGE_EXTENSION}` : `losers/l${i}${IMAGE_EXTENSION}`,
        views: winnerOnLeft ? viewData.winners[winnerKey] : viewData.losers[loserKey],
        isViral: winnerOnLeft,
      },
      right: {
        image: !winnerOnLeft ? `winners/w${i}${IMAGE_EXTENSION}` : `losers/l${i}${IMAGE_EXTENSION}`,
        views: !winnerOnLeft ? viewData.winners[winnerKey] : viewData.losers[loserKey],
        isViral: !winnerOnLeft,
      },
    };
    
    pairs.push(pair);
  }
  
  return pairs;
}

// Format view count (e.g., 1234567 -> "1.2M")
function formatViews(views) {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M views';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K views';
  }
  return views + ' views';
}

// Render current question
function renderQuestion() {
  if (currentIndex >= pairs.length) {
    showResults();
    return;
  }
  
  const pair = pairs[currentIndex];
  hasAnswered = false;
  
  // Update progress
  const questionNum = currentIndex + 1;
  elements.progressText.textContent = `Question ${questionNum} of ${pairs.length}`;
  elements.progressFill.style.width = `${(questionNum / pairs.length) * 100}%`;
  
  // Load images
  elements.leftImage.src = pair.left.image;
  elements.rightImage.src = pair.right.image;
  
  // Reset UI
  elements.leftCard.classList.remove('chosen', 'viral');
  elements.rightCard.classList.remove('chosen', 'viral');
  elements.leftBlur.classList.remove('hidden');
  elements.rightBlur.classList.remove('hidden');
  elements.leftViews.classList.remove('visible');
  elements.rightViews.classList.remove('visible');
  elements.leftViews.innerHTML = '';
  elements.rightViews.innerHTML = '';
  elements.nextButton.disabled = true;
}

// Handle user choice
function handleChoice(side) {
  if (hasAnswered) return;
  hasAnswered = true;
  
  const pair = pairs[currentIndex];
  const chosen = pair[side];
  const other = pair[side === 'left' ? 'right' : 'left'];
  const isCorrect = chosen.isViral;
  
  // Update score
  if (isCorrect) {
    score++;
  }
  
  // Mark chosen card
  const chosenCard = side === 'left' ? elements.leftCard : elements.rightCard;
  chosenCard.classList.add('chosen');
  
  // Mark viral cards
  if (pair.left.isViral) {
    elements.leftCard.classList.add('viral');
  }
  if (pair.right.isViral) {
    elements.rightCard.classList.add('viral');
  }
  
  // Hide blur overlays and show views overlays
  elements.leftBlur.classList.add('hidden');
  elements.rightBlur.classList.add('hidden');
  
  // Populate left views overlay
  const leftBadgeClass = pair.left.isViral ? 'viral' : 'not-viral';
  const leftBadgeText = pair.left.isViral ? 'Viral' : 'Not viral';
  elements.leftViews.innerHTML = `
    <div class="badge ${leftBadgeClass}">${leftBadgeText}</div>
    <div class="views">${formatViews(pair.left.views)}</div>
  `;
  elements.leftViews.classList.add('visible');
  
  // Populate right views overlay
  const rightBadgeClass = pair.right.isViral ? 'viral' : 'not-viral';
  const rightBadgeText = pair.right.isViral ? 'Viral' : 'Not viral';
  elements.rightViews.innerHTML = `
    <div class="badge ${rightBadgeClass}">${rightBadgeText}</div>
    <div class="views">${formatViews(pair.right.views)}</div>
  `;
  elements.rightViews.classList.add('visible');
  
  
  // Enable next button
  elements.nextButton.disabled = false;
}

// Go to next question
function nextQuestion() {
  currentIndex++;
  renderQuestion();
}

// Show results screen
function showResults() {
  elements.quizScreen.classList.remove('active');
  elements.resultScreen.classList.add('active');
  
  const percentage = Math.round((score / pairs.length) * 100);
  
  elements.resultScore.textContent = `${score}/${pairs.length}`;
  
  let message;
  if (percentage >= 80) {
    message = 'Incredible! You have a sharp eye for viral content.';
  } else if (percentage >= 60) {
    message = 'Nice work! You\'re getting the hang of this.';
  } else if (percentage >= 40) {
    message = 'Not bad, but there\'s room to improve your viral sense.';
  } else {
    message = 'This is trickier than it looks! Try again and trust your instincts.';
  }
  
  elements.resultMessage.textContent = message;
}

// Restart quiz
function restart() {
  currentIndex = 0;
  score = 0;
  hasAnswered = false;
  
  elements.resultScreen.classList.remove('active');
  elements.quizScreen.classList.add('active');
  
  renderQuestion();
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
