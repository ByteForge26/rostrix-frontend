import { useEffect, useState } from "react";

const useTabVisibility = () => {
  const [isTabVisible, setIsTabVisible] = useState(true);

  const handleVisibilityChange = () => {
    setIsTabVisible(document.visibilityState === "visible");
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isTabVisible;
};
export { useTabVisibility };
