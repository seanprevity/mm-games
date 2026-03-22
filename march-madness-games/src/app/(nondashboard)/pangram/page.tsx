"use client";

import { useMemo, useState } from "react";
import { getPangramGame } from "@/lib/pangram";

export default function PangramPage() {
  const game = useMemo(() => getPangramGame(), []);

  const allLetters = useMemo(
    () => [game.centerLetter, ...game.outerLetters],
    [game],
  );

  const totalPoints = useMemo(
    () => game.words.reduce((sum, w) => sum + w.points, 0),
    [game],
  );

  const [input, setInput] = useState("");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "pangram";
  } | null>(null);

  const score = useMemo(
    () =>
      foundWords.reduce((sum, word) => {
        const match = game.words.find((w) => w.word === word);
        return sum + (match?.points ?? 0);
      }, 0),
    [foundWords, game.words],
  );

  const allFound = foundWords.length === game.words.length;

  function handleLetterClick(letter: string) {
    setInput((prev) => prev + letter);
    setMessage(null);
  }

  function handleDelete() {
    setInput((prev) => prev.slice(0, -1));
    setMessage(null);
  }

  function handleShuffle() {
    // This only visually shuffles — outer letters get randomized in state
    // For simplicity we don't track shuffled order, the letters are just buttons
    setMessage(null);
  }

  function handleSubmit() {
    const word = input.toUpperCase().trim();

    if (word.length < 4) {
      setMessage({ text: "Too short — 4 letters minimum", type: "error" });
      setInput("");
      return;
    }

    if (!word.includes(game.centerLetter)) {
      setMessage({ text: "Must include the center letter", type: "error" });
      setInput("");
      return;
    }

    // Check all letters are valid
    const letterSet = new Set(allLetters);
    for (const char of word) {
      if (!letterSet.has(char)) {
        setMessage({ text: "Uses letters not in the puzzle", type: "error" });
        setInput("");
        return;
      }
    }

    if (foundWords.includes(word)) {
      setMessage({ text: "Already found", type: "error" });
      setInput("");
      return;
    }

    const match = game.words.find((w) => w.word === word);
    if (!match) {
      setMessage({ text: "Not in the word list", type: "error" });
      setInput("");
      return;
    }

    setFoundWords((prev) => [...prev, word]);

    if (match.isPangram) {
      setMessage({
        text: `Pangram! +${match.points} points`,
        type: "pangram",
      });
    } else {
      setMessage({
        text: `Nice! +${match.points} point${match.points === 1 ? "" : "s"}`,
        type: "success",
      });
    }

    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Backspace") {
      handleDelete();
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      const upper = e.key.toUpperCase();
      if (allLetters.includes(upper)) {
        setInput((prev) => prev + upper);
        setMessage(null);
      }
    }
  }

  function resetGame() {
    setInput("");
    setFoundWords([]);
    setMessage(null);
  }

  // Rank thresholds
  function getRank() {
    const pct = totalPoints > 0 ? score / totalPoints : 0;
    if (pct >= 1) return "Queen Bee";
    if (pct >= 0.7) return "Genius";
    if (pct >= 0.5) return "Amazing";
    if (pct >= 0.4) return "Great";
    if (pct >= 0.25) return "Nice";
    if (pct >= 0.15) return "Solid";
    if (pct >= 0.05) return "Good Start";
    return "Beginner";
  }

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-xl space-y-3 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
          March Madness Edition
        </p>
        <h1
          className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {game.title}
        </h1>
        <p className="mx-auto max-w-lg text-sm text-gray-400">
          {game.description}
        </p>
      </section>

      <section className="mx-auto max-w-md space-y-5">
        {/* ── Score Bar ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
              {getRank()}
            </span>
            <span className="text-sm font-bold text-sky-300">
              {score}
              <span className="ml-1 text-[10px] font-semibold text-gray-500">
                / {totalPoints} pts
              </span>
            </span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 transition-all duration-500 ease-out"
              style={{
                width: `${totalPoints > 0 ? Math.min((score / totalPoints) * 100, 100) : 0}%`,
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[9px] font-semibold text-gray-600">
            <span>
              {foundWords.length}/{game.words.length} words
            </span>
            <span>
              {allFound
                ? "All found!"
                : `${game.words.length - foundWords.length} remaining`}
            </span>
          </div>
        </div>

        {/* ── Game Card ───────────────────────────────────────── */}
        <div
          className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-6"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {/* Input display */}
          <div className="mb-5 flex min-h-[44px] items-center justify-center rounded-xl border border-[#1e2a45] bg-[#0f1729] px-4 py-2">
            {input.length > 0 ? (
              <span className="text-xl font-bold tracking-wider text-white">
                {input.split("").map((char, i) => (
                  <span
                    key={i}
                    className={char === game.centerLetter ? "text-sky-300" : ""}
                  >
                    {char}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-sm text-gray-600">
                Type or tap letters…
              </span>
            )}
          </div>

          {/* Message */}
          {message && (
            <p
              className={`mb-4 text-center text-sm font-semibold ${
                message.type === "pangram"
                  ? "text-amber-300"
                  : message.type === "success"
                    ? "text-emerald-400"
                    : "text-red-400"
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Letter honeycomb */}
          <div className="mb-5 flex flex-col items-center gap-2">
            {/* Top row — 3 letters */}
            <div className="flex gap-2">
              {game.outerLetters.slice(0, 3).map((letter) => (
                <button
                  key={`outer-${letter}`}
                  type="button"
                  onClick={() => handleLetterClick(letter)}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#1e2a45] bg-[#0f1729] text-lg font-extrabold text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300 active:scale-95"
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* Middle row — center letter + 2 outer */}
            <div className="flex gap-2">
              <button
                key={`outer-${game.outerLetters[3]}`}
                type="button"
                onClick={() => handleLetterClick(game.outerLetters[3])}
                className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#1e2a45] bg-[#0f1729] text-lg font-extrabold text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300 active:scale-95"
              >
                {game.outerLetters[3]}
              </button>
              <button
                type="button"
                onClick={() => handleLetterClick(game.centerLetter)}
                className="flex h-14 w-14 items-center justify-center rounded-xl border border-sky-400/50 bg-sky-400/15 text-lg font-extrabold text-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.1)] transition hover:bg-sky-400/25 active:scale-95"
              >
                {game.centerLetter}
              </button>
              <button
                key={`outer-${game.outerLetters[4]}`}
                type="button"
                onClick={() => handleLetterClick(game.outerLetters[4])}
                className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#1e2a45] bg-[#0f1729] text-lg font-extrabold text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300 active:scale-95"
              >
                {game.outerLetters[4]}
              </button>
            </div>

            {/* Bottom row — 2 letters */}
            <div className="flex gap-2">
              {game.outerLetters.slice(5).map((letter) => (
                <button
                  key={`outer-${letter}`}
                  type="button"
                  onClick={() => handleLetterClick(letter)}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#1e2a45] bg-[#0f1729] text-lg font-extrabold text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300 active:scale-95"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-[#1e2a45] bg-[#0f1729] px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 transition hover:border-red-400/40 hover:text-red-300"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
            >
              Enter
            </button>
          </div>
        </div>

        {/* ── Found Words ─────────────────────────────────────── */}
        {foundWords.length > 0 && (
          <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-4">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
              Found Words ({foundWords.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {foundWords.map((word) => {
                const match = game.words.find((w) => w.word === word);
                return (
                  <span
                    key={word}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      match?.isPangram
                        ? "border border-amber-400/30 bg-amber-400/10 text-amber-300"
                        : "bg-white/[0.04] text-gray-400"
                    }`}
                  >
                    {word}
                    <span className="ml-1 text-[10px] opacity-50">
                      +{match?.points}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── All Found / Reset ───────────────────────────────── */}
        {allFound && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.06] p-6 text-center">
            <h2
              className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-3xl font-extrabold text-transparent"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Queen Bee!
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              You found all {game.words.length} words for{" "}
              <span className="font-bold text-sky-300">{score}</span> points.
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={resetGame}
            className="text-xs font-semibold uppercase tracking-wider text-gray-600 transition hover:text-sky-300"
          >
            Reset game
          </button>
        </div>
      </section>
    </div>
  );
}
