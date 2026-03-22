"use client";

import { useMemo, useState } from "react";
import {
  getMillionaireGame,
  type MillionaireAnswerKey,
  type MillionaireCategory,
} from "@/lib/millionaire";

const ANSWER_KEYS: MillionaireAnswerKey[] = ["A", "B", "C", "D"];
const QUESTIONS_PER_ROUND = 3;

function formatMoney(amount: number) {
  return `$${amount.toLocaleString()}`;
}

/* ------------------------------------------------------------------ */
/*  ORIGINAL CODE REFERENCE (keep for revert):                        */
/*  - All className values from the original are noted in comments     */
/*    marked with "// ORIG:" above or inline where changed.            */
/* ------------------------------------------------------------------ */

export default function MillionairePage() {
  const game = getMillionaireGame();

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] =
    useState<MillionaireAnswerKey | null>(null);
  const [lockedAnswer, setLockedAnswer] = useState<MillionaireAnswerKey | null>(
    null,
  );
  const [gameOver, setGameOver] = useState(false);
  const [wonGame, setWonGame] = useState(false);
  const [moneyWon, setMoneyWon] = useState(0);

  const [usedAskTheCrowd, setUsedAskTheCrowd] = useState(false);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedPhoneAFriend, setUsedPhoneAFriend] = useState(false);

  const [showAskTheCrowd, setShowAskTheCrowd] = useState(false);
  const [showPhoneAFriend, setShowPhoneAFriend] = useState(false);
  const [eliminatedAnswers, setEliminatedAnswers] = useState<
    MillionaireAnswerKey[]
  >([]);

  const selectedQuestions = useMemo(() => {
    return selectedCategoryIds.flatMap((categoryId, roundIndex) => {
      const round = game.rounds[roundIndex];
      const category = round.categories.find((c) => c.id === categoryId);
      return category ? category.questions : [];
    });
  }, [game.rounds, selectedCategoryIds]);

  const currentQuestion = selectedQuestions[currentQuestionIndex] ?? null;

  const currentRoundIndex = Math.floor(
    currentQuestionIndex / QUESTIONS_PER_ROUND,
  );
  const needsCategorySelection =
    !gameOver &&
    currentQuestionIndex === selectedQuestions.length &&
    selectedCategoryIds.length < game.rounds.length;

  const currentRound = needsCategorySelection
    ? game.rounds[selectedCategoryIds.length]
    : null;

  const currentCategoryName = useMemo(() => {
    if (!currentQuestion) return null;

    const round = game.rounds[currentRoundIndex];
    const category = round?.categories.find((c) =>
      c.questions.some((q) => q.id === currentQuestion.id),
    );

    return category?.name ?? null;
  }, [currentQuestion, currentRoundIndex, game.rounds]);

  function resetQuestionUI() {
    setSelectedAnswer(null);
    setLockedAnswer(null);
    setShowAskTheCrowd(false);
    setShowPhoneAFriend(false);
    setEliminatedAnswers([]);
  }

  function resetGame() {
    setSelectedCategoryIds([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setLockedAnswer(null);
    setGameOver(false);
    setWonGame(false);
    setMoneyWon(0);
    setUsedAskTheCrowd(false);
    setUsedFiftyFifty(false);
    setUsedPhoneAFriend(false);
    setShowAskTheCrowd(false);
    setShowPhoneAFriend(false);
    setEliminatedAnswers([]);
  }

  function handleChooseCategory(category: MillionaireCategory) {
    if (!needsCategorySelection) return;
    setSelectedCategoryIds((prev) => [...prev, category.id]);
    resetQuestionUI();
  }

  function handleSelectAnswer(answerKey: MillionaireAnswerKey) {
    if (lockedAnswer || gameOver || !currentQuestion) return;
    if (eliminatedAnswers.includes(answerKey)) return;
    setSelectedAnswer(answerKey);
  }

  function handleLockAnswer() {
    if (!selectedAnswer || !currentQuestion || gameOver) return;

    setLockedAnswer(selectedAnswer);

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setMoneyWon(currentQuestion.prize);

      const isLastQuestion =
        currentQuestionIndex === game.rounds.length * QUESTIONS_PER_ROUND - 1;

      if (isLastQuestion) {
        setWonGame(true);
        setGameOver(true);
      }
    } else {
      setGameOver(true);
    }
  }

  function handleNextQuestion() {
    if (!lockedAnswer || gameOver || !currentQuestion) return;

    const wasCorrect = lockedAnswer === currentQuestion.correctAnswer;
    if (!wasCorrect) return;

    setCurrentQuestionIndex((prev) => prev + 1);
    resetQuestionUI();
  }

  function handleAskTheCrowd() {
    if (usedAskTheCrowd || lockedAnswer || gameOver || !currentQuestion) return;
    setUsedAskTheCrowd(true);
    setShowAskTheCrowd(true);
  }

  function handleFiftyFifty() {
    if (usedFiftyFifty || lockedAnswer || gameOver || !currentQuestion) return;
    setUsedFiftyFifty(true);

    const keepAnswers = new Set(currentQuestion.fiftyFifty);
    const toEliminate = ANSWER_KEYS.filter((key) => !keepAnswers.has(key));
    setEliminatedAnswers(toEliminate);

    if (selectedAnswer && toEliminate.includes(selectedAnswer)) {
      setSelectedAnswer(null);
    }
  }

  function handlePhoneAFriend() {
    if (usedPhoneAFriend || lockedAnswer || gameOver || !currentQuestion)
      return;
    setUsedPhoneAFriend(true);
    setShowPhoneAFriend(true);
  }

  const answerResult =
    lockedAnswer && currentQuestion
      ? {
          isCorrect: lockedAnswer === currentQuestion.correctAnswer,
          correctAnswer: currentQuestion.correctAnswer,
        }
      : null;

  /* ---------------------------------------------------------------- */
  /*  Color key (Tailwind classes used throughout):                     */
  /*    bg-[#0a0e1a]  — deepest navy background                       */
  /*    bg-[#111827]  — card backgrounds                               */
  /*    bg-[#1a2036]  — elevated card / hover                          */
  /*    border-[#1e2a45] — subtle borders                              */
  /*    text-sky-300 / orange-500 — primary accent                  */
  /*    text-sky-300 / amber-400 — gold / money accent               */
  /*    text-gray-300 / gray-400 — body copy                           */
  /* ---------------------------------------------------------------- */

  return (
    // ORIG: <div className="space-y-8">
    <div className="min-h-screen space-y-8 bg-[#0a0e1a] px-4 py-8 text-gray-100 sm:px-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      {/* ORIG: <section className="space-y-2 text-center"> */}
      <section className="space-y-3 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
          March Madness Edition
        </p>
        {/* ORIG: <h1 className="text-3xl font-bold"> */}
        <h1
          className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {game.title}
        </h1>
        {/* ORIG: <p className="text-gray-600"> */}
        <p className="mx-auto max-w-md text-sm text-gray-400">
          {game.description}
        </p>
      </section>

      {/* ── Money Bar ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
              Winnings
            </span>
            <span className="text-sm font-bold text-sky-300">
              {formatMoney(moneyWon)}
              <span className="ml-1 text-[10px] font-semibold text-gray-500">
                / $2,000
              </span>
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 transition-all duration-700 ease-out"
              style={{ width: `${Math.min((moneyWon / 2000) * 100, 100)}%` }}
            />
          </div>
          {/* Milestone markers */}
          <div className="mt-1.5 flex justify-between text-[9px] font-semibold text-gray-600">
            <span>$0</span>
            <span>$500</span>
            <span>$1,000</span>
            <span>$1,500</span>
            <span>$2,000</span>
          </div>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────── */}
      {/* ORIG: <section className="grid gap-8 lg:grid-cols-[1fr_280px]"> */}
      <section className="mx-auto max-w-3xl">
        <div className="space-y-5">
          {/* ══════════════════════════════════════════════════════ */}
          {/*  CATEGORY SELECTION                                    */}
          {/* ══════════════════════════════════════════════════════ */}
          {needsCategorySelection && currentRound ? (
            // ORIG: <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-8">
              <div className="mb-6 text-center">
                {/* ORIG: text-blue-600 */}
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
                  {currentRound.title}
                </p>
                {/* ORIG: text-3xl font-bold text-gray-900 */}
                <h2 className="mt-2 text-3xl font-extrabold text-white">
                  Pick a category
                </h2>
                {/* ORIG: text-gray-600 */}
                <p className="mt-2 text-sm text-gray-400">
                  Choose one category for this round of 3 questions.
                </p>
              </div>

              {/* ORIG: <div className="grid gap-4 md:grid-cols-2"> */}
              <div className="grid gap-4 md:grid-cols-2">
                {currentRound.categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleChooseCategory(category)}
                    // ORIG: rounded-3xl border border-gray-200 bg-white p-6 text-left transition hover:border-blue-300 hover:bg-blue-50
                    className="group rounded-xl border border-[#1e2a45] bg-[#0f1729] p-6 text-left transition-all duration-200 hover:border-sky-400/60 hover:bg-[#1a2036] hover:shadow-[0_0_24px_rgba(56,189,248,0.08)]"
                  >
                    {/* ORIG: text-blue-600 */}
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sky-300/70 transition-colors group-hover:text-sky-300">
                      Category
                    </p>
                    {/* ORIG: text-2xl font-bold text-gray-900 */}
                    <h3 className="mt-2 text-xl font-extrabold text-white">
                      {category.name}
                    </h3>
                    {/* ORIG: text-gray-600 */}
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                      {category.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : !gameOver && currentQuestion ? (
            <>
              {/* ══════════════════════════════════════════════════ */}
              {/*  QUESTION CARD                                     */}
              {/* ══════════════════════════════════════════════════ */}
              {/* ORIG: rounded-3xl border border-gray-200 bg-white p-6 shadow-sm */}
              <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    {/* ORIG: text-blue-600 */}
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                      Question {currentQuestionIndex + 1} of{" "}
                      {game.rounds.length * QUESTIONS_PER_ROUND}
                    </p>
                    {/* ORIG: text-gray-500 */}
                    <p className="mt-1 text-sm text-gray-500">
                      Current winnings:{" "}
                      <span className="font-semibold text-sky-300">
                        {formatMoney(moneyWon)}
                      </span>
                    </p>
                    {currentCategoryName && (
                      // ORIG: text-gray-700
                      <p className="mt-1 text-sm font-medium text-gray-400">
                        Category: {currentCategoryName}
                      </p>
                    )}
                  </div>
                  {/* ORIG: rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800 */}
                  <div className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-bold text-sky-300">
                    {formatMoney(currentQuestion.prize)}
                  </div>
                </div>

                {/* ORIG: text-2xl font-bold leading-9 text-gray-900 */}
                <h2 className="text-2xl font-extrabold leading-9 text-white">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* ══════════════════════════════════════════════════ */}
              {/*  ANSWER BUTTONS                                    */}
              {/* ══════════════════════════════════════════════════ */}
              <div className="grid gap-3">
                {ANSWER_KEYS.map((key) => {
                  const isEliminated = eliminatedAnswers.includes(key);
                  const isSelected = selectedAnswer === key;
                  const isCorrectReveal =
                    lockedAnswer && key === currentQuestion.correctAnswer;
                  const isWrongReveal =
                    lockedAnswer === key &&
                    key !== currentQuestion.correctAnswer;
                  const isFriendPick =
                    showPhoneAFriend && key === currentQuestion.phoneAFriend;
                  const crowdPercent = currentQuestion.askTheCrowd[key];

                  /* ORIG default: border-gray-200 bg-white text-gray-900 hover:bg-gray-50 */
                  let className =
                    "border-[#1e2a45] bg-[#111827] text-gray-200 hover:bg-[#1a2036] hover:border-[#2a3a5c]";
                  let badgeLetter = "bg-white/10 text-gray-300";

                  if (isEliminated) {
                    /* ORIG: border-gray-100 bg-gray-100 text-gray-400 opacity-60 */
                    className =
                      "border-[#1e2a45]/40 bg-[#0f1729] text-gray-600 opacity-40";
                    badgeLetter = "bg-white/5 text-gray-600";
                  } else if (isCorrectReveal) {
                    /* ORIG: border-green-300 bg-green-100 text-green-900 */
                    className =
                      "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                    badgeLetter = "bg-emerald-500 text-white";
                  } else if (isWrongReveal) {
                    /* ORIG: border-red-300 bg-red-100 text-red-900 */
                    className = "border-red-500/50 bg-red-500/10 text-red-300";
                    badgeLetter = "bg-red-500 text-white";
                  } else if (isSelected) {
                    /* ORIG: border-blue-400 bg-blue-100 text-blue-900 */
                    className =
                      "border-sky-400/60 bg-sky-400/10 text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.1)]";
                    badgeLetter = "bg-sky-400 text-white";
                  } else if (isFriendPick) {
                    /* ORIG: border-purple-300 bg-purple-100 text-purple-900 */
                    className =
                      "border-violet-500/40 bg-violet-500/10 text-violet-300";
                    badgeLetter = "bg-violet-500 text-white";
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={lockedAnswer !== null || isEliminated}
                      onClick={() => handleSelectAnswer(key)}
                      // ORIG: rounded-2xl border p-4 text-left transition ${className}
                      className={`rounded-xl border p-4 text-left transition-all duration-200 ${className}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* ORIG: bg-black text-white */}
                        <span
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${badgeLetter}`}
                        >
                          {key}
                        </span>

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-semibold">
                              {currentQuestion.answers[key]}
                            </span>

                            {showPhoneAFriend &&
                              isFriendPick &&
                              !lockedAnswer && (
                                // ORIG: bg-purple-200 text-purple-800
                                <span className="shrink-0 rounded-full bg-violet-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                                  Friend's pick
                                </span>
                              )}
                          </div>

                          {showAskTheCrowd && !isEliminated && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                <span>Audience</span>
                                <span>{crowdPercent}%</span>
                              </div>
                              {/* ORIG: bg-gray-200 / bg-blue-500 */}
                              <div className="h-2 rounded-full bg-white/5">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 transition-all duration-500"
                                  style={{ width: `${crowdPercent}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ── Phone a Friend callout ───────────────────────── */}
              {showPhoneAFriend && (
                // ORIG: rounded-3xl border border-purple-200 bg-purple-50 p-5 shadow-sm
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5">
                  {/* ORIG: text-purple-900 */}
                  <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-violet-400">
                    Phone a Friend
                  </h3>
                  {/* ORIG: text-purple-800 */}
                  <p className="text-sm text-violet-300">
                    "I think the answer is{" "}
                    <span className="font-bold text-violet-200">
                      {currentQuestion.phoneAFriend}
                    </span>
                    ."
                  </p>
                </div>
              )}

              {/* ── Lifeline buttons ─────────────────────────────── */}
              <div className="flex flex-wrap justify-center gap-2">
                {/* ORIG: rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-black */}
                <button
                  type="button"
                  onClick={handleAskTheCrowd}
                  disabled={usedAskTheCrowd || lockedAnswer !== null}
                  className="rounded-full border border-[#1e2a45] bg-[#111827] px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Ask the Crowd
                </button>

                <button
                  type="button"
                  onClick={handleFiftyFifty}
                  disabled={usedFiftyFifty || lockedAnswer !== null}
                  className="rounded-full border border-[#1e2a45] bg-[#111827] px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  50/50
                </button>

                <button
                  type="button"
                  onClick={handlePhoneAFriend}
                  disabled={usedPhoneAFriend || lockedAnswer !== null}
                  className="rounded-full border border-[#1e2a45] bg-[#111827] px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Phone a Friend
                </button>
              </div>

              {/* ── Lock / Next button ───────────────────────────── */}
              <div className="flex flex-wrap justify-center gap-3">
                {!lockedAnswer ? (
                  // ORIG: rounded-full bg-black px-6 py-3 font-semibold text-white
                  <button
                    type="button"
                    onClick={handleLockAnswer}
                    disabled={selectedAnswer === null}
                    className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
                  >
                    Lock Answer
                  </button>
                ) : answerResult?.isCorrect ? (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
                  >
                    {needsCategorySelection
                      ? "Choose Category"
                      : "Next Question"}
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            /* ══════════════════════════════════════════════════════ */
            /*  GAME OVER                                             */
            /* ══════════════════════════════════════════════════════ */
            // ORIG: rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm
            <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-10 text-center">
              {/* ORIG: text-3xl font-bold text-gray-900 */}
              <h2
                className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold text-transparent"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {wonGame ? "You Won!" : "Game Over"}
              </h2>
              {/* ORIG: text-lg text-gray-600 */}
              <p className="mt-4 text-sm uppercase tracking-wider text-gray-500">
                Total money earned
              </p>
              {/* ORIG: text-5xl font-black text-green-700 */}
              <p className="mt-2 text-5xl font-black text-sky-300">
                {formatMoney(moneyWon)}
              </p>

              {!wonGame && lockedAnswer && currentQuestion && (
                // ORIG: text-sm text-gray-600
                <p className="mt-6 text-sm text-gray-500">
                  The correct answer was{" "}
                  <span className="font-bold text-emerald-400">
                    {currentQuestion.correctAnswer}:{" "}
                    {currentQuestion.answers[currentQuestion.correctAnswer]}
                  </span>
                  .
                </p>
              )}

              {/* ORIG: rounded-full bg-black px-6 py-3 font-semibold text-white */}
              <button
                type="button"
                onClick={resetGame}
                className="mt-8 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Google Font import (Oswald for headlines) ──────────── */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
