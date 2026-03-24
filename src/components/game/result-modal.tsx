"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: "win" | "loss" | null;
  betAmount: number;
  secretNumber: number;
}

export function ResultModal({
  isOpen,
  onClose,
  result,
  betAmount,
  secretNumber,
}: ResultModalProps) {
  const isWin = result === "win";
  const isOdd = secretNumber % 2 !== 0;

  return (
    <AnimatePresence>
      {isOpen && result && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl p-8 text-center ${
              isWin
                ? "bg-gradient-to-b from-amber-50 to-white border border-amber-200"
                : "bg-gradient-to-b from-gray-50 to-white border border-gray-200"
            }`}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="text-5xl mb-4">{isWin ? "🎉" : "😢"}</div>

            <h2
              className={`text-3xl font-black mb-2 ${
                isWin ? "text-amber-500" : "text-gray-700"
              }`}
            >
              {isWin ? "WIN!" : "LOSE"}
            </h2>

            <p
              className={`text-xl font-bold mb-6 ${
                isWin ? "text-amber-500" : "text-red-500"
              }`}
            >
              {isWin ? `+${betAmount}` : `-${betAmount}`} 코인
            </p>

            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-6">
              <p className="text-sm text-gray-400 mb-1">비밀 숫자</p>
              <p className="text-4xl font-black text-gray-900">{secretNumber}</p>
              <p className="text-sm mt-1 text-gray-400">
                ({isOdd ? "홀수" : "짝수"})
              </p>
            </div>

            <button
              onClick={onClose}
              className={`w-full rounded-xl py-3 font-bold text-lg transition-colors ${
                isWin
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              확인
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
