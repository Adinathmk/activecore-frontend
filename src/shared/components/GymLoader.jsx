// src/shared/components/GymLoader.jsx
import React, { useState, useEffect } from "react";

const style = `
:root {
  --obsidian: #0a0a0b;
  --steel: #1c1c20;
  --gold: #c9a84c;
  --gold-bright: #e8c96a;
  --gold-dim: #7a6330;
  --muted: #4a4a52;
}

.loader-root {
  position: fixed;
  inset: 0;
  background: var(--obsidian);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 9999;
}

.loader-root::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 200px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

.slash-bg {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    -55deg,
    transparent,
    transparent 60px,
    rgba(201,168,76,0.02) 60px,
    rgba(201,168,76,0.02) 61px
  );
}

.corner {
  position: absolute;
  width: 48px;
  height: 48px;
}

.corner--tl { top: 32px; left: 32px; border-top: 1px solid var(--gold-dim); border-left: 1px solid var(--gold-dim); }
.corner--tr { top: 32px; right: 32px; border-top: 1px solid var(--gold-dim); border-right: 1px solid var(--gold-dim); }
.corner--bl { bottom: 32px; left: 32px; border-bottom: 1px solid var(--gold-dim); border-left: 1px solid var(--gold-dim); }
.corner--br { bottom: 32px; right: 32px; border-bottom: 1px solid var(--gold-dim); border-right: 1px solid var(--gold-dim); }

.barbell-wrap {
  position: relative;
  z-index: 1;
  width: 280px;
  height: 80px;
}

.barbell-svg {
  width: 100%;
  height: 100%;
}

.bar-line {
  stroke: var(--steel);
  stroke-width: 3;
  stroke-linecap: round;
}

.plate { fill: none; stroke: var(--gold); stroke-width: 2; }
.plate-inner { fill: var(--steel); }

.barbell-glow {
  animation: barbellPulse 2.4s ease-in-out infinite;
}

@keyframes barbellPulse {
  0%,100% { filter: drop-shadow(0 0 4px rgba(201,168,76,0.2)); }
  50% { filter: drop-shadow(0 0 22px rgba(201,168,76,0.8)); }
}

.barbell-lift {
  animation: liftMotion 2.4s cubic-bezier(0.4,0,0.2,1) infinite;
  transform-origin: center center;
}

@keyframes liftMotion {
  0%   { transform: translateY(0px) scaleX(1); }
  20%  { transform: translateY(0px) scaleX(0.98); }
  40%  { transform: translateY(-18px) scaleX(1.01); }
  60%  { transform: translateY(-18px) scaleX(1.01); }
  80%  { transform: translateY(0px) scaleX(0.98); }
  100% { transform: translateY(0px) scaleX(1); }
}

.plate-left {
  animation: plateSwingL 2.4s cubic-bezier(0.4,0,0.2,1) infinite;
  transform-origin: 60px 40px;
}

.plate-right {
  animation: plateSwingR 2.4s cubic-bezier(0.4,0,0.2,1) infinite;
  transform-origin: 220px 40px;
}

@keyframes plateSwingL {
  0%,100% { transform: rotate(0deg); }
  40%,60% { transform: rotate(-4deg); }
}

@keyframes plateSwingR {
  0%,100% { transform: rotate(0deg); }
  40%,60% { transform: rotate(4deg); }
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%);
}

.loader-fadeout {
  animation: loaderFadeOut 0.4s ease-out forwards;
}

@keyframes loaderFadeOut {
  from { opacity: 1; }
  to { opacity: 0; pointer-events:none; }
}
`;

export default function GymLoader({ loading = true, minMs = 1000, children }) {
  const [showLoader, setShowLoader] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [mountTime] = useState(Date.now());

  useEffect(() => {
    if (loading) {
      setShowLoader(true);
      setFadeOut(false);
      return;
    }

    const elapsed = Date.now() - mountTime;
    const remaining = Math.max(0, minMs - elapsed);

    const timer = setTimeout(() => {
      setFadeOut(true);
      const removeTimer = setTimeout(() => setShowLoader(false), 400);
      return () => clearTimeout(removeTimer);
    }, remaining);

    return () => clearTimeout(timer);
  }, [loading, minMs, mountTime]);

  if (children !== undefined) {
    return (
      <>
        {children}
        {showLoader && <GymLoaderScreen fadeOut={fadeOut} />}
      </>
    );
  }

  if (!showLoader) return null;
  return <GymLoaderScreen fadeOut={fadeOut} />;
}

function GymLoaderScreen({ fadeOut }) {
  return (
    <>
      <style>{style}</style>

      <div className={`loader-root ${fadeOut ? "loader-fadeout" : ""}`}>
        <div className="slash-bg" />
        <div className="vignette" />

        <div className="corner corner--tl" />
        <div className="corner corner--tr" />
        <div className="corner corner--bl" />
        <div className="corner corner--br" />

        <div className="barbell-wrap">
          <svg className="barbell-svg barbell-glow" viewBox="0 0 280 80">
            <g className="barbell-lift">

              <line className="bar-line" x1="60" y1="40" x2="220" y2="40"/>

              <rect x="70" y="32" width="8" height="16" rx="1" fill="var(--gold-dim)" />
              <rect x="202" y="32" width="8" height="16" rx="1" fill="var(--gold-dim)" />

              <g className="plate-left">
                <rect className="plate-inner" x="40" y="18" width="14" height="44" rx="2"/>
                <rect className="plate" x="40" y="18" width="14" height="44" rx="2"/>
                <rect className="plate-inner" x="22" y="23" width="18" height="34" rx="2"/>
                <rect className="plate" x="22" y="23" width="18" height="34" rx="2"/>
                <rect x="14" y="28" width="8" height="24" rx="1" fill="var(--muted)" />
              </g>

              <g className="plate-right">
                <rect className="plate-inner" x="226" y="18" width="14" height="44" rx="2"/>
                <rect className="plate" x="226" y="18" width="14" height="44" rx="2"/>
                <rect className="plate-inner" x="240" y="23" width="18" height="34" rx="2"/>
                <rect className="plate" x="240" y="23" width="18" height="34" rx="2"/>
                <rect x="258" y="28" width="8" height="24" rx="1" fill="var(--muted)" />
              </g>

              {[100,106,112,118,124,130,136,142,148,154,160,166,172,178].map((x)=>(
                <line key={x} x1={x} y1="36" x2={x} y2="44"
                stroke="rgba(201,168,76,0.18)" strokeWidth="1"/>
              ))}

            </g>
          </svg>
        </div>
      </div>
    </>
  );
}