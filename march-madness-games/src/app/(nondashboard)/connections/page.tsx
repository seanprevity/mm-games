"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getConnectionsGame,
  type ConnectionsTile,
  shuffleArray,
} from "@/lib/connections";

interface SolvedGroup {
  name: string;
  items: string[];
  revealed: string[];
  difficulty: string;
}

const DIFFICULTY_COLORS: Record<
  string,
  { border: string; bg: string; title: string; text: string }
> = {
  "1": {
    border: "border-yellow-300",
    bg: "bg-yellow-100",
    title: "text-yellow-900",
    text: "text-yellow-800/70",
  },
  "2": {
    border: "border-green-300",
    bg: "bg-green-100",
    title: "text-green-900",
    text: "text-green-800/70",
  },
  "3": {
    border: "border-sky-300",
    bg: "bg-sky-100",
    title: "text-sky-900",
    text: "text-sky-800/70",
  },
  "4": {
    border: "border-purple-300",
    bg: "bg-purple-100",
    title: "text-purple-900",
    text: "text-purple-800/70",
  },
};

function MistakeDots({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Mistakes left
      </span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const isUsed = i >= remaining;

          return (
            <div
              key={i}
              // ORIG: isUsed ? "bg-gray-300" : "bg-black"
              className={`h-2.5 w-2.5 rounded-full transition ${
                isUsed ? "bg-white/10" : "bg-sky-400"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const game = useMemo(() => getConnectionsGame(), []);

  const initialTiles = useMemo<ConnectionsTile[]>(() => {
    return game.categories.flatMap((category) =>
      category.items.map((item) => ({
        id: `${category.name}-${item}`,
        value: item,
        categoryName: category.name,
        difficulty: category.difficulty,
      })),
    );
  }, [game]);

  const [tiles, setTiles] = useState<ConnectionsTile[]>(initialTiles);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<SolvedGroup[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("");
  const [isRevealingAnswers, setIsRevealingAnswers] = useState(false);

  useEffect(() => {
    setTiles(shuffleArray(initialTiles));
  }, [initialTiles]);

  const mistakesRemaining = Math.max(0, game.mistakesAllowed - mistakes);
  const isGameWon = solvedGroups.length === game.categories.length;
  const isGameLost = mistakes >= game.mistakesAllowed;

  const activeTiles = tiles.filter(
    (tile) => !solvedGroups.some((group) => group.name === tile.categoryName),
  );

  function revealRemainingAnswers() {
    const remainingCategories = game.categories.filter(
      (category) => !solvedGroups.some((group) => group.name === category.name),
    );

    if (remainingCategories.length === 0) {
      setMessage("Game over.");
      return;
    }

    setIsRevealingAnswers(true);
    setSelectedTiles([]);
    setMessage("No mistakes remaining. Revealing the answers...");

    remainingCategories.forEach((category, index) => {
      window.setTimeout(
        () => {
          setSolvedGroups((prev) => [
            ...prev,
            {
              name: category.name,
              items: [...category.items],
              revealed: category.revealed ?? [...category.items],
              difficulty: category.difficulty,
            },
          ]);
        },
        700 * (index + 1),
      );
    });

    window.setTimeout(
      () => {
        setMessage("Game over.");
        setIsRevealingAnswers(false);
      },
      700 * remainingCategories.length + 200,
    );
  }

  function toggleTile(tileId: string) {
    if (isGameWon || isGameLost || isRevealingAnswers) return;

    setMessage("");

    setSelectedTiles((prev) => {
      if (prev.includes(tileId)) {
        return prev.filter((id) => id !== tileId);
      }

      if (prev.length === 4) {
        return prev;
      }

      return [...prev, tileId];
    });
  }

  function submitSelection() {
    if (
      selectedTiles.length !== 4 ||
      isGameWon ||
      isGameLost ||
      isRevealingAnswers
    ) {
      return;
    }

    const chosenTiles = tiles.filter((tile) => selectedTiles.includes(tile.id));
    const firstCategory = chosenTiles[0]?.categoryName;
    const allSameCategory = chosenTiles.every(
      (tile) => tile.categoryName === firstCategory,
    );

    if (allSameCategory && firstCategory) {
      const category = game.categories.find((c) => c.name === firstCategory);
      setSolvedGroups((prev) => [
        ...prev,
        {
          name: firstCategory,
          items: chosenTiles.map((tile) => tile.value),
          revealed: category?.revealed ?? chosenTiles.map((tile) => tile.value),
          difficulty: chosenTiles[0].difficulty,
        },
      ]);
      setSelectedTiles([]);
      return;
    }

    const nextMistakes = mistakes + 1;
    setMistakes(nextMistakes);
    setSelectedTiles([]);
    setMessage("Not quite right.");

    if (nextMistakes >= game.mistakesAllowed) {
      revealRemainingAnswers();
    }
  }

  function shuffleRemainingTiles() {
    if (isGameWon || isGameLost || isRevealingAnswers) return;

    const shuffledUnsolved = shuffleArray(activeTiles);

    const solvedTileIds = new Set(
      tiles
        .filter((tile) =>
          solvedGroups.some((group) => group.name === tile.categoryName),
        )
        .map((tile) => tile.id),
    );

    const solvedTiles = tiles.filter((tile) => solvedTileIds.has(tile.id));
    setTiles([...solvedTiles, ...shuffledUnsolved]);
  }

  function clearSelection() {
    if (isGameWon || isGameLost || isRevealingAnswers) return;
    setSelectedTiles([]);
    setMessage("");
  }

  function resetGame() {
    setTiles(shuffleArray(initialTiles));
    setSelectedTiles([]);
    setSolvedGroups([]);
    setMistakes(0);
    setMessage("");
    setIsRevealingAnswers(false);
  }

  return (
    // ORIG: <div className="flex flex-col items-center space-y-8">
    <div className="flex flex-col items-center space-y-8">
      {/* ── Header ────────────────────────────────────────────────── */}
      {/* ORIG: <section className="space-y-2 text-center"> */}
      <section className="space-y-3 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
          March Madness Edition
        </p>
        {/* ORIG: text-3xl font-bold */}
        <h1
          className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {game.title}
        </h1>
        {/* ORIG: text-gray-600 */}
        <p className="mx-auto max-w-md text-sm text-gray-400">
          {game.description}
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  TILE BOARD — white container like crossword              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-4">
        {/* ── Solved groups ───────────────────────────────────── */}
        {solvedGroups.length > 0 && (
          <div className="mb-2 space-y-2">
            {solvedGroups.map((group, index) => {
              const colors =
                DIFFICULTY_COLORS[group.difficulty] ?? DIFFICULTY_COLORS["1"];
              return (
                <div
                  key={`${group.name}-${index}`}
                  className={`rounded-lg border px-4 py-3 text-center transition-all duration-500 ease-out ${colors.border} ${colors.bg}`}
                >
                  <p className={`text-sm font-semibold ${colors.title}`}>
                    {group.name}
                  </p>
                  <p className={`text-sm ${colors.text}`}>
                    {group.revealed.join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Active tiles grid ──────────────────────────────── */}
        {/* ORIG: grid grid-cols-2 gap-2 sm:grid-cols-4 */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {activeTiles.map((tile) => {
            const isSelected = selectedTiles.includes(tile.id);

            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => toggleTile(tile.id)}
                // ORIG selected: bg-gray-800 text-white
                // ORIG default: border border-gray-200 bg-gray-100 text-black hover:bg-gray-200
                className={`h-16 rounded-lg text-sm font-semibold transition duration-150 hover:cursor-pointer active:scale-[0.97] sm:h-18 ${
                  isSelected
                    ? "bg-gray-700 text-white shadow-md shadow-gray-600/20"
                    : "border border-gray-200 bg-gray-50 text-black hover:bg-gray-100"
                }`}
              >
                {tile.value}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Message ───────────────────────────────────────────── */}
      {/* ORIG: text-sm text-gray-600 */}
      {message && (
        <p
          className={`text-sm font-semibold ${
            message === "Game over." || message.startsWith("No mistakes")
              ? "text-sky-300"
              : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}

      {/* ── Action Buttons ────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-3">
        {/* ORIG: rounded-full bg-black px-6 py-2 text-white */}
        <button
          type="button"
          onClick={submitSelection}
          disabled={
            selectedTiles.length !== 4 ||
            isGameWon ||
            isGameLost ||
            isRevealingAnswers
          }
          className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:cursor-pointer hover:shadow-sky-400/30 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
        >
          Submit
        </button>

        {/* ORIG: rounded-full border border-gray-300 px-6 py-2 text-black */}
        <button
          type="button"
          onClick={shuffleRemainingTiles}
          disabled={isGameWon || isGameLost || isRevealingAnswers}
          className="rounded-full border border-[#1e2a45] bg-white/[0.04] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-300 transition hover:cursor-pointer hover:border-sky-400/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Shuffle
        </button>

        <button
          type="button"
          onClick={clearSelection}
          disabled={
            selectedTiles.length === 0 ||
            isGameWon ||
            isGameLost ||
            isRevealingAnswers
          }
          className="rounded-full border border-[#1e2a45] bg-white/[0.04] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-300 transition hover:cursor-pointer hover:border-sky-400/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Deselect
        </button>
      </div>

      {/* ── Mistake Dots ──────────────────────────────────────── */}
      {/* ORIG: flex flex-col items-center gap-2 */}
      <div className="flex flex-col items-center gap-1">
        <MistakeDots
          remaining={mistakesRemaining}
          total={game.mistakesAllowed}
        />
      </div>

      {/* ── Reset link ────────────────────────────────────────── */}
      {/* ORIG: text-sm text-gray-400 hover:text-gray-600 */}
      <button
        type="button"
        onClick={resetGame}
        className="text-xs font-semibold uppercase tracking-wider text-gray-600 transition hover:text-sky-300"
      >
        Reset game
      </button>
    </div>
  );
}
