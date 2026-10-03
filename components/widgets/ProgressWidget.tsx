"use client";

import { useEffect, useState } from "react";
import type { ProgressConfig } from "@/lib/types";

function Ring({ pct, color }: { pct: number; color: string }) {
  const size = 88;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-neutral-200 dark:text-neutral-700"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-neutral-800 dark:fill-neutral-100"
        style={{ fontSize: 16, fontWeight: 600 }}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

function useCountdown(targetDate?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - now;
  const clamped = Math.max(diff, 0);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);
  return { days, hours, minutes, seconds, done: diff <= 0 };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[2.5rem] rounded-lg bg-neutral-100 px-2 py-1.5 text-center text-lg font-semibold tabular-nums dark:bg-neutral-800">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
    </div>
  );
}

export default function ProgressWidget({ config }: { config: ProgressConfig }) {
  const { mode, label, color } = config;
  // Called unconditionally (rules-of-hooks) even though it's only rendered
  // for mode === "countdown" - mode is fixed per widget so this is safe.
  const cd = useCountdown(config.targetDate);

  if (mode === "bar") {
    const current = config.current ?? 0;
    const target = config.target ?? 100;
    const pct = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {label}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {current}
            {config.unit ?? ""} / {target}
            {config.unit ?? ""}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  }

  if (mode === "ring") {
    const current = config.current ?? 0;
    const target = config.target ?? 100;
    const pct = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;
    return (
      <div className="flex flex-col items-center gap-2 text-current">
        <Ring pct={pct} color={color} />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {label}
        </span>
      </div>
    );
  }

  if (mode === "countdown") {
    return (
      <div className="flex flex-col items-center gap-2">
        {label && (
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {label}
          </span>
        )}
        {cd ? (
          cd.done ? (
            <span className="text-sm font-semibold" style={{ color }}>
              It&apos;s time!
            </span>
          ) : (
            <div className="flex gap-2">
              <TimeBox value={cd.days} label="days" />
              <TimeBox value={cd.hours} label="hrs" />
              <TimeBox value={cd.minutes} label="min" />
              <TimeBox value={cd.seconds} label="sec" />
            </div>
          )
        ) : (
          <span className="text-xs text-neutral-400">No target date set</span>
        )}
      </div>
    );
  }

  // counter
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold tabular-nums" style={{ color }}>
        {config.value ?? 0}
      </span>
      {label && (
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
      )}
    </div>
  );
}
