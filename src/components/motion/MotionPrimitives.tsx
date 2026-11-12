"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: "some" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState(prefersReduced ? value : 0);

  useEffect(() => {
    if (!inView || prefersReduced) return;

    const duration = 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, prefersReduced]);

  return (
    <span ref={ref}>
      {prefix}
      {prefersReduced ? value : display}
      {suffix}
    </span>
  );
}

export function MagneticButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 20 });
  const springY = useSpring(y, { stiffness: 280, damping: 20 });

  if (prefersReduced) {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = (e.clientX - rect.left - rect.width / 2) * 0.12;
        const offsetY = (e.clientY - rect.top - rect.height / 2) * 0.12;
        x.set(offsetX);
        y.set(offsetY);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated VFD Frequency / PWM Sine-Wave Visual for Hero
 */
export function SineWaveVisualizer() {
  const prefersReduced = useReducedMotion();
  const [freq, setFreq] = useState(50.0);

  useEffect(() => {
    if (prefersReduced) return;
    const id = setInterval(() => {
      setFreq((prev) => {
        const next = prev >= 50 ? 35.0 : Number((prev + 2.5).toFixed(1));
        return next;
      });
    }, 2400);
    return () => clearInterval(id);
  }, [prefersReduced]);

  return (
    <div className="relative rounded-2xl border border-[#336DFD]/30 bg-[#0A0F4E]/75 backdrop-blur-md p-5 sm:p-6 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-blue-200">
            VFD Output Monitor
          </span>
        </div>
        <div className="rounded-lg bg-[#060A30] border border-blue-500/30 px-3 py-1 font-mono text-sm font-bold text-[#FACC15]">
          {freq.toFixed(1)} Hz
        </div>
      </div>

      {/* Multi-phase SVG Sine Waves */}
      <div className="relative h-36 sm:h-52 w-full rounded-xl bg-[#050826] border border-blue-900/60 overflow-hidden flex items-center">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(51,109,253,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(51,109,253,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <svg
          viewBox="0 0 600 160"
          className="w-full h-full relative z-10"
          aria-hidden="true"
        >
          {/* Center baseline */}
          <line
            x1="0"
            y1="80"
            x2="600"
            y2="80"
            stroke="rgba(148,163,184,0.22)"
            strokeDasharray="4 4"
          />

          {/* Phase U (Electric Cobalt Blue) */}
          <motion.path
            d="M 0 80 Q 37.5 16, 75 80 T 150 80 T 225 80 T 300 80 T 375 80 T 450 80 T 525 80 T 600 80"
            fill="none"
            stroke="#336DFD"
            strokeWidth="3.2"
            animate={
              prefersReduced
                ? undefined
                : { x: [0, -150] }
            }
            transition={{
              repeat: Infinity,
              duration: 3.2,
              ease: "linear",
            }}
          />

          {/* Phase V (Warm Gold Ring accent) */}
          <motion.path
            d="M 0 80 Q 37.5 144, 75 80 T 150 80 T 225 80 T 300 80 T 375 80 T 450 80 T 525 80 T 600 80"
            fill="none"
            stroke="#FACC15"
            strokeWidth="2.2"
            strokeOpacity="0.85"
            animate={
              prefersReduced
                ? undefined
                : { x: [-50, -200] }
            }
            transition={{
              repeat: Infinity,
              duration: 3.2,
              ease: "linear",
            }}
          />

          {/* Phase W (Emerald subtle wave) */}
          <motion.path
            d="M 0 80 Q 37.5 24, 75 80 T 150 80 T 225 80 T 300 80 T 375 80 T 450 80 T 525 80 T 600 80"
            fill="none"
            stroke="#34D399"
            strokeWidth="1.6"
            strokeOpacity="0.55"
            animate={
              prefersReduced
                ? undefined
                : { x: [-100, -250] }
            }
            transition={{
              repeat: Infinity,
              duration: 3.2,
              ease: "linear",
            }}
          />
        </svg>
      </div>

      {/* Verified Origin Telemetry Strip */}
      <div className="mt-3.5 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
        <div className="rounded-lg bg-[#060A30]/90 border border-blue-900/50 p-2 sm:p-2.5">
          <div className="text-[10px] sm:text-[11px] text-blue-200/70">
            Power Range
          </div>
          <div className="font-mono text-[11px] sm:text-sm font-bold text-white mt-0.5 whitespace-nowrap">
            15–220 kW
          </div>
        </div>
        <div className="rounded-lg bg-[#060A30]/90 border border-blue-900/50 p-2 sm:p-2.5">
          <div className="text-[10px] sm:text-[11px] text-blue-200/70">
            Engineering
          </div>
          <div className="font-mono text-[11px] sm:text-sm font-bold text-white mt-0.5 whitespace-nowrap">
            In-House PCB
          </div>
        </div>
        <div className="rounded-lg bg-[#060A30]/90 border border-blue-900/50 p-2 sm:p-2.5">
          <div className="text-[10px] sm:text-[11px] text-blue-200/70">
            Origin
          </div>
          <div className="font-mono text-[11px] sm:text-sm font-bold text-[#FACC15] mt-0.5 whitespace-nowrap">
            Madurai, IN
          </div>
        </div>
      </div>
    </div>
  );
}

