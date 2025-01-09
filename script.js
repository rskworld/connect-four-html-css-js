// Music Control
document.addEventListener('DOMContentLoaded', () => {
    const backgroundMusic = document.getElementById('background-music');
    const musicToggleBtn = document.getElementById('music-toggle');
    let isMusicPlaying = false;

    // Ensure music is paused by default
    backgroundMusic.pause();

    musicToggleBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            // Turn music off
            backgroundMusic.pause();
            musicToggleBtn.classList.remove('music-on');
            musicToggleBtn.classList.add('music-off');
            isMusicPlaying = false;
        } else {
            // Turn music on
            backgroundMusic.play().catch(error => {
                console.error('Error playing background music:', error);
                // Fallback if autoplay is blocked
                alert('Please interact with the page to enable music');
            });
            musicToggleBtn.classList.remove('music-off');
            musicToggleBtn.classList.add('music-on');
            isMusicPlaying = true;
        }
    });

    // Optional: Prevent multiple music instances
    backgroundMusic.addEventListener('ended', () => {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
    });
});

// Audio Management
document.addEventListener('DOMContentLoaded', () => {
    // Audio Elements
    const moveSound = document.getElementById('move-sound');
    const winSound = document.getElementById('win-sound');
    const backgroundMusic = document.getElementById('background-music');
    
    // Audio Control Buttons
    const backgroundMusicToggle = document.getElementById('background-music-toggle');
    const gameSoundsToggle = document.getElementById('game-sounds-toggle');

    // Audio State Management
    let isMusicPlaying = false;
    let areSoundEffectsEnabled = true;

    // Audio Unlock Function (for browsers with autoplay restrictions)
    function unlockAudio() {
        [moveSound, winSound, backgroundMusic].forEach(audio => {
            audio.play().catch(error => console.log('Autoplay blocked:', error));
        });
        document.removeEventListener('click', unlockAudio);
    }
    document.addEventListener('click', unlockAudio);

    // Background Music Toggle
    backgroundMusicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            // Turn music off
            backgroundMusic.pause();
            backgroundMusicToggle.classList.remove('music-on');
            backgroundMusicToggle.classList.add('music-off');
            isMusicPlaying = false;
        } else {
            // Turn music on
            backgroundMusic.play().catch(error => {
                console.error('Music play error:', error);
                alert('Please interact with the page to enable music');
            });
            backgroundMusicToggle.classList.remove('music-off');
            backgroundMusicToggle.classList.add('music-on');
            isMusicPlaying = true;
        }
    });

    // Game Sounds Toggle
    gameSoundsToggle.addEventListener('click', () => {
        // Toggle sound effects state
        areSoundEffectsEnabled = !areSoundEffectsEnabled;
        
        if (areSoundEffectsEnabled) {
            // Sound effects enabled
            gameSoundsToggle.classList.remove('sounds-off');
            gameSoundsToggle.classList.add('sounds-on');
        } else {
            // Sound effects disabled
            gameSoundsToggle.classList.remove('sounds-on');
            gameSoundsToggle.classList.add('sounds-off');
        }
    });

    // Sound Effect Functions
    function playMoveSound() {
        if (areSoundEffectsEnabled) {
            try {
                moveSound.currentTime = 0;
                moveSound.play();
            } catch (error) {
                console.error('Move sound error:', error);
            }
        }
    }

    function playWinSound() {
        if (areSoundEffectsEnabled) {
            try {
                winSound.play();
            } catch (error) {
                console.error('Win sound error:', error);
            }
        }
    }

    // Ensure background music loops
    backgroundMusic.addEventListener('ended', () => {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(() => {});
    });

    // Expose sound functions globally
    window.playMoveSound = playMoveSound;
    window.playWinSound = playWinSound;
});

// Game Configuration
const ROWS = 6;
const COLS = 7;
const CONNECT_COUNT = 4;

// Game State
let gameMode = 'dual'; // 'dual' or 'single'
let aiDifficulty = 'medium';
let playerNumber = 1;
let gameActive = true;

// DOM Elements
const grid = document.getElementById('grid');
const playerType = document.getElementById('player-type');
const resetBtn = document.getElementById('reset-btn');
const modeSingleBtn = document.getElementById('mode-single');
const modeDualBtn = document.getElementById('mode-dual');
const difficultySelectorDiv = document.getElementById('difficulty-selector');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

// Game Board
let filledGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));

// Initialize Game
function initializeGame() {
    createGameGrid();
    setupEventListeners();
    resetBoard();
}

// Create Game Grid Dynamically
function createGameGrid() {
    grid.innerHTML = ''; // Clear existing grid
    
    // Create 6 rows
    for (let row = 0; row < ROWS; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        
        // Create 7 columns in each row
        for (let col = 0; col < COLS; col++) {
            const colDiv = document.createElement('div');
            colDiv.classList.add('col');
            
            const button = document.createElement('button');
            button.classList.add('btn');
            
            // Calculate button number based on row and column
            const buttonNo = row * COLS + col + 1;
            button.classList.add(`btn-${buttonNo}`);
            button.dataset.buttonNo = buttonNo;
            button.dataset.row = row;
            button.dataset.col = col;
            
            // Initially disable buttons except for the bottom row
            if (row !== ROWS - 1) {
                button.disabled = true;
                button.classList.add('disabled');
            }
            
            colDiv.appendChild(button);
            rowDiv.appendChild(colDiv);
        }
        
        grid.appendChild(rowDiv);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Mode Selection
    modeSingleBtn.addEventListener('click', () => switchGameMode('single'));
    modeDualBtn.addEventListener('click', () => switchGameMode('dual'));

    // Difficulty Selection
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aiDifficulty = btn.id.split('-')[1];
        });
    });

    // Reset Button
    resetBtn.addEventListener('click', resetBoard);

    // Grid Button Listeners
    const buttons = document.querySelectorAll('.game-grid .btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonNo = parseInt(button.dataset.buttonNo);
            const col = (buttonNo - 1) % COLS;
            makeMove(col);
        });
    });
}

