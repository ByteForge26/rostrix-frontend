import { useEffect, useState } from "react";

const useCountdown = (targetDate: number) => {
  const countDownDate = targetDate * 1000;
  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [countDownDate]);
  return Math.ceil(countDown / 1000);
};
export { useCountdown };
