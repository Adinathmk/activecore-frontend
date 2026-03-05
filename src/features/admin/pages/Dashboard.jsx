import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { fetchAdminDashboardStatsApi } from '@/features/admin/api/admin.api';

ChartJS.register(ArcElement, Tooltip, Legend);

/* ─────────────────────────────────────────────
   DESIGN TOKENS — light theme (doc-2 palette)
   page bg:   #f8fafc
   card bg:   #ffffff
   border:    #e2e8f0  (gray-200)
   grid:      #f1f5f9  (gray-100)
   muted txt: #94a3b8  (gray-400 / slate-400)
   body txt:  #1e293b  (slate-800)
   accents:   indigo / emerald / violet / amber
───────────────────────────────────────────── */

const ACCENT = {
  users:    { line: '#6366f1', area: '#6366f120', dot: '#6366f1', grad1: '#6366f1', grad2: '#a5b4fc', ring: '#c7d2fe', bg: '#eef2ff', text: '#4f46e5' },
  products: { line: '#10b981', area: '#10b98120', dot: '#10b981', grad1: '#10b981', grad2: '#6ee7b7', ring: '#a7f3d0', bg: '#ecfdf5', text: '#059669' },
  sales:    { line: '#8b5cf6', area: '#8b5cf620', dot: '#8b5cf6', grad1: '#8b5cf6', grad2: '#c4b5fd', ring: '#ddd6fe', bg: '#f5f3ff', text: '#7c3aed' },
  revenue:  { line: '#f59e0b', area: '#f59e0b20', dot: '#f59e0b', grad1: '#f59e0b', grad2: '#fde68a', ring: '#fde68a', bg: '#fffbeb', text: '#d97706' },
};

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
const AnimatedCounter = ({ to, prefix = '' }) => {
  const count   = useMotionValue(0);
  const display = useTransform(count, v => `${prefix}${Math.round(v).toLocaleString('en-IN')}`);
  useEffect(() => {
    const c = animate(count, typeof to === 'string' ? parseFloat(to) : to, {
      duration: 1.8, ease: [0.16, 1, 0.3, 1],
    });
    return c.stop;
  }, [to]);
  return <motion.span>{display}</motion.span>;
};

