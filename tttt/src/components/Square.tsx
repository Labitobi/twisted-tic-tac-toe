import React from "react";

type Player = "X" | "O" | null;

interface SquareProps {
  value: Player;
  onClick: () => void;
  isGhost?: boolean;
  isBlocked?: boolean; // Add isBlocked prop
}

export const Square: React.FC<SquareProps> = ({
  value,
  onClick,
  isGhost,
  isBlocked,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isBlocked}
      className={`w-24 h-24 text-4xl font-bold border border-cyan-600 rounded-md 
      flex items-center justify-center transition-all duration-300 ease-out
      shadow-lg hover:shadow-cyan-500/40
      ${
        isBlocked
          ? "bg-pink-200 opacity-60 cursor-not-allowed"
          : isGhost
          ? "opacity-40 scale-90 text-pink-400"
          : value === "X"
          ? "text-cyan-400"
          : value === "O"
          ? "text-emerald-400"
          : "text-gray-500"
      }`}
    >
      {isBlocked ? "?" : value}
    </button>
  );
};
