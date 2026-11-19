const HUMAN = "X";
const AI = "O";

let board = ["", "", "", "", "", "", "", "", ""];
let gameOver = false;
let aiTimer = null;

const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");

// Create board
function createBoard() {
    const focusedSquare = document.activeElement?.dataset.square;
    boardDiv.innerHTML = "";

    const suggestion = gameOver || aiTimer !== null ? -1 : findBestMove(HUMAN);

    board.forEach((cell, index) => {
        const div = document.createElement("button");
        div.classList.add("cell");
        div.type = "button";
        div.dataset.square = index;
        div.innerText = cell;
        div.setAttribute("aria-disabled", String(cell !== "" || gameOver || aiTimer !== null));
        const label = `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${cell || "empty"}`;

        // Highlight suggested move
        if (index === suggestion && cell === "" && !gameOver) {
            div.classList.add("suggested");
        }

        div.setAttribute("aria-label", index === suggestion ? `${label}, suggested move` : label);
        div.onclick = () => playerMove(index);
        boardDiv.appendChild(div);
        if (div.dataset.square === focusedSquare) div.focus();
    });
}

// Check winner
function checkWinner(player) {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return winPatterns.some(pattern =>
        pattern.every(i => board[i] === player)
    );
}

// Check draw
function isFull() {
    return board.every(cell => cell !== "");
}

// Minimax
function minimax(isMax) {
    if (checkWinner(AI)) return 10;
    if (checkWinner(HUMAN)) return -10;
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

    if (checkWinner(HUMAN)) {
        gameOver = true;
        createBoard();
        statusText.innerText = "🎉 You Win!";
        return;
    }

    if (isFull()) {
        gameOver = true;
        createBoard();
        statusText.innerText = "Draw!";
        return;
    }

    statusText.innerText = "🤖 AI is thinking...";

    // ⏳ Delay AI move
    aiTimer = setTimeout(() => {
        aiTimer = null;
        const aiMove = findBestMove(AI);
        board[aiMove] = AI;

        if (checkWinner(AI)) {
            gameOver = true;
            createBoard();
            statusText.innerText = "😢 AI Wins!";
            return;
        }

        if (isFull()) {
            gameOver = true;
            createBoard();
            statusText.innerText = "Draw!";
            return;
        }

        statusText.innerText = "Your turn (X)";
        createBoard();
    }, 1000);
    createBoard();
}

// Restart
function resetGame() {
    if (aiTimer !== null) {
        clearTimeout(aiTimer);
        aiTimer = null;
    }
    board = ["", "", "", "", "", "", "", "", ""];
    gameOver = false;
    statusText.innerText = "Your turn (X)";
    createBoard();
}

// Init
resetGame();
