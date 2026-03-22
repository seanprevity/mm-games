"use client";

import { useMemo, useState } from "react";
import { getFifteenWordsGame } from "@/lib/fifteen";

function normalizeGuess(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, "");
}

function HintBudgetBar({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
          Hint Budget
        </span>
        <span className="text-sm font-bold text-sky-300">
          {remaining}
          <span className="ml-1 text-[10px] font-semibold text-gray-500">
            / {total} remaining
          </span>
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 transition-all duration-500 ease-out"
          style={{ width: `${(remaining / total) * 100}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[9px] font-semibold text-gray-600">
        <span>0</span>
        <span>{Math.round(total / 2)}</span>
        <span>{total}</span>
      </div>
    </div>
  );
}

export default function FifteenWordsPage() {
  const game = useMemo(() => getFifteenWordsGame(), []);

  // First hint is auto-revealed, so start at 1 and count it in the budget
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [hintsUsedTotal, setHintsUsedTotal] = useState(1);
  const [hintsRevealedForCurrent, setHintsRevealedForCurrent] = useState(1);
  const [correctWords, setCorrectWords] = useState<number[]>([]);
  const [skippedWords, setSkippedWords] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [mustSkip, setMustSkip] = useState(false);

  const currentWord = game.words[currentWordIndex] ?? null;
  const hintsRemaining = game.totalHintBudget - hintsUsedTotal;
  const isLastWord = currentWordIndex === game.words.length - 1;
  const currentWordSolved = currentWord
    ? correctWords.includes(currentWord.id)
    : false;
  const currentWordSkipped = currentWord
    ? skippedWords.includes(currentWord.id)
    : false;
  const roundFinished = currentWordSolved || currentWordSkipped;

  const allHintsRevealed = currentWord
    ? hintsRevealedForCurrent >= currentWord.hints.length
    : false;

  const canRevealMore =
    !roundFinished &&
    !mustSkip &&
    hintsRemaining > 0 &&
    currentWord !== null &&
    hintsRevealedForCurrent < currentWord.hints.length;

  function handleRevealHint() {
    if (!canRevealMore || !currentWord) return;
    const newRevealed = hintsRevealedForCurrent + 1;
    setHintsRevealedForCurrent(newRevealed);
    setHintsUsedTotal((prev) => prev + 1);
    setMessage("");
  }

  function handleSubmitGuess() {
    if (!guess.trim() || !currentWord || roundFinished || mustSkip) return;

    const normalizedGuess = normalizeGuess(guess);
    const normalizedAnswer = normalizeGuess(currentWord.answer);

    if (normalizedGuess === normalizedAnswer) {
      setCorrectWords((prev) => [...prev, currentWord.id]);
      setMessage("");
      setGuess("");
      setMustSkip(false);

      if (isLastWord) {
        setGameOver(true);
      }
    } else {
      // Wrong guess — auto-reveal next hint if available
      const canReveal =
        hintsRevealedForCurrent < currentWord.hints.length &&
        hintsRemaining > 0;

      if (canReveal) {
        const newRevealed = hintsRevealedForCurrent + 1;
        setHintsRevealedForCurrent(newRevealed);
        setHintsUsedTotal((prev) => prev + 1);

        const allUsedAfter = newRevealed >= currentWord.hints.length;
        if (allUsedAfter) {
          setMessage(
            "Incorrect — all hints revealed. You must skip this word.",
          );
          setMustSkip(true);
        } else {
          setMessage("Incorrect — a new hint has been revealed.");
        }
      } else {
        // No more hints to reveal
        setMessage("Incorrect — no hints left. You must skip this word.");
        setMustSkip(true);
      }
      setGuess("");
    }
  }

  function handleSkip() {
    if (!currentWord || roundFinished) return;
    setSkippedWords((prev) => [...prev, currentWord.id]);
    setMessage("");
    setGuess("");
    setMustSkip(false);

    if (isLastWord) {
      setGameOver(true);
    }
  }

  function handleNextWord() {
    if (!roundFinished || isLastWord) return;
    setCurrentWordIndex((prev) => prev + 1);
    // Always auto-reveal first hint for the new word
    setHintsRevealedForCurrent(1);
    setHintsUsedTotal((prev) => Math.min(prev + 1, game.totalHintBudget));
    setMessage("");
    setGuess("");
    setMustSkip(false);
  }

  function resetGame() {
    setCurrentWordIndex(0);
    setGuess("");
    setHintsUsedTotal(1);
    setHintsRevealedForCurrent(1);
    setCorrectWords([]);
    setSkippedWords([]);
    setMessage("");
    setGameOver(false);
    setMustSkip(false);
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

      <section className="mx-auto max-w-xl space-y-5">
        {/* ── Hint Budget Bar ──────────────────────────────────── */}
        <HintBudgetBar
          remaining={hintsRemaining}
          total={game.totalHintBudget}
        />

        {/* ── Score Strip ──────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Word
            </p>
            <p className="text-lg font-extrabold text-white">
              {currentWordIndex + 1}
              <span className="text-gray-500">/{game.words.length}</span>
            </p>
          </div>
          <div className="h-8 w-px bg-[#1e2a45]" />
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Correct
            </p>
            <p className="text-lg font-extrabold text-emerald-400">
              {correctWords.length}
            </p>
          </div>
          <div className="h-8 w-px bg-[#1e2a45]" />
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Skipped
            </p>
            <p className="text-lg font-extrabold text-red-400">
              {skippedWords.length}
            </p>
          </div>
        </div>

        {!gameOver && currentWord ? (
          <>
            {/* ── Word Card ──────────────────────────────────── */}
            <div
              className={`rounded-2xl border p-6 transition ${
                currentWordSolved
                  ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                  : currentWordSkipped
                    ? "border-red-500/30 bg-red-500/[0.04]"
                    : "border-[#1e2a45] bg-[#111827]"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                  Word {currentWordIndex + 1}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Hints shown
                  </span>
                  <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-xs font-bold text-sky-300">
                    {hintsRevealedForCurrent}/{currentWord.hints.length}
                  </span>
                </div>
              </div>

              {/* ── Revealed Hints ────────────────────────────── */}
              {hintsRevealedForCurrent > 0 && (
                <div className="mb-4 space-y-2">
                  {currentWord.hints
                    .slice(0, hintsRevealedForCurrent)
                    .map((hint, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-[#1e2a45] bg-[#0f1729] px-4 py-2.5"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-400/10 text-[10px] font-bold text-sky-300">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-300">{hint}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* ── Solved / Skipped banner ──────────────────── */}
              {currentWordSolved && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm font-semibold text-emerald-300">
                  Correct! — {currentWord.answer}
                </div>
              )}

              {currentWordSkipped && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-300">
                  Skipped — the answer was{" "}
                  <span className="font-bold text-red-200">
                    {currentWord.answer}
                  </span>
                </div>
              )}

              {!roundFinished && message && (
                <p
                  className={`mb-4 text-center text-sm ${mustSkip ? "font-semibold text-red-400" : "text-sky-300"}`}
                >
                  {message}
                </p>
              )}

              {/* ── Actions ──────────────────────────────────── */}
              {!roundFinished && (
                <div className="space-y-3">
                  {/* Guess input — hidden when must skip */}
                  {!mustSkip && (
                    <div className="flex justify-center gap-2.5">
                      <input
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmitGuess();
                        }}
                        placeholder="Type your guess…"
                        className="w-56 rounded-xl border border-[#1e2a45] bg-white/[0.04] px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/20"
                      />
                      <button
                        type="button"
                        onClick={handleSubmitGuess}
                        className="rounded-xl bg-gradient-to-r from-sky-400 to-sky-300 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
                      >
                        Guess
                      </button>
                    </div>
                  )}

                  {/* Reveal Hint + Skip buttons */}
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleRevealHint}
                      disabled={!canRevealMore}
                      className="rounded-full border border-[#1e2a45] bg-[#111827] px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Reveal Hint ({hintsRemaining} left)
                    </button>
                    <button
                      type="button"
                      onClick={handleSkip}
                      className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition ${
                        mustSkip
                          ? "bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
                          : "border border-[#1e2a45] bg-[#111827] text-gray-300 hover:border-red-400/40 hover:text-red-300"
                      }`}
                    >
                      {mustSkip ? "Skip Word" : "Skip"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Next Word button ─────────────────────────── */}
              {roundFinished && !isLastWord && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleNextWord}
                    className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
                  >
                    Next Word
                  </button>
                </div>
              )}

              {roundFinished && isLastWord && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setGameOver(true)}
                    className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
                  >
                    See Results
                  </button>
                </div>
              )}
            </div>

            {/* ── Word Progress Dots ─────────────────────────── */}
            <div className="flex justify-center gap-1.5">
              {game.words.map((word, i) => {
                const isCurrent = i === currentWordIndex;
                const isCorrect = correctWords.includes(word.id);
                const isSkipped = skippedWords.includes(word.id);

                let dotClass = "bg-white/[0.06]";
                if (isCorrect) dotClass = "bg-emerald-400";
                else if (isSkipped) dotClass = "bg-red-400/60";
                else if (isCurrent) dotClass = "bg-sky-400";

                return (
                  <div
                    key={word.id}
                    className={`h-2 w-2 rounded-full transition-colors ${dotClass}`}
                  />
                );
              })}
            </div>
          </>
        ) : gameOver ? (
          /* ── Game Over ──────────────────────────────────────── */
          <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-10 text-center">
            <h2
              className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold text-transparent"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {correctWords.length === game.words.length
                ? "Perfect!"
                : correctWords.length >= 7
                  ? "Great Job!"
                  : "Game Over"}
            </h2>

            <div className="mt-6 flex justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-black text-emerald-400">
                  {correctWords.length}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Correct
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-red-400">
                  {skippedWords.length}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Skipped
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-sky-300">
                  {hintsRemaining}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Hints Saved
                </p>
              </div>
            </div>

            {/* ── Results Breakdown ───────────────────────────── */}
            <div className="mx-auto mt-8 max-w-sm space-y-1.5">
              {game.words.map((word) => {
                const isCorrect = correctWords.includes(word.id);
                return (
                  <div
                    key={word.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                      isCorrect
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    <span>{word.answer}</span>
                    <span>{isCorrect ? "✓" : "✗"}</span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={resetGame}
              className="mt-8 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
            >
              Play Again
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