// Switch Game Mode
function switchGameMode(mode) {
    gameMode = mode;
    modeSingleBtn.classList.toggle('active', mode === 'single');
    modeDualBtn.classList.toggle('active', mode === 'dual');
    
    difficultySelectorDiv.classList.toggle('d-none', mode !== 'single');
    
    resetBoard();
}

// Make Move
function makeMove(col) {
    if (!gameActive) return;

    const row = findEmptyRow(col);
    if (row === -1) return; // Column is full

    filledGrid[row][col] = playerNumber;
    updateButtonStyle(row, col);

    // Enable the button in the row above the current move
    if (row > 0) {
        const aboveButtonIndex = (row - 1) * COLS + col + 1;
        const aboveButton = document.querySelector(`.btn-${aboveButtonIndex}`);
        if (aboveButton) {
            aboveButton.disabled = false;
            aboveButton.classList.remove('disabled');
        }
    }

    if (playerWon(row, col)) {
        endGame(playerNumber);
        return;
    }

    if (boardFull()) {
        endGame(0); // Draw
        return;
    }

    switchPlayer();

    if (gameMode === 'single' && playerNumber === 2) {
        setTimeout(aiMove, 500);
    }
}

// AI Move
function aiMove() {
    let col;
    switch (aiDifficulty) {
        case 'easy':
            col = randomMove();
            break;
        case 'medium':
            col = strategicMove();
            break;
        case 'hard':
            col = advancedMove();
            break;
    }
    makeMove(col);
}

// AI Move Strategies
function randomMove() {
    const availableColumns = getAvailableColumns();
    return availableColumns[Math.floor(Math.random() * availableColumns.length)];
}

function strategicMove() {
    // Basic strategy: Block opponent or create winning move
    const winningMove = findWinningMove(2);
    if (winningMove !== -1) return winningMove;

    const blockingMove = findWinningMove(1);
    if (blockingMove !== -1) return blockingMove;

    return randomMove();
}

function advancedMove() {
    // More complex AI strategy (minimax algorithm)
    // Placeholder for advanced AI logic
    return strategicMove();
}

// Utility Functions
function findEmptyRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (filledGrid[row][col] === -1) return row;
    }
    return -1;
}

function updateButtonStyle(row, col) {
    const buttonIndex = row * COLS + col + 1;
    const button = document.querySelector(`.btn-${buttonIndex}`);
    button.classList.add(`player-${playerNumber}`, 'drop-animation');
}

function switchPlayer() {
    playerNumber = playerNumber === 1 ? 2 : 1;
    playerType.textContent = `Player - ${playerNumber}`;
}

function playerWon(row, col) {
    const player = filledGrid[row][col];
    
    // Check horizontal
    let count = 0;
    for (let c = Math.max(0, col - 3); c <= Math.min(COLS - 1, col + 3); c++) {
        count = (filledGrid[row][c] === player) ? count + 1 : 0;
        if (count === CONNECT_COUNT) return true;
    }

    // Check vertical
    count = 0;
    for (let r = Math.max(0, row - 3); r <= Math.min(ROWS - 1, row + 3); r++) {
        count = (filledGrid[r][col] === player) ? count + 1 : 0;
        if (count === CONNECT_COUNT) return true;
    }

    // Check diagonal (top-left to bottom-right)
    count = 0;
    for (let i = -3; i <= 3; i++) {
        const r = row + i;
        const c = col + i;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            count = (filledGrid[r][c] === player) ? count + 1 : 0;
            if (count === CONNECT_COUNT) return true;
        }
    }

    // Check diagonal (top-right to bottom-left)
    count = 0;
    for (let i = -3; i <= 3; i++) {
        const r = row + i;
        const c = col - i;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            count = (filledGrid[r][c] === player) ? count + 1 : 0;
            if (count === CONNECT_COUNT) return true;
        }
    }

    return false;
}

function boardFull() {
    return filledGrid.every(row => row.every(cell => cell !== -1));
}

function getAvailableColumns() {
    return filledGrid[0].reduce((availableCols, cell, col) => {
        if (cell === -1) availableCols.push(col);
        return availableCols;
    }, []);
}

function findWinningMove(player) {
    for (let col = 0; col < COLS; col++) {
        const row = findEmptyRow(col);
        if (row !== -1) {
            filledGrid[row][col] = player;
            if (playerWon(row, col)) {
                filledGrid[row][col] = -1;
                return col;
            }
            filledGrid[row][col] = -1;
        }
    }
    return -1;
}

function endGame(winner) {
    gameActive = false;
    if (winner === 0) {
        playerType.textContent = 'Draw!';
    } else {
        playerType.textContent = `Player ${winner} Wins!`;
    }
}

function resetBoard() {
    filledGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
    playerNumber = 1;
    gameActive = true;
    playerType.textContent = 'Player - 1';

    const buttons = document.querySelectorAll('.game-grid .btn');
    buttons.forEach(button => {
        button.classList.remove('player-1', 'player-2', 'drop-animation', 'disabled');
        button.disabled = true;
        
        // Enable only the bottom row buttons
        const row = parseInt(button.dataset.row);
        if (row === ROWS - 1) {
            button.disabled = false;
        }
    });
}

// Initialize the game on page load
initializeGame();