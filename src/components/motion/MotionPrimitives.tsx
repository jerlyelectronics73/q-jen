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
 * Static pre-computed VFD PWM & Sinusoidal AC Waveform paths (Cycle width: 300px)
 * Simulates high-frequency SPWM (Sinusoidal Pulse Width Modulation) inverter output
 * and the resulting filtered sinusoidal AC motor stator current.
 */
function createPwmPulsePath(): string {
  const widthPerCycle = 300;
  const pulsesPerCycle = 24;
  const cycles = 4;
  const pulsePeriod = widthPerCycle / pulsesPerCycle;
  const yCenter = 80;
  const yHigh = 22;
  const yLow = 138;
  let d = "";

  for (let c = 0; c < cycles; c++) {
    for (let p = 0; p < pulsesPerCycle; p++) {
      const xStart = c * widthPerCycle + p * pulsePeriod;
      const xMid = xStart + pulsePeriod / 2;
      const angle = (xMid / widthPerCycle) * 2 * Math.PI;
      const sinVal = Math.sin(angle);
      const absSin = Math.abs(sinVal);
      const pulseWidth = Math.max(1.8, absSin * (pulsePeriod * 0.88));
      const leftPad = (pulsePeriod - pulseWidth) / 2;
      const p1 = Number((xStart + leftPad).toFixed(1));
      const p2 = Number((p1 + pulseWidth).toFixed(1));

      if (sinVal >= 0) {
        d += ` M ${p1} ${yCenter} V ${yHigh} H ${p2} V ${yCenter} Z`;
      } else {
        d += ` M ${p1} ${yCenter} V ${yLow} H ${p2} V ${yCenter} Z`;
      }
    }
  }
  return d.trim();
}

function createSineWavePath(phaseOffsetDeg = 0): string {
  const widthPerCycle = 300;
  const cycles = 4;
  const yCenter = 80;
  const amp = 50;
  const radOffset = (phaseOffsetDeg * Math.PI) / 180;
  const points: string[] = [];
  const steps = cycles * 50;

  for (let i = 0; i <= steps; i++) {
    const x = (i / 50) * widthPerCycle;
    const angle = (x / widthPerCycle) * 2 * Math.PI + radOffset;
    const y = yCenter - Math.sin(angle) * amp;
    points.push(
      i === 0
        ? `M ${x.toFixed(1)} ${y.toFixed(1)}`
        : `L ${x.toFixed(1)} ${y.toFixed(1)}`
    );
  }
  return points.join(" ");
}

const PWM_PULSE_PATH = createPwmPulsePath();
const SINE_PHASE_U_PATH = createSineWavePath(0);
const SINE_PHASE_V_PATH = createSineWavePath(-120);

/**
 * Animated VFD PWM Inverter AC Output Monitor for Hero
 * Visualizes authentic SPWM (Sinusoidal Pulse Width Modulation) voltage pulses
 * synthesizing 3-phase sinusoidal AC motor current.
 */
