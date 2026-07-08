"use client";

import { useState, useEffect } from "react";

export function useAnonymousSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user already has a session ID in their browser
    const storedId = localStorage.getItem("weather_ai_session");
    if (storedId) {
      setSessionId(storedId);
    } else {
      // If not, generate a new one and save it
      const newId = crypto.randomUUID();
      localStorage.setItem("weather_ai_session", newId);
      setSessionId(newId);
    }
  }, []);

  return { sessionId, isReady: !!sessionId };
}
