console.log("Welcome to Enhanced Tic Tac Toe!");

// --- Game State ---
let currentPlayer = "X";
let board = Array(9).fill(null);
let gameOver = false;
let players = {
    X: { name: "Player X", score: 0, symbol: "X" },
    O: { name: "Player O", score: 0, symbol: "O" }
};
let gameMode = "human"; // Default to human vs. human; can be "human-ai"
let aiDifficulty = "easy"; // Can be "easy", "medium", "hard"
let gameHistory = []; // Store past game boards and winners
let moveHistory = []; // Store the sequence of moves in the current game

// --- DOM Elements (Cached for Efficiency) ---
const infoDisplay = document.querySelector('.info');
const boardElement = document.querySelector('.board'); // Assuming a container for the cells
const cells = document.querySelectorAll('.cell'); // Assuming each cell has class 'cell'
const resetButton = document.querySelector('#resetButton'); // Button to reset the current game
const newGameButton = document.querySelector('#newGameButton'); // Button to start a new game (resets scores)
const modeSelect = document.querySelector('#modeSelect'); // Dropdown to select game mode
const difficultySelect = document.querySelector('#difficultySelect'); // Dropdown for AI difficulty
const playerXNameInput = document.querySelector('#playerXName');
const playerONameInput = document.querySelector('#playerOName');
const scoreDisplayX = document.querySelector('#scoreX');
const scoreDisplayO = document.querySelector('#scoreO');
const historyList = document.querySelector('#gameHistory'); // To display game history

// --- Configuration ---
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// --- Core Game Logic ---

function checkWin() {
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameOver = true;
            highlightWinningCells(combo);
            updateInfo(`${players[currentPlayer].name} wins!`);
            updateScore(currentPlayer);
            saveGameToHistory(board, currentPlayer);
            return true;
        }
    }
    return false;
}

function checkDraw() {
    if (!board.includes(null) && !gameOver) {
        gameOver = true;
        updateInfo("It's a Draw!");
        saveGameToHistory(board, null); // Null indicates a draw
        return true;
    }
    return false;
}

function handleClick(event) {
    if (gameOver || (gameMode === "human-ai" && currentPlayer === "O")) return; // AI's turn

    const cell = event.target;
    const index = parseInt(cell.dataset.index);

    if (board[index] === null) {
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer);
        moveHistory.push({ player: currentPlayer, index });

        if (!checkWin()) {
            if (!checkDraw()) {
                switchPlayer();
                if (gameMode === "human-ai" && currentPlayer === "O") {
                    setTimeout(makeAIMove, 500); // Add a slight delay for AI move
                }
            }
        }
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateInfo(`${players[currentPlayer].name}'s turn`);
}

function resetGame() {
    board.fill(null);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove("X", "O", "winner");
    });
    gameOver = false;
    currentPlayer = "X";
    moveHistory = [];
    updateInfo(`${players[currentPlayer].name}'s turn`);
}

function startNewGame() {
    resetGame();
    players.X.score = 0;
    players.O.score = 0;
    updateScoreDisplay();
    gameHistory = [];
    updateGameHistoryDisplay();
    updatePlayerNames(); // Ensure names are updated at the start of a new game
}

function updateScore(winner) {
    if (winner) {
        players[winner].score++;
        updateScoreDisplay();
    }
}

function updateScoreDisplay() {
    if (scoreDisplayX) scoreDisplayX.textContent = players.X.score;
    if (scoreDisplayO) scoreDisplayO.textContent = players.O.score;
}

function updateInfo(message) {
    if (infoDisplay) infoDisplay.textContent = message;
}

function highlightWinningCells(combo) {
    combo.forEach(index => cells[index].classList.add('winner'));
}

// --- AI Logic ---

function makeAIMove() {
    if (gameOver) return;

    let bestMove;
    switch (aiDifficulty) {
        case "easy":
            bestMove = findRandomEmptyCell();
            break;
        case "medium":
            bestMove = findBestMoveMinimax(board, "O").index;
            break;
        case "hard":
            bestMove = findBestMoveMinimax(board, "O").index; // Minimax is generally "hard"
            break;
        default:
            bestMove = findRandomEmptyCell();
            break;
    }

    if (bestMove !== undefined && board[bestMove] === null) {
        board[bestMove] = "O";
        cells[bestMove].textContent = "O";
        cells[bestMove].classList.add("O");
        moveHistory.push({ player: "O", index: bestMove });

        if (!checkWin()) {
            if (!checkDraw()) {
                switchPlayer();
            }
        }
    }
}

