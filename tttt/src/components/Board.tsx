import React from "react";
import { Square } from "./Square";

type Player = "X" | "O" | null;

export interface BoardProps {
  squares: Player[];
  onPlay: (nextSquares: Player[]) => void;
  onSquareClick: (i: number) => void;
  xIsNext: boolean;
  ghostSquares: number[];
  blockedSquare: number | null;
}

export const Board: React.FC<BoardProps> = ({
  squares,
  onPlay,
  xIsNext,
  ghostSquares,
  blockedSquare,
}) => {
  function handleClick(i: number) {
    if (squares[i] || calculateWinner(squares)) return;
    if (blockedSquare === i) return; // Prevent play on blocked square
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {squares.map((value, i) => (
        <Square
          key={i}
          value={value}
          onClick={() => handleClick(i)}
          isGhost={ghostSquares.includes(i)}
          isBlocked={blockedSquare === i} // Pass blocked info to Square
        />
      ))}
    </div>
  );
};

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
