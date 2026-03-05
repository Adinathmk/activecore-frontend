import React, { useState, useEffect, useRef } from 'react';
import sampleVideo2 from '@/assets/video-2.mp4';
import {
  ChevronDown, ShoppingBag, User,
  ArrowRight, Shield, Truck, Clock, ArrowLeft, ArrowRight as RightArrow
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CountUp from '@/shared/utils/CountUp';
import ScrollVelocity from '@/shared/utils/scrollVelocity';
import sampleimage1 from '@/assets/testimonial-1.jpeg';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { getFeaturedProducts } from '@/features/products/api/product.api';
import { FeaturedProductsSkeleton } from '@/shared/components/Skeleton';
import GymLoader from '@/shared/components/GymLoader';

/* ─── Global design system ──────────────────────────────────────────────── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');

  /* ── CSS vars scoped to home only — do NOT touch :root to avoid navbar/footer bleed ── */
  .home-body {
    --ink:    #0a0a0a;
    --chalk:  #f2f1ed;
    --off:    #eae9e4;
    --mid:    #7a7875;
    --accent: #c8a96e;
    --rule:   rgba(10,10,10,0.10);

    font-family: 'DM Sans', sans-serif;
    background: var(--chalk);
    color: var(--ink);
    overflow-x: hidden;

    /* Scope box-sizing reset ONLY inside home-body */
    box-sizing: border-box;
  }
  .home-body *, .home-body *::before, .home-body *::after {
    box-sizing: border-box;
  }

  /* ── Typography — scoped ── */
  .home-body .disp {
    font-family: 'Barlow Condensed', sans-serif;
    text-transform: uppercase;
    letter-spacing: -0.01em;
  }

  .home-body .rule-h  { display: block; width: 32px; height: 2px; background: var(--accent); flex-shrink: 0; }
  .home-body .tag {
    display: inline-flex; align-items: center; gap: 6px;
    border: 1px solid var(--accent); color: var(--accent);
    font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
    padding: 5px 12px;
    font-family: 'DM Sans', sans-serif; font-weight: 500;
  }

  /* ── Buttons — scoped ── */
  .home-body .btn-dark {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--ink); color: var(--chalk);
    padding: 16px 36px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
    transition: background 0.3s, color 0.3s;
  }
  .home-body .btn-dark:hover { background: var(--accent); color: var(--ink); }

  .home-body .btn-ghost-dark {
    display: inline-flex; align-items: center; gap: 10px;
    border: 1px solid var(--ink); background: transparent; color: var(--ink);
    padding: 14px 34px; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
    transition: background 0.3s, color 0.3s;
  }
  .home-body .btn-ghost-dark:hover { background: var(--ink); color: var(--chalk); }

  .home-body .btn-ghost-light {
    display: inline-flex; align-items: center; gap: 10px;
    border: 1px solid rgba(242,241,237,0.28); background: transparent; color: rgba(242,241,237,0.75);
    padding: 14px 34px; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
    transition: background 0.3s, color 0.3s, border-color 0.3s;
  }
  .home-body .btn-ghost-light:hover { background: rgba(242,241,237,0.1); color: #fff; border-color: rgba(242,241,237,0.5); }

  /* ── Hero split ── */
  .home-body .hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 90vh;
}
  @media (max-width: 768px) {
    .home-body .hero-grid { grid-template-columns: 1fr; }
    .home-body .hero-img-panel { min-height: 70vw; order: -1; }
  }

  .home-body .hero-img-panel { position: relative; overflow: hidden; }
  .home-body .hero-img-panel img {
    width: 100%; height: 100%; object-fit: cover;
    object-position: center top; display: block;
    transition: transform 8s ease;
  }
  .home-body .hero-img-panel:hover img { transform: scale(1.04); }

  /* ── Ticker ── */
  @keyframes hb-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .home-body .ticker-track { display: flex; gap: 0; width: max-content; animation: hb-ticker 22s linear infinite; }
  .home-body .ticker-item {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800; font-size: 11px;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--ink); padding: 0 36px; white-space: nowrap; opacity: 0.45;
  }

  /* ── Stat card ── */
  .home-body .stat-card {
    position: relative; overflow: hidden;
    background: var(--ink); color: var(--chalk);
    padding: 44px 36px; transition: transform 0.4s ease;
  }
  .home-body .stat-card::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(200,169,110,0.07) 0%, transparent 60%);
    pointer-events: none;
  }
  .home-body .stat-card:hover { transform: translateY(-4px); }
  .home-body .stat-bar { position: absolute; bottom: 0; left: 0; height: 2px; width: 40%; background: linear-gradient(90deg, var(--accent), transparent); }

  /* ── Category cards ── */
  .home-body .cat-card { position: relative; overflow: hidden; cursor: pointer; }
  .home-body .cat-card img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(15%); transition: transform 0.6s ease, filter 0.6s ease; }
  .home-body .cat-card:hover img { transform: scale(1.06); filter: grayscale(0%); }
  .home-body .cat-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.1) 55%, transparent 100%); transition: background 0.4s; }
  .home-body .cat-card:hover .cat-overlay { background: linear-gradient(to top, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.2) 55%, transparent 100%); }
  .home-body .cat-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 32px 28px; }
  .home-body .cat-arrow { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; transform: translateX(-8px); opacity: 0; transition: transform 0.35s, opacity 0.35s; }
  .home-body .cat-card:hover .cat-arrow { transform: translateX(0); opacity: 1; }

  /* ── Product card ── */
  .home-body .prod-wrap { position: relative; overflow: hidden; background: var(--off); }
  .home-body .prod-wrap .img-a { display: block; width: 100%; aspect-ratio: 3/4; object-fit: cover; transition: opacity 0.65s, transform 0.65s; }
  .home-body .prod-wrap .img-b { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.65s, transform 0.65s; transform: scale(1.04); }
  .home-body .prod-wrap:hover .img-a { opacity: 0; transform: scale(1.04); }
  .home-body .prod-wrap:hover .img-b { opacity: 1; transform: scale(1); }
  .home-body .prod-cta { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(10,10,10,0.62), transparent); padding: 28px 18px 16px; transform: translateY(100%); transition: transform 0.38s; }
  .home-body .prod-wrap:hover .prod-cta { transform: translateY(0); }
  .home-body .prod-idx { position: absolute; top: 14px; left: 14px; font-size: 10px; letter-spacing: 0.15em; color: rgba(255,255,255,0.4); font-weight: 500; font-family: 'DM Sans', sans-serif; }

  /* ── Feature grid ── */
  .home-body .feat-row { display: grid; grid-template-columns: repeat(3,1fr); background: var(--rule); gap: 1px; }
  @media (max-width: 640px) { .home-body .feat-row { grid-template-columns: 1fr; } }
  .home-body .feat-cell { background: var(--chalk); padding: 52px 40px; text-align: center; transition: background 0.3s; }
  .home-body .feat-cell:hover { background: #fff; }
  .home-body .feat-icon-ring { width: 52px; height: 52px; border-radius: 50%; border: 1px solid var(--rule); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; background: #fff; transition: border-color 0.3s; }
  .home-body .feat-cell:hover .feat-icon-ring { border-color: var(--accent); }

  /* ── Testimonial ── */
  .home-body .testi-wrap { background: rgba(255,255,255,0.04); border-top: 1px solid rgba(200,169,110,0.35); padding: 48px 40px; }

  /* ── Grain ── */
  .home-body .grain::before { content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 2; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); opacity: 0.03; }

  /* ── Velocity ── */
  .home-body .vel-wrap { border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); overflow: hidden; padding: 14px 0; background: var(--chalk); }
  .home-body .vel-wrap span { font-family: 'Barlow Condensed', sans-serif !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; color: var(--ink) !important; opacity: 0.1 !important; font-size: clamp(2rem,5vw,4rem) !important; }
