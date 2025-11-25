"use client";

import { motion, Variants } from "framer-motion";

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  variant?: "fadeIn" | "fadeInUp" | "scaleIn" | "slideInLeft" | "slideInRight";
  delay?: number;
  duration?: number;
  viewport?: { once?: boolean; amount?: number | "some" | "all" };
}

const variants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
};

export function ScrollAnimation({
  children,
  className = "",
  variant = "fadeInUp",
  delay = 0,
  duration = 0.5,
  viewport = { once: true, amount: 0.1 },
}: ScrollAnimationProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants[variant]}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
