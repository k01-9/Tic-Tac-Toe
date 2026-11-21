const HUMAN = "X";
const AI = "O";

let board = ["", "", "", "", "", "", "", "", ""];
let gameOver = false;
let winningSquares = [];
let aiTimer = null;

const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
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

function findWinningSquares(player) {
    return winPatterns.find(pattern => pattern.every(index => board[index] === player));
}

// Check draw
function isFull() {
    return board.every(cell => cell !== "");
}

// Minimax
function minimax(isMax) {
    if (findWinningSquares(AI)) return 10;
    if (findWinningSquares(HUMAN)) return -10;
    if (isFull()) return 0;

    if (isMax) {
        let best = -Infinity;

        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = AI;
                best = Math.max(best, minimax(false));
                board[i] = "";
            }
        }
        return best;
    } else {
        let best = Infinity;

        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = HUMAN;
                best = Math.min(best, minimax(true));
                board[i] = "";
            }
        }
        return best;
    }
}

// Find best move
function findBestMove(player) {
    let bestVal = (player === AI) ? -Infinity : Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = player;

            let moveVal = minimax(player !== AI);

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

// Player move
function playerMove(index) {
    if (board[index] !== "" || gameOver || aiTimer !== null) return;

    board[index] = HUMAN;

    const humanWin = findWinningSquares(HUMAN);
    if (humanWin) {
        winningSquares = humanWin;
        gameOver = true;
        renderBoard();
        statusText.innerText = "🎉 You Win!";
        return;
    }

    if (isFull()) {
        gameOver = true;
        renderBoard();
        statusText.innerText = "Draw!";
        return;
    }

    statusText.innerText = "🤖 AI is thinking...";

    // ⏳ Delay AI move
    aiTimer = setTimeout(() => {
        aiTimer = null;
        const aiMove = findBestMove(AI);
        board[aiMove] = AI;

        const aiWin = findWinningSquares(AI);
        if (aiWin) {
            winningSquares = aiWin;
            gameOver = true;
            renderBoard();
            statusText.innerText = "😢 AI Wins!";
            return;
        }

        if (isFull()) {
            gameOver = true;
            renderBoard();
            statusText.innerText = "Draw!";
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
