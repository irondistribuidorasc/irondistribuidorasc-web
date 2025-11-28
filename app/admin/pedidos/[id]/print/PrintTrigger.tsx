"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    globalThis.print();
  }, []);

  return null;
}
