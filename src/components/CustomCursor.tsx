"use client";
import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const borderX = useSpring(cursorX, springConfig);
  const borderY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a") ||
        target.classList.contains("lift-on-hover");
      
      setHovered(!!isClickable);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleHover);
    
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleHover);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none hidden md:block">
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-gold rounded-full z-10"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-gold/30 rounded-full"
        animate={{
          scale: hovered ? 1.5 : 1,
          backgroundColor: hovered ? "rgba(232, 160, 0, 0.1)" : "transparent",
          borderColor: hovered ? "rgba(232, 160, 0, 0.6)" : "rgba(232, 160, 0, 0.3)",
        }}
        style={{
          x: borderX,
          y: borderY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </div>
  );
}
