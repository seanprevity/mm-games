"use client";

import { useMemo, useRef, useState } from "react";
import { getCrosswordGame } from "@/lib/crossword";

type Direction = "across" | "down";

type SelectedCell = {
  row: number;
  col: number;
} | null;

type CellStatus = "default" | "correct" | "incorrect";

export default function CrosswordPage() {
  const game = useMemo(() => getCrosswordGame(), []);

  const initialUserGrid = useMemo(
    () => game.cells.map((row) => row.map((cell) => (cell === "#" ? "#" : ""))),
    [game],
  );

  const initialStatuses = useMemo(
    () => game.cells.map((row) => row.map(() => "default")) as CellStatus[][],
    [game],
  );

  const [userGrid, setUserGrid] = useState<string[][]>(initialUserGrid);
  const [cellStatuses, setCellStatuses] =
    useState<CellStatus[][]>(initialStatuses);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [direction, setDirection] = useState<Direction>("across");
  const [message, setMessage] = useState("");

  const boardRef = useRef<HTMLDivElement | null>(null);

  function isBlockedCell(row: number, col: number) {
    if (row < 0 || row >= game.rows || col < 0 || col >= game.cols) {
      return true;
    }
    return game.cells[row][col] === "#";
  }

  function getCellNumber(row: number, col: number) {
    const allClues = [...game.clues.across, ...game.clues.down];
    const clue = allClues.find((c) => c.row === row && c.col === col);
    return clue?.number;
  }

  function isAcrossStart(row: number, col: number) {
    if (isBlockedCell(row, col)) return false;
    const startsHere = col === 0 || isBlockedCell(row, col - 1);
    const continuesRight = col + 1 < game.cols && !isBlockedCell(row, col + 1);
    return startsHere && continuesRight;
  }

  function isDownStart(row: number, col: number) {
    if (isBlockedCell(row, col)) return false;
    const startsHere = row === 0 || isBlockedCell(row - 1, col);
    const continuesDown = row + 1 < game.rows && !isBlockedCell(row + 1, col);
    return startsHere && continuesDown;
  }

  function supportsAcross(row: number, col: number) {
    if (isBlockedCell(row, col)) return false;
    const hasLeft = col - 1 >= 0 && !isBlockedCell(row, col - 1);
    const hasRight = col + 1 < game.cols && !isBlockedCell(row, col + 1);
    return hasLeft || hasRight;
  }

  function supportsDown(row: number, col: number) {
    if (isBlockedCell(row, col)) return false;
    const hasUp = row - 1 >= 0 && !isBlockedCell(row - 1, col);
    const hasDown = row + 1 < game.rows && !isBlockedCell(row + 1, col);
    return hasUp || hasDown;
  }

  function getAvailableDirections(row: number, col: number): Direction[] {
    const directions: Direction[] = [];
    if (supportsAcross(row, col)) directions.push("across");
    if (supportsDown(row, col)) directions.push("down");
    return directions;
  }

  function getPreferredDirection(row: number, col: number): Direction {
    const acrossStart = isAcrossStart(row, col);
    const downStart = isDownStart(row, col);

    if (acrossStart && !downStart) return "across";
    if (downStart && !acrossStart) return "down";
    if (acrossStart && downStart) return "across";

    const hasRight = col + 1 < game.cols && !isBlockedCell(row, col + 1);

    if (!hasRight && supportsDown(row, col)) {
      return "down";
    }

    if (supportsAcross(row, col)) {
      return "across";
    }

    return "down";
  }

  function getAcrossBounds(row: number, col: number) {
    let startCol = col;
    let endCol = col;

    while (startCol - 1 >= 0 && !isBlockedCell(row, startCol - 1)) {
      startCol -= 1;
    }

    while (endCol + 1 < game.cols && !isBlockedCell(row, endCol + 1)) {
      endCol += 1;
    }

    return { startRow: row, endRow: row, startCol, endCol };
  }

  function getDownBounds(row: number, col: number) {
    let startRow = row;
    let endRow = row;

    while (startRow - 1 >= 0 && !isBlockedCell(startRow - 1, col)) {
      startRow -= 1;
    }

    while (endRow + 1 < game.rows && !isBlockedCell(endRow + 1, col)) {
      endRow += 1;
    }

    return { startRow, endRow, startCol: col, endCol: col };
  }

  function getActiveWordCells(
    row: number,
    col: number,
    activeDirection: Direction,
  ) {
    if (isBlockedCell(row, col)) return [];

    if (activeDirection === "across") {
      const bounds = getAcrossBounds(row, col);
      return Array.from(
        { length: bounds.endCol - bounds.startCol + 1 },
        (_, i) => ({
          row,
          col: bounds.startCol + i,
        }),
      );
    }

    const bounds = getDownBounds(row, col);
    return Array.from(
      { length: bounds.endRow - bounds.startRow + 1 },
      (_, i) => ({
        row: bounds.startRow + i,
        col,
      }),
    );
  }

  const highlightedCells = useMemo(() => {
    if (!selectedCell) return [];
    return getActiveWordCells(selectedCell.row, selectedCell.col, direction);
  }, [selectedCell, direction]);

  function isHighlighted(row: number, col: number) {
    return highlightedCells.some(
      (cell) => cell.row === row && cell.col === col,
    );
  }

  function focusBoard() {
    boardRef.current?.focus();
  }

  function handleCellClick(row: number, col: number) {
    if (isBlockedCell(row, col)) return;

    const availableDirections = getAvailableDirections(row, col);

    if (selectedCell?.row === row && selectedCell?.col === col) {
      if (availableDirections.length === 2) {
        setDirection((prev) => (prev === "across" ? "down" : "across"));
      } else if (availableDirections.length === 1) {
        setDirection(availableDirections[0]);
      }
    } else {
      setSelectedCell({ row, col });
      setDirection(getPreferredDirection(row, col));
    }

    focusBoard();
  }

  function updateCell(row: number, col: number, value: string) {
    setUserGrid((prev) =>
      prev.map((r, rowIndex) =>
        r.map((cell, colIndex) =>
          rowIndex === row && colIndex === col ? value : cell,
        ),
      ),
    );

    setCellStatuses((prev) =>
      prev.map((r, rowIndex) =>
        r.map((status, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            return "default";
          }
          return status;
        }),
      ),
    );
  }

  function moveSelectionForward(row: number, col: number) {
    const wordCells = getActiveWordCells(row, col, direction);
    if (wordCells.length === 0) return;
    const currentIndex = wordCells.findIndex(
      (cell) => cell.row === row && cell.col === col,
    );
    if (currentIndex === -1) return;

    // First try to find an empty or incorrect cell
    for (let i = currentIndex + 1; i < wordCells.length; i += 1) {
      const nextCell = wordCells[i];
      if (cellStatuses[nextCell.row][nextCell.col] === "correct") continue;

      const nextValue = userGrid[nextCell.row][nextCell.col];
      if (!nextValue) {
        setSelectedCell(nextCell);
        return;
      }
    }

    // Otherwise move to the next non-correct cell
    for (let i = currentIndex + 1; i < wordCells.length; i += 1) {
      const nextCell = wordCells[i];
      if (cellStatuses[nextCell.row][nextCell.col] !== "correct") {
        setSelectedCell(nextCell);
        return;
      }
    }

    // All remaining cells are correct — stay put
    setSelectedCell(wordCells[Math.min(currentIndex, wordCells.length - 1)]);
  }

  function moveSelectionBackward(row: number, col: number) {
    if (direction === "across") {
      let prevCol = col - 1;
      while (prevCol >= 0) {
        if (
          !isBlockedCell(row, prevCol) &&
          cellStatuses[row][prevCol] !== "correct"
        ) {
          setSelectedCell({ row, col: prevCol });
          return;
        }
        prevCol -= 1;
      }
      return;
    }

    let prevRow = row - 1;
    while (prevRow >= 0) {
      if (
        !isBlockedCell(prevRow, col) &&
        cellStatuses[prevRow][col] !== "correct"
      ) {
        setSelectedCell({ row: prevRow, col });
        return;
      }
      prevRow -= 1;
    }
  }

  function handleLetterInput(letter: string) {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (isBlockedCell(row, col)) return;
    if (cellStatuses[row][col] === "correct") return;

    const upper = letter.toUpperCase();
    if (!/^[A-Z]$/.test(upper)) return;

    updateCell(row, col, upper);
    moveSelectionForward(row, col);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    if (e.key === "Backspace") {
      e.preventDefault();

      if (cellStatuses[row][col] === "correct") {
        moveSelectionBackward(row, col);
        return;
      }

      if (userGrid[row][col]) {
        updateCell(row, col, "");
        moveSelectionBackward(row, col);
      } else {
        moveSelectionBackward(row, col);
      }

      return;
    }

    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      handleLetterInput(e.key);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      setDirection("across");
      if (col + 1 < game.cols && !isBlockedCell(row, col + 1)) {
        setSelectedCell({ row, col: col + 1 });
      }
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setDirection("across");
      if (col - 1 >= 0 && !isBlockedCell(row, col - 1)) {
        setSelectedCell({ row, col: col - 1 });
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setDirection("down");
      if (row + 1 < game.rows && !isBlockedCell(row + 1, col)) {
        setSelectedCell({ row: row + 1, col });
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setDirection("down");
      if (row - 1 >= 0 && !isBlockedCell(row - 1, col)) {
        setSelectedCell({ row: row - 1, col });
      }
    }
  }

  function checkAnswers() {
    let allCorrect = true;

    const nextStatuses = game.cells.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (cell === "#") return "default" as CellStatus;

        const userValue = userGrid[rowIndex][colIndex];

        if (userValue === cell) {
          return "correct" as CellStatus;
        }

        allCorrect = false;
        return "incorrect" as CellStatus;
      }),
    );

    setCellStatuses(nextStatuses);
    setMessage(
      allCorrect
        ? "Correct! You solved the puzzle."
        : "Some entries are incorrect. Fix the red squares and check again.",
    );
  }

  function resetPuzzle() {
    setUserGrid(initialUserGrid);
    setCellStatuses(initialStatuses);
    setSelectedCell(null);
    setDirection("across");
    setMessage("");
  }

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────── */}
      <section className="space-y-3 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
          March Madness Edition
        </p>
        <h1
          className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Crossword
        </h1>
        <p className="mx-auto max-w-md text-sm text-gray-400">
          The full March Madness crossword — more clues, bigger grid, deeper
          challenge.
        </p>
      </section>

      {/* ── Board (centered) ─────────────────────────────────── */}
      <div className="flex justify-center overflow-x-auto">
        <div
          ref={boardRef}
          className="w-fit rounded-2xl p-2 outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${game.cols}, minmax(0, 1fr))`,
            }}
          >
            {game.cells.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isBlocked = cell === "#";
                const isSelected =
                  selectedCell?.row === rowIndex &&
                  selectedCell?.col === colIndex;
                const isInHighlightedWord = isHighlighted(rowIndex, colIndex);
                const clueNumber = getCellNumber(rowIndex, colIndex);
                const status = cellStatuses[rowIndex][colIndex];

                let cellClassName =
                  "border-gray-300 bg-white text-black hover:bg-gray-50";
                let numberColor = "text-gray-500";

                if (isSelected) {
                  // Selected cell always gets blue border
                  const bg =
                    status === "correct"
                      ? "bg-green-100"
                      : status === "incorrect"
                        ? "bg-red-100"
                        : "bg-blue-200";
                  cellClassName = `border-blue-500 ${bg} text-black ring-1 ring-blue-500`;
                  numberColor = "text-blue-600/70";
                } else if (isInHighlightedWord) {
                  // Highlighted word cells get lighter blue border
                  const bg =
                    status === "correct"
                      ? "bg-green-100"
                      : status === "incorrect"
                        ? "bg-red-100"
                        : "bg-blue-50";
                  cellClassName = `border-blue-200 ${bg} text-black`;
                  numberColor = "text-blue-400/60";
                } else if (status === "correct") {
                  cellClassName =
                    "border-green-400 bg-green-100 text-black hover:bg-green-100";
                  numberColor = "text-green-600/60";
                } else if (status === "incorrect") {
                  cellClassName =
                    "border-red-400 bg-red-100 text-black hover:bg-red-100";
                  numberColor = "text-red-500/60";
                }

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={isBlocked}
                    className={`relative flex h-8 w-8 items-center justify-center text-xs font-bold uppercase transition-colors sm:h-9 sm:w-9 sm:text-sm ${
                      isBlocked
                        ? "cursor-default border-transparent bg-transparent"
                        : `border ${cellClassName}`
                    }`}
                  >
                    {!isBlocked && clueNumber && (
                      <span
                        className={`absolute left-[2px] top-[1px] text-[7px] font-semibold leading-none sm:text-[8px] ${numberColor}`}
                      >
                        {clueNumber}
                      </span>
                    )}
                    {!isBlocked && userGrid[rowIndex][colIndex]}
                  </button>
                );
              }),
            )}
          </div>
        </div>
      </div>

      {/* ── Clues (always below board) ─────────────────────────── */}
      <div className="mx-auto grid max-w-2xl gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
            Across
          </h2>
          <div className="space-y-2.5">
            {game.clues.across.map((clue) => (
              <div key={`across-${clue.number}`}>
                <p className="text-sm leading-relaxed text-gray-300">
                  <span className="mr-1.5 font-bold text-gray-100">
                    {clue.number}.
                  </span>
                  {clue.clue}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
            Down
          </h2>
          <div className="space-y-2.5">
            {game.clues.down.map((clue) => (
              <div key={`down-${clue.number}`}>
                <p className="text-sm leading-relaxed text-gray-300">
                  <span className="mr-1.5 font-bold text-gray-100">
                    {clue.number}.
                  </span>
                  {clue.clue}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Message ───────────────────────────────────────────── */}
      {message && (
        <p
          className={`text-center text-sm font-semibold ${
            message.startsWith("Correct") ? "text-emerald-400" : "text-sky-300"
          }`}
        >
          {message}
        </p>
      )}

      {/* ── Action Buttons ────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={checkAnswers}
          className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:cursor-pointer hover:shadow-sky-400/30"
        >
          Check Answers
        </button>

        <button
          type="button"
          onClick={resetPuzzle}
          className="rounded-full border border-[#1e2a45] bg-white/[0.04] px-7 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-300 transition hover:cursor-pointer hover:border-sky-400/40 hover:text-sky-300"
        >
          Reset Puzzle
        </button>
      </div>
    </div>
  );
}
