"use client";

import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";

type Variant =
  | "default"
  | "red"
  | "blue"
  | "green"
  | "purple"
  | "pink"
  | "orange"
  | "cyan"
  | "violet"
  | "emerald";

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  duration?: number;
  delay?: number;
}

const variantMap: Record<Variant, string> = {
  default: "",
  red: "text-red-400",
  blue: "text-blue-400",
  green: "text-green-400",
  purple: "text-purple-400",
  pink: "text-pink-400",
  orange: "text-orange-400",
  cyan: "text-cyan-400",
  violet: "text-violet-400",
  emerald: "text-emerald-400",
};

export function ShimmerText({
  children,
  className,
  variant = "default",
  duration = 1.5,
  delay = 1.5,
}: ShimmerTextProps) {
  return (
    <div className="group overflow-hidden">
      <div>
        <motion.div
          className={cn(
            "inline-block [--shimmer-contrast:rgba(0,0,0,0.5)]",
            variantMap[variant],
            className,
          )}
          style={{
            WebkitTextFillColor: "transparent",
            background:
              "currentColor linear-gradient(to right, currentColor 0%, var(--shimmer-contrast) 40%, var(--shimmer-contrast) 60%, currentColor 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            backgroundRepeat: "no-repeat",
            backgroundSize: "50% 200%",
          } as React.CSSProperties}
          initial={{
            backgroundPositionX: "250%",
          }}
          animate={{
            backgroundPositionX: ["-100%", "250%"],
          }}
          transition={{
            duration: duration,
            delay: delay,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: "linear",
          }}
        >
          <span>{children}</span>
        </motion.div>
      </div>
    </div>
  );
}

export default ShimmerText;
