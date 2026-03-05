import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Award, Users } from 'lucide-react';

/* ─── All CSS scoped to .about-body — zero navbar/footer bleed ─────────── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,700;1,800&family=DM+Sans:wght@300;400;500&display=swap');

  /* ── Scoped tokens + reset — ONLY inside .about-body ── */
  .about-body {
    --ink:    #0a0a0a;
    --chalk:  #f2f1ed;
    --mid:    #7a7875;
    --accent: #c8a96e;
    --rule:   rgba(10,10,10,0.10);

    font-family: 'DM Sans', sans-serif;
    background: var(--chalk);
    color: var(--ink);
    overflow-x: hidden;
    box-sizing: border-box;
  }
  .about-body *, .about-body *::before, .about-body *::after {
    box-sizing: border-box;
  }

  /* ── Typography ── */
  .about-body .disp {
    font-family: 'Barlow Condensed', sans-serif;
    text-transform: uppercase;
    letter-spacing: -0.01em;
  }

  /* ── Util ── */
  .about-body .rule-h { display: block; width: 32px; height: 2px; background: var(--accent); flex-shrink: 0; }
  .about-body .tag {
    display: inline-flex; align-items: center; gap: 6px;
    border: 1px solid var(--accent); color: var(--accent);
    font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
    padding: 5px 12px;
    font-family: 'DM Sans', sans-serif; font-weight: 500;
  }

  /* ── Buttons ── */
  .about-body .btn-dark {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--ink); color: var(--chalk);
    padding: 16px 36px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
    transition: background 0.3s, color 0.3s;
  }
  .about-body .btn-dark:hover { background: var(--accent); color: var(--ink); }

  .about-body .btn-ghost {
    display: inline-flex; align-items: center; gap: 10px;
    border: 1px solid var(--ink); background: transparent; color: var(--ink);
    padding: 14px 34px; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
    transition: background 0.3s, color 0.3s;
  }
  .about-body .btn-ghost:hover { background: var(--ink); color: var(--chalk); }

  /* ── Grain ── */
  .about-body .grain::before {
    content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.03;
  }

  /* ── Value card ── */
  .about-body .val-card {
    border-top: 2px solid var(--ink);
    padding: 36px 0 0;
    transition: border-color 0.3s;
  }
  .about-body .val-card:hover { border-color: var(--accent); }
  .about-body .val-card:hover .val-num { color: var(--accent); }

  .about-body .val-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 3.5rem; font-weight: 900; text-transform: uppercase;
    color: rgba(10,10,10,0.08);
    line-height: 1; margin-bottom: 16px;
    transition: color 0.3s;
  }

  /* ── Team card ── */
  .about-body .team-card { position: relative; overflow: hidden; cursor: pointer; }
  .about-body .team-card img {
    width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block;
    filter: grayscale(100%);
    transition: filter 0.5s ease, transform 0.5s ease;
  }
  .about-body .team-card:hover img { filter: grayscale(20%); transform: scale(1.04); }
  .about-body .team-overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 100%);
    padding: 32px 24px 24px;
    transform: translateY(8px);
    transition: transform 0.4s ease;
  }
  .about-body .team-card:hover .team-overlay { transform: translateY(0); }

  /* ── Timeline ── */
  .about-body .timeline-item { position: relative; padding-left: 28px; }
  .about-body .timeline-item::before {
    content: ''; position: absolute; left: 0; top: 8px;
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent);
  }
  .about-body .timeline-item::after {
    content: ''; position: absolute; left: 3px; top: 20px; bottom: -32px;
    width: 1px; background: var(--rule);
  }
  .about-body .timeline-item:last-child::after { display: none; }

  /* ── Stat strip ── */
  .about-body .stat-strip {
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }
  .about-body .stat-item {
    flex: 1;
    padding: 40px 32px;
    border-right: 1px solid var(--rule);
    text-align: center;
  }
  .about-body .stat-item:last-child { border-right: none; }

  /* ── CTA section ── */
  .about-body .cta-section {
    position: relative;
    background: var(--ink);
    overflow: hidden;
  }
  .about-body .cta-bg-text {
    position: absolute;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    font-size: clamp(8rem, 20vw, 18rem);
    color: rgba(255,255,255,0.03);
    white-space: nowrap;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    letter-spacing: -0.02em;
    user-select: none;
  }

  /* ── Marquee — renamed keyframe to avoid global clash ── */
  @keyframes about-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .about-body .marquee-track {
    display: flex; gap: 0;
    animation: about-marquee 18s linear infinite;
    width: max-content;
  }
  .about-body .marquee-track:hover { animation-play-state: paused; }
  .about-body .marquee-item {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800; text-transform: uppercase;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    color: var(--ink); opacity: 0.12;
    padding: 0 48px; white-space: nowrap; letter-spacing: 0.08em;
  }
  .about-body .marquee-item.light { color: #fff; opacity: 0.06; }

  /* ── Gold divider ── */
  .about-body .gold-divider {
    width: 100%; height: 1px;
    background: linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%);
    opacity: 0.35;
  }