function findRandomEmptyCell() {
    const emptyCells = board.reduce((acc, val, index) => (val === null ? [...acc, index] : acc), []);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Minimax Algorithm (for medium and hard AI)
function findBestMoveMinimax(currentBoard, player) {
    const availableSpots = currentBoard.reduce((acc, val, index) => (val === null ? [...acc, index] : acc), []);

    if (checkWinForMinimax(currentBoard, "X")) {
        return { score: -10 };
    } else if (checkWinForMinimax(currentBoard, "O")) {
        return { score: 10 };
    } else if (availableSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        currentBoard[availableSpots[i]] = player;

        if (player === "O") {
            const result = findBestMoveMinimax(currentBoard, "X");
            move.score = result.score;
        } else {
            const result = findBestMoveMinimax(currentBoard, "O");
            move.score = result.score;
        }
        currentBoard[availableSpots[i]] = null; // Reset the board

        moves.push(move);
    }

    let bestMove;
    if (player === "O") {
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

function checkWinForMinimax(boardToCheck, player) {
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (boardToCheck[a] === player && boardToCheck[b] === player && boardToCheck[c] === player) {
            return true;
        }
    }
    return false;
}

// --- Game History ---

function saveGameToHistory(finalBoard, winner) {
    gameHistory.push({ board: [...finalBoard], winner: winner ? players[winner].name : "Draw" });
    updateGameHistoryDisplay();
}

function updateGameHistoryDisplay() {
    if (historyList) {
        historyList.innerHTML = ''; // Clear previous history
        gameHistory.forEach((game, index) => {
            const listItem = document.createElement('li');
            const winnerText = game.winner === "Draw" ? "Draw" : `Winner: ${game.winner}`;
            listItem.textContent = `Game ${index + 1}: ${winnerText} - Board: ${game.board.join(', ')}`;
            historyList.appendChild(listItem);
        });
    }
}

// --- Player Name Management ---

function updatePlayerNames() {
    if (playerXNameInput && playerONameInput) {
        players.X.name = playerXNameInput.value.trim() || "Player X";
        players.O.name = playerONameInput.value.trim() || "Player O";
        updateInfo(`${players[currentPlayer].name}'s turn`);
    }
    updateScoreDisplay(); // Update display in case names changed during a game
}

// --- Event Listeners ---

cells.forEach(cell => {
    cell.addEventListener('click', handleClick);
});

if (resetButton) {
    resetButton.addEventListener('click', resetGame);
}

if (newGameButton) {
    newGameButton.addEventListener('click', startNewGame);
}

if (modeSelect) {
    modeSelect.addEventListener('change', (event) => {
        gameMode = event.target.value;
        if (gameMode === "human-ai" && currentPlayer === "O" && !gameOver) {
            setTimeout(makeAIMove, 500);
        }
        // Optionally disable/enable player O name input based on game mode
        if (playerONameInput) {
            playerONameInput.disabled = (gameMode === "human-ai");
            if (gameMode === "human-ai") {
                playerONameInput.value = "AI";
                players.O.name = "AI";
            } else if (players.O.name === "AI") {
                playerONameInput.value = "Player O";
                players.O.name = "Player O";
            }
        }
        resetGame(); // Reset the board when the mode changes
    });
}

if (difficultySelect) {
    difficultySelect.addEventListener('change', (event) => {
        aiDifficulty = event.target.value;
        resetGame(); // Reset the board when difficulty changes
        if (gameMode === "human-ai" && currentPlayer === "O" && !gameOver) {
            setTimeout(makeAIMove, 500);
        }
    });
}

if (playerXNameInput && playerONameInput) {
    playerXNameInput.addEventListener('blur', updatePlayerNames);
    playerONameInput.addEventListener('blur', updatePlayerNames);
}

// --- Initialization ---
updateInfo(`${players[currentPlayer].name}'s turn`);
updateScoreDisplay();
updateGameHistoryDisplay();
if (playerONameInput && gameMode === "human-ai") {
    playerONameInput.disabled = true;
    playerONameInput.value = "AI";
    players.O.name = "AI";
}
