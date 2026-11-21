# Tic-Tac-Toe
A browser-based Tic Tac Toe game built with plain HTML, CSS, and JavaScript — no frameworks or dependencies. The AI opponent uses the minimax algorithm to play a perfect (unbeatable) game. As a bonus, the board also highlights the human player's optimal move in real time by running minimax from their perspective too.

## Run locally

Open `index.html` in a browser. The game runs offline and has no build step.

You play as **X** and the computer plays as **O**. Select an empty square with a click, or use Tab to focus it and press Enter or Space. Arrow keys move focus between squares. The highlighted square is the suggested move. Clear **Show move hints** to play without suggestions. Select **Restart** to clear the board at any time.

## Run the tests

With Node.js installed, run `node --test tests/game.test.cjs` from the repository root.
