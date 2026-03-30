import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordStrengthMeterProps {
  password: string;
  strength: "weak" | "medium" | "strong";
  score: number;
  feedback: string;
}

const strengthColors = {
  weak: {
    bg: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-400",
  },
  medium: {
    bg: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
  },
  strong: {
    bg: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  strength,
  score,
  feedback,
}) => {
  // Chỉ hiển thị khi password yếu hoặc trung bình (cảnh báo)
  // Không hiển thị khi mạnh (UI sạch hơn)
  if (!password || strength === "strong") return null;

  return (
    <motion.div 
      className="mt-2 space-y-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <motion.div
          className={`h-full ${strengthColors[strength].bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className={`text-xs font-medium ${strengthColors[strength].text}`}>
        ⚠️ {feedback}
      </p>
    </motion.div>
  );
};