export function SineWaveVisualizer() {
  const prefersReduced = useReducedMotion();
  const [freq, setFreq] = useState(42.5);

  useEffect(() => {
    if (prefersReduced) return;
    const operatingSpeeds = [42.5, 45.0, 48.0, 50.0, 37.5, 42.5];
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % operatingSpeeds.length;
      setFreq(operatingSpeeds[idx]);
    }, 2800);
    return () => clearInterval(id);
  }, [prefersReduced]);

  const rpm = Math.round((freq * 120) / 4);

  return (
    <div className="relative rounded-2xl border border-[#336DFD]/35 bg-[#0A0F4E]/85 backdrop-blur-md p-4 sm:p-6 shadow-2xl overflow-hidden ring-1 ring-white/10">
      {/* Scope Monitor Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <div>
            <div className="font-display text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>VFD Output Monitor</span>
              <span className="hidden sm:inline-block rounded bg-blue-500/20 text-[#38BDF8] border border-blue-400/30 px-1.5 py-0.2 text-[10px] font-mono font-semibold">
                PWM AC
              </span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-blue-200/70">
              SPWM Inverter • 3-Phase AC
            </div>
          </div>
        </div>

        {/* Live Frequency & Motor Telemetry Badge */}
        <div className="rounded-xl bg-[#050826] border border-blue-500/40 px-3 py-1.5 font-mono shadow-inner text-right shrink-0">
          <div className="text-sm sm:text-base font-extrabold text-[#FACC15] leading-tight">
            {freq.toFixed(1)} Hz
          </div>
          <div className="text-[10px] font-semibold text-blue-200/80 leading-none mt-0.5">
            {rpm} RPM • 415V
          </div>
        </div>
      </div>

      {/* Industrial Oscilloscope Display */}
      <div className="relative h-40 sm:h-56 w-full rounded-xl bg-[#04071D] border border-blue-900/70 overflow-hidden flex items-center shadow-inner">
        {/* Oscilloscope Reticle Graticule (Grid) */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(56,189,248,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.35) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* On-Screen Technical OSD (On-Screen Display) */}
        <div className="absolute top-2 left-2.5 z-20 pointer-events-none flex items-center gap-2 text-[9px] sm:text-[10px] font-mono text-cyan-300/80 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded border border-cyan-500/20">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>CH1: SPWM Voltage (±560V)</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-amber-300/80">CH2: AC Current</span>
        </div>

        <div className="absolute top-2 right-2.5 z-20 pointer-events-none text-[9px] sm:text-[10px] font-mono text-blue-200/70 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded border border-blue-500/20">
          <span>Carrier: 8.0 kHz</span>
        </div>

        <svg
          viewBox="0 0 600 160"
          className="w-full h-full relative z-10"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="vfdPwmGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#0284C7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.45" />
            </linearGradient>
            <filter id="vfdGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Reference DC Rail lines */}
          <line
            x1="0"
            y1="22"
            x2="600"
            y2="22"
            stroke="rgba(56,189,248,0.25)"
            strokeDasharray="2 3"
          />
          <line
            x1="0"
            y1="80"
            x2="600"
            y2="80"
            stroke="rgba(148,163,184,0.35)"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="138"
            x2="600"
            y2="138"
            stroke="rgba(56,189,248,0.25)"
            strokeDasharray="2 3"
          />

          {/* Continuous Traveling Waveform Group (PWM Pulses + Sinusoidal AC Current) */}
          <motion.g
            animate={
              prefersReduced
                ? undefined
                : { x: [0, -300] }
            }
            transition={{
              repeat: Infinity,
              duration: 3.2,
              ease: "linear",
            }}
          >
            {/* 1. SPWM Inverter Voltage Output Pulse Train */}
            <path
              d={PWM_PULSE_PATH}
              fill="url(#vfdPwmGrad)"
              stroke="#38BDF8"
              strokeWidth="1.4"
            />

            {/* 2. Phase V Fundamental (120° lag, subtle secondary trace) */}
            <path
              d={SINE_PHASE_V_PATH}
              fill="none"
              stroke="#34D399"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              strokeOpacity="0.45"
            />

            {/* 3. Phase U Fundamental AC Motor Current (Synthesized Sine Wave) */}
            <path
              d={SINE_PHASE_U_PATH}
              fill="none"
              stroke="#FACC15"
              strokeWidth="2.8"
              filter="url(#vfdGlow)"
            />
          </motion.g>
        </svg>

        {/* Oscilloscope Bottom Legend Strip */}
        <div className="absolute bottom-1.5 left-2.5 right-2.5 z-20 pointer-events-none flex items-center justify-between text-[9px] font-mono text-slate-300 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="inline-block h-2 w-2 rounded-xs bg-[#38BDF8]" />
              <span>PWM Voltage (IGBT)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#FACC15]">
              <span className="inline-block h-0.5 w-3 bg-[#FACC15] rounded-full" />
              <span>AC Current (42.5 Hz)</span>
            </span>
          </div>
          <span className="text-emerald-400 font-semibold tracking-wider hidden sm:inline">
            3Ø SYNTHESIS NORMAL
          </span>
        </div>
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

// Alias export for clarity
export const VfdPwmOutputVisualizer = SineWaveVisualizer;

