const board = document.getElementById('board');
const statusDiv = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const aiToggleBtn = document.getElementById('ai-toggle');
const darkModeToggle = document.getElementById('dark-mode-toggle');
let cells = Array.from(document.querySelectorAll('.cell'));

let currentPlayer = 'X';
let gameActive = true;
let gameState = Array(9).fill('');
let aiEnabled = false;

const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8], // rows
  [0,3,6], [1,4,7], [2,5,8], // columns
  [0,4,8], [2,4,6]           // diagonals
];

// Helper to check winner for a given state and player
function checkWinnerState(state, player) {
  return winPatterns.some(pattern =>
    pattern.every(idx => state[idx] === player)
  );
}

// Minimax Algorithm for AI
function minimax(newGameState, player) {
  const availSpots = newGameState
    .map((cell, idx) => cell === '' ? idx : null)
    .filter(idx => idx !== null);

  if (checkWinnerState(newGameState, 'X')) return { score: -10 };
  if (checkWinnerState(newGameState, 'O')) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newGameState[availSpots[i]] = player;

    if (player === 'O') {
      const result = minimax(newGameState, 'X');
      move.score = result.score;
    } else {
      const result = minimax(newGameState, 'O');
      move.score = result.score;
    }

    newGameState[availSpots[i]] = '';
    moves.push(move);
  }

  let bestMove;
  if (player === 'O') {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}

// Main click handler (AI logic included)
function handleCellClick(e) {
  const idx = +e.target.dataset.index;
  if (!gameActive || gameState[idx]) return;
  gameState[idx] = currentPlayer;
  e.target.textContent = currentPlayer;

  if (checkWinnerState(gameState, currentPlayer)) {
    statusDiv.textContent = `Player ${currentPlayer} wins!`;
    gameActive = false;
    return;
  } else if (gameState.every(cell => cell)) {
    statusDiv.textContent = "It's a draw!";
    gameActive = false;
    return;
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDiv.textContent = `Player ${currentPlayer}'s turn`;
  }

  // AI move if enabled and it's O's turn
  if (aiEnabled && currentPlayer === 'O' && gameActive) {
    setTimeout(() => {
      const bestMove = minimax([...gameState], 'O').index;
      if (bestMove !== undefined && !gameState[bestMove]) {
        cells[bestMove].click();
      }
    }, 400); // slight delay for realism
  }
}

// Reset the game
function resetGame() {
  gameState = Array(9).fill('');
  cells.forEach(cell => cell.textContent = '');
  currentPlayer = 'X';
  gameActive = true;
  statusDiv.textContent = `Player ${currentPlayer}'s turn`;

  // If AI is enabled and AI is 'O' and should start
  if (aiEnabled && currentPlayer === 'O') {
    setTimeout(() => {
      const bestMove = minimax([...gameState], 'O').index;
      if (bestMove !== undefined && !gameState[bestMove]) {
        cells[bestMove].click();
      }
    }, 400);
  }
}

// Toggle AI mode
aiToggleBtn.addEventListener('click', () => {
  aiEnabled = !aiEnabled;
  aiToggleBtn.textContent = `Play vs AI: ${aiEnabled ? 'ON' : 'OFF'}`;
  resetGame();
});

// Attach click listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);

// Dark mode logic
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark)) {
  document.body.classList.add('dark-mode');
  darkModeToggle.textContent = '☀️ Light Mode';
} else {
  darkModeToggle.textContent = '🌙 Dark Mode';
}

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  darkModeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
