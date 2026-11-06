import { useEffect, useState } from "react";
import { CLOCK_TICK_MS } from "../config";

export const useNow = (): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return now;
};
