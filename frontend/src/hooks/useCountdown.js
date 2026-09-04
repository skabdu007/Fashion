import { useEffect, useState } from "react";

const getRemainingMs = (targetDate) => {
  if (!targetDate) {
    return 0;
  }

  const target = new Date(targetDate).getTime();
  if (Number.isNaN(target)) {
    return 0;
  }

  return Math.max(0, target - Date.now());
};

export default function useCountdown(targetDate) {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(targetDate));

  useEffect(() => {
    setRemainingMs(getRemainingMs(targetDate));

    if (!targetDate) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const nextRemaining = getRemainingMs(targetDate);
      setRemainingMs(nextRemaining);

      if (nextRemaining <= 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const timeLabel = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    remainingMs,
    totalSeconds,
    isExpired: remainingMs <= 0,
    label: days > 0 ? `${days}d ${timeLabel}` : timeLabel
  };
}
