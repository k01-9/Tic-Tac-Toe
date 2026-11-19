const HUMAN = "X";
const AI = "O";

let board = ["", "", "", "", "", "", "", "", ""];
let gameOver = false;

const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");

// Create board
function createBoard() {
    boardDiv.innerHTML = "";

    let suggestion = findBestMove(HUMAN);

    board.forEach((cell, index) => {
        const div = document.createElement("div");
        div.classList.add("cell");
        div.innerText = cell;

        // Highlight suggested move
        if (index === suggestion && cell === "" && !gameOver) {
            div.classList.add("suggested");
        }

        div.onclick = () => playerMove(index);
        boardDiv.appendChild(div);
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
    if (board[index] !== "" || gameOver) return;

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

    createBoard();
    statusText.innerText = "🤖 AI is thinking...";

    // ⏳ Delay AI move
    setTimeout(() => {
        let aiMove = findBestMove(AI);
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

        statusText.innerText = "";
        createBoard();
    }, 1000); // change delay here (1000ms = 1 sec)
}

// Restart
function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameOver = false;
    statusText.innerText = "";
    createBoard();
}

// Init
createBoard();