`;

const fadeUp  = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.11 } } };

function Label({ children, light }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44 }}>
      <span className="rule-h" style={light ? { background: 'var(--accent)' } : {}} />
      <span className="tag" style={light ? { borderColor: 'rgba(200,169,110,0.4)', color: 'var(--accent)' } : {}}>{children}</span>
    </div>
  );
}

const TICKER = ['Train Hard', 'No Shortcuts', 'Earn It', 'Performance Gear', 'Built Different', 'Lift More'];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => { setPageReady(true); }, []);

  useEffect(() => {
    (async () => {
      setFeaturedLoading(true);
      try {
        const data = await getFeaturedProducts();
        const formatted = [...data].reverse().map(p => ({
          id: p.id, slug: p.slug,
          image1: p.primary_image   || 'https://placehold.co/600x800?text=No+Image',
          image2: p.secondary_image || null,
          rating: p.avg_rating,
        }));
        setFeaturedProducts(formatted);
      } catch (e) { console.error(e); }
      finally { setFeaturedLoading(false); }
    })();
  }, []);

  const testimonials = [
    { name: 'Sarah Johnson',   role: 'Premium Member',  text: 'The quality and service exceeded my expectations. Fast shipping and exceptional products!',         avatar: sampleimage1 },
    { name: 'Michael Chen',    role: 'Loyal Customer',   text: 'Outstanding customer service and the products are even better in person. Highly recommended!',    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    { name: 'Emily Rodriguez', role: 'First-time Buyer', text: 'The attention to detail in every product is remarkable. Will definitely shop here again.',        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
  ];
  const nextSlide = () => setCurrentSlide(p => (p + 1) % testimonials.length);
  const prevSlide = () => setCurrentSlide(p => (p - 1 + testimonials.length) % testimonials.length);
  useEffect(() => { const t = setInterval(nextSlide, 5000); return () => clearInterval(t); }, []);

  return (
    <GymLoader loading={!pageReady} minMs={1000}>
      <style>{GLOBAL_STYLE}</style>
      <div className="home-body">

        {/* ══════════════════════════════════
            HERO — split: dark copy / image
        ══════════════════════════════════ */}
        <section
  className="hero-grid grain"
  style={{
    position: "relative",
    overflow: "hidden"
  }}
>
  {/* LEFT — copy panel */}
  <div
    style={{
      background: "var(--ink)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: "clamp(40px,6vw,80px)",
      position: "relative",
      overflow: "hidden",
      height: "100%"
    }}
  >
    {/* gold top rule */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background:
          "linear-gradient(90deg, var(--accent) 0%, transparent 80%)"
      }}
    />

    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      style={{ position: "relative", zIndex: 2 }}
    >
      <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
        <span
          className="tag"
          style={{
            borderColor: "rgba(200,169,110,0.5)",
            color: "var(--accent)"
          }}
        >
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block"
            }}
          />
          New Collection 2025
        </span>
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="disp"
        style={{
          fontSize: "clamp(3rem,7vw,6rem)",
          fontWeight: 900,
          color: "#f2f1ed",
          lineHeight: 0.9,
          marginBottom: 20
        }}
      >
        ELEVATE
        <br />
        <span
          style={{
            WebkitTextStroke: "2px rgba(200,169,110,0.65)",
            color: "transparent"
          }}
        >
          YOUR
        </span>
        <br />
        STYLE.
      </motion.h1>

      <motion.p
        variants={fadeUp}
        style={{
          color: "rgba(242,241,237,0.48)",
          fontSize: 13,
          lineHeight: 1.7,
          fontWeight: 300,
          maxWidth: 320,
          marginBottom: 28
        }}
      >
        High-performance activewear engineered for the relentless.
        Designed to move, built to last.
      </motion.p>

      <motion.div
        variants={fadeUp}
        style={{ display: "flex", flexWrap: "wrap", gap: 12 }}
      >
        <button
          className="btn-dark"
          onClick={() => navigate("/products/men")}
        >
          Shop Men <ArrowRight size={13} />
        </button>

        <button
          className="btn-ghost-light"
          onClick={() => navigate("/products/women")}
        >
          Shop Women
        </button>
      </motion.div>
    </motion.div>

    {/* scroll cue */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        zIndex: 2
      }}
    >
      <div
        style={{
          width: 1,
          height: 30,
          background:
            "linear-gradient(to bottom, transparent, rgba(200,169,110,0.5))"
        }}
      />
      <span
        style={{
          fontSize: 8,
          letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.28)",
          textTransform: "uppercase",
          writingMode: "vertical-rl"
        }}
      >
        Scroll
      </span>
    </motion.div>
  </div>

  {/* RIGHT — hero image */}
  <div
    className="hero-img-panel"
    style={{
      position: "relative",
      height: "100%"
    }}
  >
    <img
      src="https://res.cloudinary.com/diyesfihd/image/upload/v1772714388/gym_poster_q6gjkl.jpg"
      alt="Athlete in premium workout wear"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }}
    />

    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(to right, rgba(10,10,10,0.22) 0%, transparent 30%, transparent 70%, rgba(10,10,10,0.12) 100%)"
      }}
    />

    {/* floating product callout */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.1 }}
      style={{
        position: "absolute",
        bottom: 28,
        left: 20,
        background: "rgba(10,10,10,0.72)",
        backdropFilter: "blur(14px)",
        padding: "14px 18px",
        borderLeft: "2px solid var(--accent)"
      }}
    >
      <p
        style={{
          fontSize: 9,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          marginBottom: 6,
          fontFamily: "'DM Sans',sans-serif"
        }}
      >
        Bestseller
      </p>

      <p
        className="disp"
        style={{
          fontSize: "1rem",
          fontWeight: 800,
          color: "#f2f1ed"
        }}
      >
        FLEXCORE™ SERIES
      </p>

      <p
        style={{
          fontSize: 10,
          color: "var(--accent)",
          marginTop: 4,
          letterSpacing: "0.1em",
          fontFamily: "'DM Sans',sans-serif"
        }}
      >
        4-Way Stretch · Moisture-Wicking
      </p>
    </motion.div>
  </div>
</section>


        {/* ══════════════════ TICKER ══════════════════ */}
        <div style={{ overflow: 'hidden', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)', padding: '13px 0', background: '#fff' }}>
          <div className="ticker-track">
            {[...TICKER,...TICKER,...TICKER,...TICKER].map((item, i) => (
              <span key={i} className="ticker-item">
                {item}<span style={{ color: 'var(--accent)', margin: '0 10px', opacity: 1 }}>✦</span>
              </span>
            ))}
          </div>
        </div>


        {/* ══════════════════ STATS ══════════════════ */}
        <section style={{ background: 'var(--chalk)', padding: '100px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(24px,6vw,64px)' }}>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
              <motion.div variants={fadeUp}><Label>By the numbers</Label></motion.div>
              <motion.div
                variants={stagger}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}
              >
                {[
                  { icon: <User size={18} />,        value: 2500,  suffix: 'K+', label: 'Fit Customers',     sub: 'Worldwide community' },
                  { icon: <ShoppingBag size={18} />, value: 5000,  suffix: '+',  label: 'Activewear Styles', sub: 'Curated selections' },
                  { icon: <ShoppingBag size={18} />, value: 10000, suffix: '+',  label: 'Orders Delivered',  sub: 'And counting' },
                ].map((s, i) => (
                  <motion.div key={i} variants={fadeUp} className="stat-card">
                    <div style={{ color: 'rgba(200,169,110,0.65)', marginBottom: 22 }}>{s.icon}</div>
                    <div className="disp" style={{ fontSize: 'clamp(3rem,5vw,4.2rem)', fontWeight: 900, lineHeight: 1, color: '#fff', marginBottom: 8 }}>
                      <CountUp from={0} to={s.value} separator="," direction="up" duration={2} className="count-up-text" />{s.suffix}
                    </div>
                    <p style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(242,241,237,0.72)', marginBottom: 4, fontWeight: 500 }}>{s.label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(242,241,237,0.32)' }}>{s.sub}</p>
                    <div className="stat-bar" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* ══════════════════ CATEGORY SPLIT ══════════════════ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: 2
          }}
        >
          {[
            { label: "MEN'S",   sub: 'Performance & Style', img: 'https://res.cloudinary.com/diyesfihd/image/upload/v1772714700/poster-1_keutqp.jpg', path: '/products/men'   },
            { label: "WOMEN'S", sub: 'Fit for Every Rep',   img: 'https://res.cloudinary.com/diyesfihd/image/upload/v1772714700/poster-2_glinyy.jpg', path: '/products/women' },
          ].map((cat, i) => (
            <motion.div key={i} className="cat-card" style={{ height: 580}} onClick={() => navigate(cat.path)}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.15 }}>
              <img src={cat.img} alt={cat.label} />
              <div className="cat-overlay" />
              <div className="cat-label">
                <p style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{cat.sub}</p>
                <p className="disp" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 900, color: '#f2f1ed', lineHeight: 0.9, marginBottom: 20 }}>{cat.label}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', fontFamily: "'DM Sans',sans-serif" }}>Shop Now</span>
                  <span className="cat-arrow"><ArrowRight size={14} color="#fff" /></span>
                </div>
              </div>
            </motion.div>
          ))}
        </section>


        {/* ══════════════════ FEATURED PRODUCTS ══════════════════ */}
        <section style={{ background: '#fff', padding: '100px 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(24px,6vw,64px)' }}>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 56 }}>
              <div>
                <motion.div variants={fadeUp}><Label>Curated Selection</Label></motion.div>
                <motion.h2 variants={fadeUp} className="disp" style={{ fontSize: 'clamp(3rem,6vw,5rem)', fontWeight: 900, lineHeight: 0.9 }}>
                  FEATURED<br />PRODUCTS
                </motion.h2>
              </div>
              <motion.p variants={fadeUp} style={{ maxWidth: 270, color: 'var(--mid)', fontSize: 13, lineHeight: 1.85, fontWeight: 300 }}>
                Our most popular items, selected for those who demand excellence in every rep.
              </motion.p>
            </motion.div>

            {featuredLoading ? <FeaturedProductsSkeleton /> : (
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                {featuredProducts.map((product, i) => (
                  <motion.div key={product.id} variants={fadeUp} className="prod-wrap"
                    style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${product.slug}`)}>
                    <img src={product.image1} alt="" className="img-a" />
                    {product.image2 && <img src={product.image2} alt="" className="img-b" />}
                    <div className="prod-cta">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>View Product</span>
                        <ArrowRight size={11} color="#fff" />
                      </div>
                    </div>
                    <span className="prod-idx">{String(i + 1).padStart(2, '0')}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              style={{ textAlign: 'center', marginTop: 56 }}>
              <button className="btn-ghost-dark" onClick={() => navigate('/products/all')}>
                View Full Collection <ArrowRight size={13} />
              </button>
            </motion.div>
          </div>
        </section>


        {/* ══════════════════ SCROLL VELOCITY ══════════════════ */}
        <div className="vel-wrap">
          <ScrollVelocity texts={['Train Hard', 'Performance Meets Style', 'Gear Up for Greatness']} velocity={30} className="custom-scroll-text" />
        </div>


        {/* ══════════════════ VIDEO (second) ══════════════════ */}
        <section className="grain" style={{ position: 'relative', overflow: 'hidden', background: 'var(--ink)' }}>
          <video src={sampleVideo2} autoPlay loop muted playsInline style={{ width: '100%', display: 'block', maxHeight: '80vh', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 clamp(24px,6vw,72px) clamp(32px,5vw,56px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, background: 'linear-gradient(to top, rgba(10,10,10,0.78), transparent)' }}>
            <p className="disp" style={{ fontSize: 'clamp(2.2rem,6vw,5rem)', fontWeight: 900, color: '#f2f1ed', letterSpacing: '0.03em', lineHeight: 0.9 }}>
              BUILT FOR<br />THE BOLD
            </p>
            <button className="btn-ghost-light" style={{ flexShrink: 0 }} onClick={() => navigate('/products/all')}>
              Shop Now <ArrowRight size={12} />
            </button>
          </div>
        </section>


        {/* ══════════════════ FEATURES ══════════════════ */}
        <section style={{ background: 'var(--chalk)', padding: '100px clamp(24px,6vw,64px)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
              <motion.div variants={fadeUp}><Label>Why Us</Label></motion.div>
              <motion.div variants={stagger} className="feat-row">
                {[
                  { icon: <Truck size={20} />,  title: 'Free Shipping',  desc: 'Complimentary delivery on all orders over $100, worldwide.' },
                  { icon: <Shield size={20} />, title: 'Secure Payment', desc: '100% encrypted and secure payment processing, always.' },
                  { icon: <Clock size={20} />,  title: '24/7 Support',   desc: 'Our dedicated team is here whenever you need us.' },
                ].map((f, i) => (
                  <motion.div key={i} variants={fadeUp} className="feat-cell">
                    <div className="feat-icon-ring"><span style={{ color: 'var(--accent)' }}>{f.icon}</span></div>
                    <h3 className="disp" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, letterSpacing: '0.04em' }}>{f.title}</h3>
                    <p style={{ color: 'var(--mid)', fontSize: 13, lineHeight: 1.8, fontWeight: 300 }}>{f.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* ══════════════════ TESTIMONIALS ══════════════════ */}
        <section style={{ background: 'var(--ink)', padding: '100px clamp(24px,6vw,64px)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              style={{ textAlign: 'center', marginBottom: 56 }}>
              <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                <span className="rule-h" style={{ background: 'var(--accent)' }} />
                <span className="tag" style={{ borderColor: 'rgba(200,169,110,0.4)', color: 'var(--accent)' }}>Testimonials</span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="disp" style={{ fontSize: 'clamp(2.8rem,6vw,4.5rem)', fontWeight: 900, color: '#f2f1ed', lineHeight: 0.88 }}>
                WHAT OUR<br />CUSTOMERS SAY
              </motion.h2>
            </motion.div>

            <div style={{ position: 'relative' }}>
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="testi-wrap">
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '5.5rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 0.8, marginBottom: 24, opacity: 0.28, textAlign: 'center' }}>"</div>
                  <p style={{ color: 'rgba(242,241,237,0.72)', fontSize: '1.05rem', lineHeight: 1.85, fontWeight: 300, textAlign: 'center', maxWidth: 520, margin: '0 auto 32px', fontStyle: 'italic' }}>
                    {testimonials[currentSlide].text}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <img src={testimonials[currentSlide].avatar} alt={testimonials[currentSlide].name}
                      style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(200,169,110,0.4)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#f2f1ed', fontSize: 13, fontWeight: 500, letterSpacing: '0.05em' }}>{testimonials[currentSlide].name}</p>
                      <p style={{ color: 'var(--mid)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>{testimonials[currentSlide].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {[{ fn: prevSlide, side: 'left',  Icon: ArrowLeft  },
                { fn: nextSlide, side: 'right', Icon: RightArrow }].map(({ fn, side, Icon }) => (
                <button key={side} onClick={fn}
                  style={{ position: 'absolute', [side]: -18, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.25s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,169,110,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  <Icon size={14} />
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  style={{ width: i === currentSlide ? 22 : 6, height: 6, borderRadius: 3, background: i === currentSlide ? 'var(--accent)' : 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>
        </section>

      </div>
    </GymLoader>
  );
}