/* ─────────────────────────────────────────────
   MINI SPARKLINE  (for stat cards)
───────────────────────────────────────────── */
const Sparkline = ({ data, color }) => {
  const pathRef = useRef(null);
  const W = 80, H = 32;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const x = i => (i / (data.length - 1)) * W;
  const y = v => H - 4 - ((v - min) / range) * (H - 8);
  let d = `M ${x(0)},${y(data[0])}`;
  for (let i = 0; i < data.length - 1; i++) {
    const cx = (x(i) + x(i + 1)) / 2;
    d += ` C ${cx},${y(data[i])} ${cx},${y(data[i + 1])} ${x(i + 1)},${y(data[i + 1])}`;
  }
  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = len;
    pathRef.current.style.strokeDashoffset = len;
    pathRef.current.animate(
      [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
      { duration: 1000, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards', delay: 500 }
    );
  }, []);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path ref={pathRef} d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
const SVG_ICONS = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  revenue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

const STAT_CARDS = [
  { key: 'users',    label: 'Total Users',    prefix: '',  gradFrom: 'from-blue-500',   gradTo: 'to-cyan-400' },
  { key: 'products', label: 'Total Products', prefix: '',  gradFrom: 'from-emerald-500',gradTo: 'to-teal-400' },
  { key: 'sales',    label: 'Total Sales',    prefix: '',  gradFrom: 'from-violet-500', gradTo: 'to-purple-400' },
  { key: 'revenue',  label: 'Total Revenue',  prefix: '₹', gradFrom: 'from-amber-500',  gradTo: 'to-orange-400' },
];

const StatCard = ({ cfg, value, index }) => {
  const a = ACCENT[cfg.key];
  const sparkSeeds = {
    users:    [40, 55, 48, 70, 65, 80, 75, 95, 88, 100],
    products: [30, 42, 38, 55, 50, 68, 60, 74, 70, 85],
    sales:    [20, 35, 30, 50, 44, 62, 58, 75, 70, 90],
    revenue:  [50, 60, 55, 72, 68, 85, 80, 92, 88, 100],
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 cursor-default group"
      style={{ boxShadow: '0 2px 24px 0 rgba(0,0,0,0.06)' }}
    >
      {/* Color blob */}
      <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br ${cfg.gradFrom} ${cfg.gradTo} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="flex items-start justify-between relative z-10 mb-3">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">{cfg.label}</p>
        <div className="p-3 rounded-xl ring-1" style={{ background: a.bg, color: a.text, ringColor: a.ring }}>
          {SVG_ICONS[cfg.key]}
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <p className="text-[2rem] font-black leading-none tracking-tight text-gray-800">
          <AnimatedCounter to={value} prefix={cfg.prefix} />
        </p>
        <Sparkline data={sparkSeeds[cfg.key]} color={a.line} />
      </div>

      {/* Bottom gradient line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${cfg.gradFrom} ${cfg.gradTo} opacity-60`} />
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   CHART CARD WRAPPER
───────────────────────────────────────────── */
const ChartCard = ({ title, subtitle, children, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="bg-white rounded-2xl p-6 border border-gray-100"
    style={{ boxShadow: '0 2px 24px 0 rgba(0,0,0,0.06)' }}
  >
    <div className="mb-5">
      <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400">{title}</h3>
      {subtitle && <p className="text-xs text-gray-300 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

/* ─────────────────────────────────────────────
   ANIMATED SVG LINE CHART
───────────────────────────────────────────── */
const AnimatedLineChart = ({ data = [], color = '#6366f1', areaColor = '#6366f115', label = '', formatY = v => v, height = 220 }) => {
  const svgRef  = useRef(null);
  const pathRef = useRef(null);
  const areaRef = useRef(null);
  const [tooltip,  setTooltip]  = useState(null);
  const [dotHover, setDotHover] = useState(null);

  const W = 560, H = height;
  const PAD = { top: 18, right: 16, bottom: 34, left: 52 };
  const vals  = data.map(d => d.value);
  const min   = Math.min(...vals);
  const max   = Math.max(...vals);
  const range = max - min || 1;

  const xScale = i => PAD.left + (i / Math.max(data.length - 1, 1)) * (W - PAD.left - PAD.right);
  const yScale = v => H - PAD.bottom - ((v - min) / range) * (H - PAD.top - PAD.bottom);

  const buildPath = useCallback(() => {
    if (!data.length) return '';
    const pts = data.map((d, i) => [xScale(i), yScale(d.value)]);
    let p = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const cx = (x0 + x1) / 2;
      p += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    return p;
  }, [data]);

  const buildArea = useCallback(() => {
    if (!data.length) return '';
    return `${buildPath()} L ${xScale(data.length - 1)},${H - PAD.bottom} L ${PAD.left},${H - PAD.bottom} Z`;
  }, [buildPath, data]);

  useEffect(() => {
    if (!pathRef.current || !data.length) return;
    const len = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = len;
    pathRef.current.style.strokeDashoffset = len;
    pathRef.current.animate(
      [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
      { duration: 1400, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards', delay: 300 }
    );
    if (areaRef.current) {
      areaRef.current.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 900, easing: 'ease-out', fill: 'forwards', delay: 950 }
      );
    }
  }, [data]);

  const yTicks = Array.from({ length: 5 }, (_, i) => min + (range * i) / 4);
  const uid    = color.replace('#', '');

  const handleMouseMove = e => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx   = (e.clientX - rect.left) * (W / rect.width);
    const best = data.reduce((b, d, i) => {
      const dist = Math.abs(xScale(i) - mx);
      return dist < b.dist ? { dist, i } : b;
    }, { dist: Infinity, i: 0 });
    const i = best.i;
    setTooltip({ x: xScale(i), y: yScale(data[i].value), value: data[i].value, label: data[i].label });
    setDotHover(i);
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        className="w-full h-full" style={{ cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setTooltip(null); setDotHover(null); }}>
        <defs>
          <linearGradient id={`lg-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="1"   />
          </linearGradient>
          <linearGradient id={`ag-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0"    />
          </linearGradient>
          <filter id={`gw-${uid}`} x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)}
              stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD.left - 7} y={yScale(v) + 4} textAnchor="end"
              fill="#94a3b8" fontSize="10" fontFamily="monospace">
              {formatY(Math.round(v))}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          i % Math.max(Math.ceil(data.length / 6), 1) === 0 && (
            <text key={i} x={xScale(i)} y={H - 10} textAnchor="middle"
              fill="#94a3b8" fontSize="10" fontFamily="monospace">
              {d.label.length > 8 ? d.label.slice(0, 8) + '…' : d.label}
            </text>
          )
        ))}

        {/* Area fill */}
        <path ref={areaRef} d={buildArea()} fill={`url(#ag-${uid})`} style={{ opacity: 0 }} />

        {/* Animated line */}
        <path ref={pathRef} d={buildPath()} fill="none"
          stroke={`url(#lg-${uid})`} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          filter={`url(#gw-${uid})`} />

        {/* Dots */}
        {data.map((d, i) => (
          <circle key={i}
            cx={xScale(i)} cy={yScale(d.value)}
            r={dotHover === i ? 5 : 3}
            fill={dotHover === i ? color : '#ffffff'}
            stroke={color}
            strokeWidth={dotHover === i ? 2 : 1.5}
            style={{ transition: 'r 0.12s ease, fill 0.12s ease' }} />
        ))}

        {/* Hover crosshair */}
        {tooltip && (
          <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={H - PAD.bottom}
            stroke={color} strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
        )}
      </svg>

      <AnimatePresence>
        {tooltip && (
          <motion.div key="tip"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute pointer-events-none rounded-xl px-3 py-2 text-xs font-bold"
            style={{
              left: `${(tooltip.x / W) * 100}%`,
              top:  `${(tooltip.y / H) * 100}%`,
              transform: 'translate(-50%, -130%)',
              background: '#0f172a',
              border: `1px solid ${color}40`,
              color: '#f1f5f9',
              backdropFilter: 'blur(8px)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.18), 0 0 0 1px ${color}20`,
              whiteSpace: 'nowrap',
            }}>
            <span style={{ color: '#94a3b8' }}>{tooltip.label}</span>
            <span className="ml-2" style={{ color: '#f1f5f9' }}>
              {label.includes('Revenue') ? '₹' : ''}{Number(tooltip.value).toLocaleString('en-IN')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ANIMATED BAR CHART (SVG + Framer Motion)
───────────────────────────────────────────── */
const AnimatedBarChart = ({ data = [], color = '#6366f1', formatY = v => v }) => {
  const [tooltip, setTooltip] = useState(null);
  const W = 560, H = 200;
  const PAD = { top: 10, right: 10, bottom: 34, left: 48 };
  const max    = Math.max(...data.map(d => d.value), 1);
  const gap    = (W - PAD.left - PAD.right) / data.length;
  const barW   = gap * 0.52;
  const yScale = v => H - PAD.bottom - (v / max) * (H - PAD.top - PAD.bottom);
  const ticks  = [0, 0.25, 0.5, 0.75, 1].map(t => max * t);
  const uid    = color.replace('#', '');

  return (
    <div className="relative w-full" style={{ height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full"
        onMouseLeave={() => setTooltip(null)}>
        <defs>
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id={`bh-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="1"  />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)}
              stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD.left - 7} y={yScale(v) + 4} textAnchor="end"
              fill="#94a3b8" fontSize="10" fontFamily="monospace">
              {formatY(Math.round(v))}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const bx    = PAD.left + gap * i + (gap - barW) / 2;
          const bh    = H - PAD.bottom - yScale(d.value);
          const isHov = tooltip?.i === i;
          return (
            <g key={i}
              onMouseEnter={() => setTooltip({ i, x: bx + barW / 2, y: yScale(d.value), value: d.value, label: d.label })}
              style={{ cursor: 'pointer' }}>
              <motion.rect
                x={bx} width={barW} rx={6} ry={6}
                fill={isHov ? `url(#bh-${uid})` : `url(#bg-${uid})`}
                initial={{ y: H - PAD.bottom, height: 0 }}
                animate={{ y: yScale(d.value), height: bh }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  filter: isHov ? `drop-shadow(0 0 8px ${color}60)` : 'none',
                  transition: 'filter 0.18s',
                }}
              />
              <text x={bx + barW / 2} y={H - 10} textAnchor="middle"
                fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                {d.label.length > 8 ? d.label.slice(0, 8) + '…' : d.label}
              </text>
            </g>
          );
        })}

        {/* Crosshair */}
        {tooltip && (
          <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={H - PAD.bottom}
            stroke={color} strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 3" />
        )}
      </svg>

      <AnimatePresence>
        {tooltip && (
          <motion.div key="tip"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute pointer-events-none rounded-xl px-3 py-2 text-xs font-bold"
            style={{
              left: `${(tooltip.x / W) * 100}%`,
              top:  `${(tooltip.y / H) * 100}%`,
              transform: 'translate(-50%, -120%)',
              background: '#0f172a',
              border: `1px solid ${color}40`,
              color: '#f1f5f9',
              backdropFilter: 'blur(8px)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.18)`,
              whiteSpace: 'nowrap',
            }}>
            <span style={{ color: '#94a3b8' }}>{tooltip.label}</span>
            <span className="ml-2">{Number(tooltip.value).toLocaleString('en-IN')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   DONUT — doc-2 accent colors
───────────────────────────────────────────── */
const DONUT_COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];
const donutOptions = {
  responsive: true, maintainAspectRatio: false, cutout: '70%',
  animation: { animateRotate: true, duration: 1000 },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#64748b',
        font: { size: 11, weight: '600' },
        padding: 16, usePointStyle: true, pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: '#0f172a', titleColor: '#94a3b8',
      bodyColor: '#f1f5f9', padding: 12, cornerRadius: 10,
      titleFont: { size: 11, weight: '600' }, bodyFont: { size: 13, weight: '700' }, displayColors: false,
    },
  },
};

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */
const AdminDashboard = () => {
  const [stats,   setStats]   = useState({ users: 0, products: 0, sales: 0, revenue: '0' });
  const [charts,  setCharts]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAdminDashboardStatsApi();
        const data = response.data;

        setStats({
          users:    data.total_users,
          products: data.total_products,
          sales:    data.total_sales,
          revenue:  data.total_revenue.toFixed(0),
        });

        const shorten = name => name.split(' ').slice(0, 2).join(' ');

        setCharts({
          productsTrend:  data.top_selling_products.map(p => ({ label: shorten(p.name), value: p.quantity })),
          revenueTrend:   data.revenue_by_category.map(c => ({ label: c.name, value: c.value })),
          topProducts:    data.top_selling_products.map(p => ({ label: shorten(p.name), value: p.quantity })),
          topTypes:       data.top_selling_types.map(t => ({ label: shorten(t.name), value: t.quantity })),
          orderStatus: {
            labels: data.order_status_distribution.map(s => s.status),
            datasets: [{
              data: data.order_status_distribution.map(s => s.count),
              backgroundColor:      DONUT_COLORS,
              hoverBackgroundColor: DONUT_COLORS.map(c => c + 'cc'),
              borderWidth: 0, hoverOffset: 10,
            }],
          },
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-full"
          style={{ border: '3px solid #e0e7ff', borderTop: '3px solid #6366f1' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
        />
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Loading</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 md:px-8 lg:px-10"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Overview</p>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          Admin Dashboard
        </h1>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {STAT_CARDS.map((cfg, i) => (
          <StatCard key={cfg.key} cfg={cfg} value={stats[cfg.key]} index={i} />
        ))}
      </div>

      {/* Line charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Sales by Product" subtitle="Animated trend line" index={0}>
          {charts?.productsTrend && (
            <AnimatedLineChart
              data={charts.productsTrend}
              color={ACCENT.users.line}
              areaColor={ACCENT.users.area}
              label="Sales"
              height={220}
            />
          )}
        </ChartCard>
        <ChartCard title="Revenue by Category" subtitle="Animated trend line" index={1}>
          {charts?.revenueTrend && (
            <AnimatedLineChart
              data={charts.revenueTrend}
              color={ACCENT.revenue.line}
              areaColor={ACCENT.revenue.area}
              label="Revenue ₹"
              height={220}
              formatY={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
          )}
        </ChartCard>
      </div>

      {/* Bar + Donut row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Top Product Types" subtitle="Units sold" index={2}>
          {charts?.topTypes && (
            <AnimatedBarChart data={charts.topTypes} color={ACCENT.products.line} />
          )}
        </ChartCard>
        <ChartCard title="Top Products" subtitle="Units sold" index={3}>
          {charts?.topProducts && (
            <AnimatedBarChart data={charts.topProducts} color={ACCENT.sales.line} />
          )}
        </ChartCard>
        <ChartCard title="Order Status" subtitle="Distribution" index={4}>
          {charts?.orderStatus && (
            <div style={{ height: 230 }}>
              <Doughnut data={charts.orderStatus} options={donutOptions} />
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminDashboard;