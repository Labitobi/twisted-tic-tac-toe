import React, { useState, useEffect } from "react";
import { Board } from "./Board";

type Player = "X" | "O" | null;

export const Game: React.FC = () => {
  const [history, setHistory] = useState<Player[][]>([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [hasTimeShifted, setHasTimeShifted] = useState<{
    X: boolean;
    O: boolean;
  }>({
    X: false,
    O: false,
  });

  const [ghostSquares, setGhostSquares] = useState<number[]>([]);
  const [rippleActive, setRippleActive] = useState(false);

  // Fun twist: Random "Bonus Turn" after each move (10% chance)
  const [bonusTurn, setBonusTurn] = useState<null | Player>(null);

  // Fun twist: "Mystery Square" - one random empty square becomes blocked after reset
  const [mysteryBoxEnabled, setMysteryBoxEnabled] = useState(true);
  const [blockedSquare, setBlockedSquare] = useState<number | null>(null);

  // AI toggle: true = play against AI (AI is "O")
  const [aiEnabled, setAiEnabled] = useState(true);

  const currentSquares = history[currentMove];
  const winner = calculateWinner(currentSquares);

  function handlePlay(nextSquares: Player[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    // Random bonus turn (10% chance)
    if (Math.random() < 0.1 && !winner && !isDraw(nextSquares)) {
      setBonusTurn(xIsNext ? "X" : "O");
      // Don't switch player
    } else {
      setBonusTurn(null);
      setXIsNext(!xIsNext);
    }
  }

  function handleTimeShift(turnsBack: number) {
    const player = xIsNext ? "X" : "O";
    if (hasTimeShifted[player]) return; // Already used

    const newIndex = Math.max(0, currentMove - turnsBack);
    const oldSquares = history[currentMove];
    const newSquares = history[newIndex];
    const erased: number[] = [];

    oldSquares.forEach((val, i) => {
      if (val && val !== newSquares[i]) erased.push(i);
    });

    // Activate ripple + ghosts
    setGhostSquares(erased);
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 800);
    setTimeout(() => setGhostSquares([]), 1000);

    // Apply rewind
    setCurrentMove(newIndex);
    setHistory(history.slice(0, newIndex + 1));
    setHasTimeShifted((prev) => ({ ...prev, [player]: true }));
  }

  function handleReset() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setXIsNext(true);
    setHasTimeShifted({ X: false, O: false });
    setGhostSquares([]);
    setRippleActive(false);
    setBonusTurn(null);

    // Only block a random square if enabled
    if (mysteryBoxEnabled) {
      const randomIndex = Math.floor(Math.random() * 9);
      setBlockedSquare(randomIndex);
    } else {
      setBlockedSquare(null);
    }
  }

  // Prevent play on blocked square
  function handleSquareClick(i: number) {
    // Only block if mystery box is enabled and blockedSquare is set
    if (mysteryBoxEnabled && blockedSquare === i) return;
    if (currentSquares[i] || winner || isDraw(currentSquares)) return;
    const nextSquares = currentSquares.slice();
    nextSquares[i] = bonusTurn ? bonusTurn : xIsNext ? "X" : "O";
    handlePlay(nextSquares);
  }

  // --- AI Logic ---
  useEffect(() => {
    // AI plays as "O"
    const aiShouldPlay =
      aiEnabled &&
      !winner &&
      !isDraw(currentSquares) &&
      ((!xIsNext && !bonusTurn) || // Normal turn
        bonusTurn === "O"); // Bonus turn for AI

    if (aiShouldPlay) {
      const aiMove = getAIMove(currentSquares, blockedSquare);
      if (aiMove !== null) {
        setTimeout(() => handleSquareClick(aiMove), 600); // Delay for realism
      }
    }
  }, [aiEnabled, xIsNext, currentSquares, winner, bonusTurn, blockedSquare]);

  const status = winner
    ? `Winner: ${winner}`
    : isDraw(currentSquares)
    ? "Draw!"
    : `Next player: ${xIsNext ? "X" : "O"}`;

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen text-white transition-all duration-700 ${
        rippleActive ? "animate-ripple" : ""
      }`}
    >
      <h1 className="text-4xl font-extrabold mb-4 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        Time-Shift Tic-Tac-Toe
      </h1>
      <p className="text-lg mb-6 opacity-90">{status}</p>

      <Board
        squares={currentSquares}
        onPlay={(nextSquares) => handlePlay(nextSquares)}
        onSquareClick={handleSquareClick}
        xIsNext={bonusTurn ? bonusTurn === "X" : xIsNext}
        ghostSquares={ghostSquares}
        blockedSquare={mysteryBoxEnabled ? blockedSquare : null} // Only pass if enabled
      />

      {bonusTurn && (
        <div className="mt-4 text-yellow-300 font-bold animate-pulse">
          🎉 Bonus Turn for {bonusTurn}!
        </div>
      )}
      {blockedSquare !== null && mysteryBoxEnabled && (
        <div className="mt-2 text-pink-300 font-semibold">
          Mystery Square: {blockedSquare + 1} is blocked!
        </div>
      )}

      <div className="flex gap-4 mt-10 re">
        <button
          onClick={() => handleTimeShift(1)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition"
        >
          ⏪ Rewind 1x
        </button>
        <button
          onClick={() => handleTimeShift(2)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition"
        >
          ⏪ Rewind 2x
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
        >
          🔄 Reset
        </button>
      </div>
      <div className="mt-6 flex gap-6 items-center">
        <label>
          <span className="mr-2">Play against AI:</span>
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={() => setAiEnabled((v) => !v)}
          />
        </label>
        <label>
          <span className="mr-2">Mystery Box:</span>
          <input
            type="checkbox"
            checked={mysteryBoxEnabled}
            onChange={() => setMysteryBoxEnabled((v) => !v)}
          />
        </label>
      </div>
    </div>
  );
};

// Smarter AI: Minimax algorithm for Tic-Tac-Toe
function getAIMove(
  squares: Player[],
  blockedSquare: number | null
): number | null {
  // Only play if there are moves left
  const availableMoves = squares
    .map((v, i) => (!v && blockedSquare !== i ? i : null))
    .filter((v) => v !== null) as number[];
  if (availableMoves.length === 0) return null;

  // Minimax helper
  function minimax(
    board: Player[],
    depth: number,
    isMaximizing: boolean
  ): number {
    const winner = calculateWinner(board);
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (isDraw(board)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i] && blockedSquare !== i) {
          board[i] = "O";
          const score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i] && blockedSquare !== i) {
          board[i] = "X";
          const score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  // Find the best move
  let bestScore = -Infinity;
  let move: number | null = null;
  for (const i of availableMoves) {
    const testBoard = squares.slice();
    testBoard[i] = "O";
    const score = minimax(testBoard, 0, false);
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
}

function calculateWinner(squares: Player[]): Player {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function isDraw(squares: Player[]): boolean {
  return squares.every((sq) => sq !== null) && !calculateWinner(squares);
}
