const HUMAN = "X";
const AI = "O";

let board = ["", "", "", "", "", "", "", "", ""];
let gameOver = false;
let winningSquares = [];
let aiTimer = null;
const score = { human: 0, computer: 0, draws: 0 };

const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
const scoreText = document.getElementById("score");
const hints = document.getElementById("hints");
hints.addEventListener("change", renderBoard);

const squares = board.map((_, index) => {
    const square = document.createElement("button");
    square.className = "cell";
    square.type = "button";
    square.onclick = () => playerMove(index);
    boardDiv.appendChild(square);
    return square;
});

const arrowMoves = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1]
};

boardDiv.addEventListener("keydown", event => {
    const move = arrowMoves[event.key];
    const index = squares.indexOf(event.target);
    if (!Array.isArray(move) || index === -1) return;

    event.preventDefault();
    const row = Math.floor(index / 3) + move[0];
    const column = index % 3 + move[1];
    if (row >= 0 && row < 3 && column >= 0 && column < 3) {
        squares[row * 3 + column].focus();
    }
});

function renderBoard() {
    const suggestion = !hints.checked || gameOver || aiTimer !== null ? -1 : findBestMove(HUMAN);

    squares.forEach((square, index) => {
        const cell = board[index];
        const suggested = index === suggestion;
        const label = `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${cell || "empty"}`;
        square.textContent = cell;
        square.classList.toggle("suggested", suggested);
        square.classList.toggle("winning", winningSquares.includes(index));
        square.setAttribute("aria-disabled", String(cell !== "" || gameOver || aiTimer !== null));
        const annotation = suggested ? ", suggested move" : winningSquares.includes(index) ? ", winning square" : "";
        square.setAttribute("aria-label", label + annotation);
    });
}

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function matchesLine(pattern, player) {
    return pattern.every(index => board[index] === player);
}

function hasWon(player) {
    return winPatterns.some(pattern => matchesLine(pattern, player));
}

// Check draw
function isFull() {
    return board.every(cell => cell !== "");
}

// Minimax
function minimax(isMax, scores) {
    const key = board.map(cell => cell || "-").join("") + (isMax ? AI : HUMAN);
    if (scores.has(key)) return scores.get(key);

    // Empty squares give earlier wins a higher priority without changing the outcome ranking.
    const winValue = 10 + board.filter(cell => cell === "").length;
    if (hasWon(AI)) return winValue;
    if (hasWon(HUMAN)) return -winValue;
    if (isFull()) return 0;

    const player = isMax ? AI : HUMAN;
    let best = isMax ? -Infinity : Infinity;
    for (let index = 0; index < board.length; index++) {
        if (board[index] !== "") continue;
        board[index] = player;
        const score = minimax(!isMax, scores);
        board[index] = "";
        best = isMax ? Math.max(best, score) : Math.min(best, score);
    }

    scores.set(key, best);
    return best;
}

// Find best move
function findBestMove(player) {
    const scores = new Map();
    let bestVal = (player === AI) ? -Infinity : Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = player;

            let moveVal = minimax(player !== AI, scores);

            board[i] = "";

            if (player === AI && moveVal > bestVal) {
                bestVal = moveVal;
                move = i;
            }

            if (player === HUMAN && moveVal < bestVal) {
                bestVal = moveVal;
                move = i;
            }
        }
    }
    return move;
}

function renderScore() {
    scoreText.textContent = `You: ${score.human} · Computer: ${score.computer} · Draws: ${score.draws}`;
}

document.getElementById("reset-score").addEventListener("click", () => {
    score.human = 0;
    score.computer = 0;
    score.draws = 0;
    renderScore();
});

function finishRound(result, message, winner) {
    gameOver = true;
    winningSquares = winner
        ? winPatterns.filter(pattern => matchesLine(pattern, winner)).flat()
        : [];
    score[result]++;
    renderScore();
    statusText.innerText = message;
    renderBoard();
}

// Player move
function playerMove(index) {
    if (board[index] !== "" || gameOver || aiTimer !== null) return;

    board[index] = HUMAN;

    if (hasWon(HUMAN)) {
        finishRound("human", "🎉 You Win!", HUMAN);
        return;
    }

    if (isFull()) {
        finishRound("draws", "Draw!");
        return;
    }

    statusText.innerText = "🤖 AI is thinking...";

    // ⏳ Delay AI move
    aiTimer = setTimeout(() => {
        aiTimer = null;
        const aiMove = findBestMove(AI);
        board[aiMove] = AI;

        if (hasWon(AI)) {
            finishRound("computer", "😢 AI Wins!", AI);
            return;
        }

        if (isFull()) {
            finishRound("draws", "Draw!");
            return;
        }

        statusText.innerText = "Your turn (X)";
        renderBoard();
    }, 1000);
    renderBoard();
}

// Restart
function resetGame() {
    if (aiTimer !== null) {
        clearTimeout(aiTimer);
        aiTimer = null;
    }
    board = ["", "", "", "", "", "", "", "", ""];
    gameOver = false;
    winningSquares = [];
    statusText.innerText = "Your turn (X)";
    renderBoard();
}

// Init
resetGame();