`;

/* ─── Animation presets ─────────────────────────────────────────────────── */
const fadeUp   = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } } };
const fadeLeft = { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } } };
const fadeRight= { hidden: { opacity: 0, x:  40 }, show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } } };
const stagger  = { show: { transition: { staggerChildren: 0.1 } } };

/* ─── Section label — uses scoped classes ───────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
      style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
      <motion.span variants={fadeUp} className="rule-h" />
      <motion.span variants={fadeUp} className="tag">{children}</motion.span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ABOUT PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function About() {
  const navigate = useNavigate();
  const heroRef  = useRef(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroScale   = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const VALUES = [
    { icon: <Zap size={18} />,    title: 'Performance First',      body: 'Every stitch, fabric, and cut is engineered to move with your body — not against it. We obsess over function so you can focus on results.' },
    { icon: <Target size={18} />, title: 'Purposeful Design',      body: 'No excess. No compromise. Each product is stripped to its essential form — clean lines, precise fit, zero distraction.' },
    { icon: <Award size={18} />,  title: 'Uncompromising Quality', body: 'We source premium technical fabrics and hold every piece to rigorous standards before it reaches you.' },
    { icon: <Users size={18} />,  title: 'Built for Everyone',     body: 'From first rep to final set, our range is designed for every body, every intensity, every ambition.' },
  ];

  const TEAM = [
    { name: 'Alex Mercer',    role: 'Founder & CEO',       img: 'https://images.unsplash.com/photo-1534308143439-3af2e2f5e2df?w=600&q=80' },
    { name: 'Jordan Steele',  role: 'Head of Design',      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80' },
    { name: 'Maya Okonkwo',   role: 'Performance Director',img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80' },
    { name: 'Chris Nakamura', role: 'Head of Product',     img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80' },
  ];

  const TIMELINE = [
    { year: '2018', event: 'Founded in a garage with a single prototype compression set and a relentless belief that activewear could be both performance-grade and premium.' },
    { year: '2020', event: 'Launched our first full collection. Sold out in 72 hours. Community of 10,000 athletes in the first year.' },
    { year: '2022', event: 'Partnered with textile engineers to develop our proprietary FlexCore™ fabric — 4-way stretch, moisture-wicking, and built to last 500+ washes.' },
    { year: '2024', event: 'Crossed 100,000 orders delivered. Expanded to 40+ countries. Stayed true to the original mission: gear that earns its place.' },
    { year: '2025', event: 'New chapter. New collection. Same obsession.' },
  ];

  const MARQUEE_ITEMS = ['Train Hard', 'No Shortcuts', 'Built Different', 'Performance Gear', 'Earn It', 'Lift More', 'No Days Off'];

  return (
    <>
      <style>{GLOBAL_STYLE}</style>

      <main className="about-body">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section ref={heroRef} className="grain"
          style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>

          <motion.div style={{ scale: heroScale, position: 'absolute', inset: 0 }}>
            <img
              src="https://res.cloudinary.com/diyesfihd/image/upload/v1772718715/bannr-3_nxehkp.jpg"
              alt="Athlete training"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </motion.div>

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.3) 60%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent 0%, #c8a96e 40%, #c8a96e 60%, transparent 100%)' }} />

          <motion.div style={{ opacity: heroOpacity, position: 'relative', zIndex: 10, padding: 'clamp(40px, 8vw, 80px)', maxWidth: 900 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              style={{ marginBottom: 28 }}>
              <span className="tag" style={{ borderColor: 'rgba(200,169,110,0.5)', color: '#c8a96e' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#c8a96e', display: 'inline-block' }} />
                Our Story
              </span>
            </motion.div>

            <motion.h1 className="disp"
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: 'clamp(4.5rem, 13vw, 11rem)', fontWeight: 900, color: '#fff', lineHeight: 0.88, marginBottom: 36 }}>
              WE DON'T<br />MAKE GEAR.<br />
              <span style={{ WebkitTextStroke: '2px #c8a96e', color: 'transparent' }}>WE MAKE</span><br />
              STANDARDS.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{ color: 'rgba(242,241,237,0.65)', fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', fontWeight: 300, lineHeight: 1.8, maxWidth: 480 }}>
              Born in the gym. Built for the relentless. Every product we make starts with one question: does it make you better?
            </motion.p>
          </motion.div>

          <div style={{ position: 'absolute', bottom: 36, right: 'clamp(32px, 6vw, 64px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, rgba(200,169,110,0.6))' }} />
            <span style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>Scroll</span>
          </div>
        </section>


        {/* ── MANIFESTO STRIP ───────────────────────────────────────────────── */}
        <section style={{ background: '#fff', padding: '80px clamp(24px, 8vw, 80px)', borderBottom: '1px solid rgba(10,10,10,0.10)' }}>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 1 }}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)', lineHeight: 1.4, letterSpacing: '0.04em', color: '#0a0a0a', maxWidth: 900 }}>
            We started because we were tired of choosing between{' '}
            <span style={{ color: '#c8a96e' }}>performance</span> and{' '}
            <span style={{ color: '#c8a96e' }}>quality.</span> So we built the brand we always wanted to train in.
          </motion.p>
        </section>


        {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
        <section className="stat-strip" style={{ background: '#f2f1ed' }}>
          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ display: 'flex', flexWrap: 'wrap', maxWidth: 1200, margin: '0 auto' }}>
            {[
              { num: '100K+',  label: 'Orders Delivered',  sub: 'Across 40+ countries' },
              { num: '5,000+', label: 'Activewear Styles', sub: 'Across all categories' },
              { num: '2.5M+',  label: 'Fit Customers',     sub: 'Global community' },
              { num: '500+',   label: 'Wash Guarantee',    sub: 'On every product' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="stat-item">
                <p className="disp" style={{ fontSize: 'clamp(2.8rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>{s.num}</p>
                <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: '#7a7875' }}>{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>


        {/* ── STORY + TIMELINE ──────────────────────────────────────────────── */}
        <section style={{ padding: '120px clamp(24px, 8vw, 80px)', background: '#f2f1ed', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 80, alignItems: 'start' }}>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
              <SectionLabel>The Journey</SectionLabel>
              <motion.h2 variants={fadeLeft} className="disp"
                style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 0.9, marginBottom: 32 }}>
                FROM GARAGE<br />TO GLOBAL
              </motion.h2>
              <motion.p variants={fadeLeft} style={{ color: '#7a7875', fontSize: 14, lineHeight: 1.9, fontWeight: 300, marginBottom: 20 }}>
                It started with frustration. Our founder Alex Mercer was an elite athlete who couldn't find gear that matched his standards — technical enough for serious training, refined enough to wear with pride.
              </motion.p>
              <motion.p variants={fadeLeft} style={{ color: '#7a7875', fontSize: 14, lineHeight: 1.9, fontWeight: 300, marginBottom: 40 }}>
                So he built it himself. What began as a prototype in a garage became a movement — a community of athletes who refuse to compromise on what they wear when they push their limits.
              </motion.p>
              <motion.div variants={fadeLeft}>
                <button className="btn-dark" onClick={() => navigate('/products/all')}>
                  Shop the Collection <ArrowRight size={13} />
                </button>
              </motion.div>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              style={{ paddingTop: 8 }}>
              {TIMELINE.map((item, i) => (
                <motion.div key={i} variants={fadeRight} className="timeline-item"
                  style={{ marginBottom: i < TIMELINE.length - 1 ? 40 : 0 }}>
                  <p className="disp" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c8a96e', marginBottom: 6 }}>{item.year}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.8, color: '#7a7875', fontWeight: 300 }}>{item.event}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>


        {/* ── MARQUEE DIVIDER ───────────────────────────────────────────────── */}
        <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(10,10,10,0.10)', borderBottom: '1px solid rgba(10,10,10,0.10)', padding: '18px 0', background: '#f2f1ed' }}>
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="marquee-item">
                {item} <span style={{ color: '#c8a96e', opacity: 1, margin: '0 8px' }}>✦</span>
              </span>
            ))}
          </div>
        </div>


        {/* ── SPLIT IMAGE + COPY ────────────────────────────────────────────── */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', minHeight: 600 }}>

          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 480 }}>
            <motion.img
              initial={{ scale: 1.1 }} whileInView={{ scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              src="https://res.cloudinary.com/diyesfihd/image/upload/v1772718713/banner-3_pzfhnc.jpg"
              alt="Athlete in gear"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(20%)' }}
            />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 80, height: 80, borderTop: '2px solid #c8a96e', borderLeft: '2px solid #c8a96e', opacity: 0.5 }} />
          </div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            style={{ background: '#0a0a0a', padding: 'clamp(48px, 8vw, 80px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <span className="rule-h" style={{ background: '#c8a96e' }} />
              <span className="tag" style={{ borderColor: 'rgba(200,169,110,0.4)', color: '#c8a96e' }}>Our Craft</span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="disp"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#f2f1ed', lineHeight: 0.9, marginBottom: 32 }}>
              FABRIC THAT<br />FIGHTS BACK
            </motion.h2>

            <motion.p variants={fadeUp} style={{ color: 'rgba(242,241,237,0.55)', fontSize: 14, lineHeight: 1.9, fontWeight: 300, marginBottom: 16 }}>
              Our in-house materials team spent three years developing FlexCore™ — a proprietary technical fabric that delivers four-way stretch, targeted compression, and breathability that actually performs under load.
            </motion.p>
            <motion.p variants={fadeUp} style={{ color: 'rgba(242,241,237,0.55)', fontSize: 14, lineHeight: 1.9, fontWeight: 300, marginBottom: 40 }}>
              Rated for 500+ washes without degradation. Because gear that doesn't last is gear that fails you.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['FlexCore™ Fabric', '4-Way Stretch', 'Moisture-Wicking', '500+ Wash Rated', 'Anti-Odor'].map((spec, i) => (
                <span key={i} style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid rgba(200,169,110,0.3)', color: 'rgba(200,169,110,0.7)', padding: '5px 12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{spec}</span>
              ))}
            </motion.div>
          </motion.div>
        </section>


        {/* ── VALUES GRID ───────────────────────────────────────────────────── */}
        <section style={{ padding: '120px clamp(24px, 8vw, 80px)', background: '#fff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <SectionLabel>What We Stand For</SectionLabel>

            <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="disp"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 900, lineHeight: 0.88, marginBottom: 72 }}>
              FOUR VALUES.<br />ZERO COMPROMISES.
            </motion.h2>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
              {VALUES.map((v, i) => (
                <motion.div key={i} variants={fadeUp} className="val-card">
                  <p className="val-num">{String(i + 1).padStart(2, '0')}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: '#c8a96e' }}>{v.icon}</div>
                  <h3 className="disp" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 14, letterSpacing: '0.04em' }}>{v.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.85, color: '#7a7875', fontWeight: 300 }}>{v.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── DARK MARQUEE STRIP ────────────────────────────────────────────── */}
        <div style={{ overflow: 'hidden', background: '#0a0a0a', padding: '20px 0' }}>
          <div className="marquee-track" style={{ animationDirection: 'reverse', animationDuration: '22s' }}>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="marquee-item light">
                {item} <span style={{ color: '#c8a96e', opacity: 0.4, margin: '0 8px' }}>✦</span>
              </span>
            ))}
          </div>
        </div>


        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="cta-section grain" style={{ padding: '140px clamp(24px, 8vw, 80px)', textAlign: 'center' }}>
          <div className="cta-bg-text">PERFORM</div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>

              <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                <span className="tag" style={{ borderColor: 'rgba(200,169,110,0.4)', color: '#c8a96e' }}>Ready to Elevate</span>
              </motion.div>

              <motion.h2 variants={fadeUp} className="disp"
                style={{ fontSize: 'clamp(4rem, 12vw, 9rem)', fontWeight: 900, color: '#f2f1ed', lineHeight: 0.88, marginBottom: 40 }}>
                GEAR UP.<br />
                <span style={{ WebkitTextStroke: '2px rgba(200,169,110,0.6)', color: 'transparent' }}>SHOW UP.</span><br />
                LEVEL UP.
              </motion.h2>

              <motion.p variants={fadeUp}
                style={{ color: 'rgba(242,241,237,0.45)', fontSize: 14, lineHeight: 1.8, maxWidth: 400, margin: '0 auto 56px', fontWeight: 300 }}>
                The collection is live. Your next PR is waiting.
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-dark" onClick={() => navigate('/products/men')}>
                  Shop Men <ArrowRight size={13} />
                </button>
                <button className="btn-ghost"
                  style={{ borderColor: 'rgba(242,241,237,0.2)', color: '#f2f1ed' }}
                  onClick={() => navigate('/products/women')}>
                  Shop Women <ArrowRight size={13} />
                </button>
              </motion.div>
            </motion.div>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} className="gold-divider" />
        </section>

      </main>
    </>
  );
}