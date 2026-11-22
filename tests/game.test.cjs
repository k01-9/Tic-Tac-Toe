const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "../script.js"), "utf8");

function loadGame() {
    const squares = [];
    const status = {};
    const timers = new Map();
    const hints = {
        checked: true,
        addEventListener(type, listener) {
            this[type] = listener;
        }
    };
    const board = {
        appendChild: square => squares.push(square),
        addEventListener(type, listener) {
            this[type] = listener;
        }
    };
    const score = {};
    const elements = { board, status, hints, score };
    const context = vm.createContext({
        document: {
            getElementById: id => elements[id],
            createElement() {
                const classes = new Set();
                const attributes = new Map();
                return {
                    focus() { board.focused = this; },
                    classes,
                    attributes,
                    classList: { toggle: (name, active) => active ? classes.add(name) : classes.delete(name) },
                    setAttribute: (name, value) => attributes.set(name, value)
                };
            }
        },
        setTimeout(callback) {
            const timer = Symbol();
            timers.set(timer, callback);
            return timer;
        },
        clearTimeout: timer => timers.delete(timer)
    });
    vm.runInContext(source, context);
    return { board, squares, status, hints, score, timers, run: code => vm.runInContext(code, context) };
}

test("a pending AI turn locks the board and restart cancels the move", () => {
    const { squares, status, timers, run } = loadGame();
    const firstSquare = squares[0];
    firstSquare.onclick();
    squares[1].onclick();
    assert.equal(firstSquare.textContent, "X");
    assert.equal(squares[1].textContent, "");
    assert.equal(timers.size, 1);

    run("resetGame()");
    assert.equal(timers.size, 0);
    assert.equal(status.innerText, "Your turn (X)");
    assert.equal(squares.length, 9);
    assert.equal(squares[0], firstSquare);
    assert.ok(squares.every(square => square.textContent === ""));
});

test("hints can be disabled and winning squares are labeled until restart", () => {
    const { squares, hints, timers, run } = loadGame();
    assert.equal(squares.filter(square => square.classes.has("suggested")).length, 1);
    hints.checked = false;
    hints.change();
    assert.ok(squares.every(square => !square.classes.has("suggested")));

    run('board = ["O", "O", "", "X", "", "", "X", "", ""];');
    squares[8].onclick();
    const [timer, move] = timers.entries().next().value;
    timers.delete(timer);
    move();
    const winners = squares.filter(square => square.classes.has("winning"));
    assert.deepEqual(winners, squares.slice(0, 3));
    assert.ok(winners.every(square => square.attributes.get("aria-label").endsWith("winning square")));

    run("resetGame()");
    assert.ok(squares.every(square => !square.classes.has("winning")));
    assert.ok(squares.every(square => !square.classes.has("suggested")));
});

test("arrow keys stay within the board and leave other keys alone", () => {
    const { board, squares } = loadGame();
    function press(key, target) {
        let prevented = false;
        board.keydown({ key, target, preventDefault() { prevented = true; } });
        return prevented;
    }

    assert.equal(press("ArrowRight", squares[0]), true);
    assert.equal(board.focused, squares[1]);
    assert.equal(press("ArrowLeft", squares[0]), true);
    assert.equal(board.focused, squares[1]);
    assert.equal(press("Tab", squares[1]), false);
});

test("a completed round is counted once and survives restart", () => {
    const { score, squares, run } = loadGame();
    run('board = ["X", "X", "", "O", "O", "", "", "", ""];');
    squares[2].onclick();
    squares[5].onclick();
    assert.equal(score.textContent, "You: 1 · Computer: 0 · Draws: 0");
    run("resetGame()");
    run('board = ["X", "O", "X", "X", "O", "O", "O", "X", ""];');
    squares[8].onclick();
    assert.equal(score.textContent, "You: 1 · Computer: 0 · Draws: 1");
});

test("a move that completes two winning lines highlights both", () => {
    const { score, squares, run } = loadGame();
    run('board = ["X", "O", "X", "O", "", "O", "X", "O", "X"];');
    squares[4].onclick();
    assert.deepEqual(squares.filter(square => square.classes.has("winning")),
        [squares[0], squares[2], squares[4], squares[6], squares[8]]);
    assert.equal(score.textContent, "You: 1 · Computer: 0 · Draws: 0");
});
