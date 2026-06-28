import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useScroll } from "framer-motion";
import { ExternalLink, ChevronDown, Pause, Play, RotateCcw } from "lucide-react";
import Lenis from "lenis";
import { useT, useLang } from "./i18n.jsx";

// ── SCROLL PROGRESS ───────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 280, damping: 28 });
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position:"fixed",bottom:0,left:0,right:0,height:"2.5px",
        background:"linear-gradient(90deg,#7c3aed,#a855f7,#e879f9)",
        transformOrigin:"0%",scaleX,zIndex:200,
        boxShadow:"0 0 14px rgba(168,85,247,.8)",
        pointerEvents:"none",
      }}
    />
  );
}

// ── SPLASH SCREEN ────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  return (
    <motion.div
      className="splash"
      exit={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="splash-logo"
        initial={{ opacity: 0, y: 28, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <span className="splash-name">AlemX</span>
        <span className="splash-num">#33655</span>
      </motion.div>
      <motion.p
        className="splash-tag"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.5 }}
      >FTC Robotics Team · Mangistau</motion.p>
      <motion.div
        className="splash-track"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <motion.div
          className="splash-bar"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.65, duration: 1.1, ease: "easeInOut" }}
          onAnimationComplete={onDone}
        />
      </motion.div>
    </motion.div>
  );
}

// ── HERO PARTICLES ────────────────────────────────────────────────────
const PARTICLES = [
  {x:"7%",  y:"18%", s:3, dur:3.8, delay:0,   dy:-22, dx:10  },
  {x:"17%", y:"72%", s:2, dur:4.5, delay:0.4, dy:-18, dx:-8  },
  {x:"26%", y:"38%", s:4, dur:3.2, delay:0.8, dy:-28, dx:6   },
  {x:"43%", y:"14%", s:2, dur:5.1, delay:1.2, dy:-14, dx:-12 },
  {x:"56%", y:"62%", s:3, dur:4.0, delay:0.6, dy:-20, dx:8   },
  {x:"66%", y:"28%", s:2, dur:3.6, delay:1.5, dy:-16, dx:-6  },
  {x:"73%", y:"80%", s:4, dur:4.8, delay:0.2, dy:-25, dx:10  },
  {x:"83%", y:"44%", s:3, dur:3.4, delay:1.0, dy:-19, dx:-9  },
  {x:"91%", y:"24%", s:2, dur:5.0, delay:0.7, dy:-12, dx:7   },
  {x:"49%", y:"87%", s:3, dur:4.2, delay:1.8, dy:-22, dx:-4  },
  {x:"34%", y:"54%", s:2, dur:3.9, delay:2.1, dy:-15, dx:11  },
  {x:"79%", y:"66%", s:4, dur:4.6, delay:0.3, dy:-26, dx:-7  },
  {x:"12%", y:"50%", s:3, dur:4.3, delay:1.6, dy:-20, dx:5   },
  {x:"60%", y:"90%", s:2, dur:3.7, delay:0.9, dy:-17, dx:-10 },
];

function HeroParticles() {
  return (
    <div className="hero-particles" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="hero-particle"
          style={{ left:p.x, top:p.y, width:p.s, height:p.s }}
          animate={{ y:[0,p.dy,0], x:[0,p.dx,0], opacity:[0.15,0.65,0.15], scale:[1,1.5,1] }}
          transition={{ duration:p.dur, delay:p.delay, repeat:Infinity, ease:"easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── NAV ──────────────────────────────────────────────────────────────
const navItems = [
  { key: "nav.team",         href: "#team" },
  { key: "nav.robot",        href: "#robot" },
  { key: "nav.auto",         href: "#auto" },
  { key: "nav.portfolio",    href: "#portfolio" },
  { key: "nav.season",    href: "#timeline" },
];

// ── DATA ──────────────────────────────────────────────────────────────
const teamMembers = [
  { name: "Buxarbaev Zhaxan",   role: "Mentor",            img: "https://i.ibb.co.com/r2rX1ryJ/Zhaxan.jpg" },
  { name: "Zholbatyrov Elaman", role: "Mentor",            img: "https://i.ibb.co.com/8g6Dz5yS/Elaman.jpg" },
  { name: "Alisher",            role: "Captain · Engineer",img: "https://i.ibb.co.com/hJY7nLB3/Alisher.jpg" },
  { name: "Nurdaulet",          role: "Engineer",          img: "https://i.ibb.co.com/rLTctj6/nurda.jpg" },
  { name: "Zhaqsylyq",          role: "Main Coder",        img: "https://i.ibb.co.com/3m4s1rSg/Zhorikk.jpg" },
  { name: "Merey",              role: "Main Coder",        img: "https://i.ibb.co.com/nMSXzT58/Merey.jpg" },
  { name: "Zhienbek",           role: "Junior Coder",      img: "https://i.ibb.co.com/Kj4YVMYk/zhora.jpg" },
  { name: "Tamerlan",           role: "Designer",          img: "https://i.ibb.co.com/6JpzNW7D/Tamer.jpg" },
  { name: "Zhandos",            role: "Auto Coder",        img: "https://i.ibb.co.com/5WJwH14n/Zhandos.jpg" },
  { name: "Sabina",             role: "SMM",               img: "https://i.ibb.co.com/JR9ZR9Sj/sssabina.jpg" },
  { name: "Tannur",             role: "SMM",               img: "https://i.ibb.co.com/bgmkFzPz/Tannur.jpg" },
];

const stats = [
  { num: 10,  suffix: "+", lk: "stats.members" },
  { num: 200, suffix: "+", lk: "stats.hours" },
  { num: 3,   suffix: "",  lk: "stats.paths" },
  { num: 6,   suffix: "",  lk: "stats.months" },
];

const achievements = [
  { img: "https://i.ibb.co.com/FL6VpSFD/news.jpg",  titleKey: "ach.0.title", subKey: "ach.0.sub", tagKey: "ach.0.tag" },
  { img: "https://i.ibb.co.com/dwTTmRY3/Batys.jpg", titleKey: "ach.1.title", subKey: "ach.1.sub", tagKey: "ach.1.tag" },
  { img: "https://i.ibb.co.com/Hpr2LPrM/ftc.jpg",   titleKey: "ach.2.title", subKey: "ach.2.sub", tagKey: "ach.2.tag" },
  { img: "https://picsum.photos/seed/dip4/900/560",  titleKey: "ach.3.title", subKey: "ach.3.sub", tagKey: "ach.3.tag" },
];

const portfolioItems = [
  { title: "Портфолио",            sub: "AlemX #33655 · Основное",   href: "https://canva.link/y61tz7v37q6bnkt",  grad: "135deg, #7c3aed 0%, #a855f7 40%, #c084fc 100%" },
  { title: "Engineering Portfolio", sub: "AlemX #33655 · Инженерное", href: "https://canva.link/ouqtylruru8b0cr", grad: "135deg, #1e1b4b 0%, #4c1d95 40%, #7c3aed 100%" },
];

const robotSpecs = [
  { label: "Drive Train", value: "Mecanum 4WD" },
  { label: "Auto Path",   value: "Pedro Pathing" },
  { label: "Motors",      value: "REV × 4" },
  { label: "Season",      value: "DECODE 2025" },
];

const timeline = [
  { dateKey: "tl.0.date", phaseKey: "tl.0.phase", descKey: "tl.0.desc", col: "#a855f7" },
  { dateKey: "tl.1.date", phaseKey: "tl.1.phase", descKey: "tl.1.desc", col: "#7c3aed" },
  { dateKey: "tl.2.date", phaseKey: "tl.2.phase", descKey: "tl.2.desc", col: "#c084fc" },
  { dateKey: "tl.3.date", phaseKey: "tl.3.phase", descKey: "tl.3.desc", col: "#ffc516" },
  { dateKey: "tl.4.date", phaseKey: "tl.4.phase", descKey: "tl.4.desc", col: "#f472b6" },
];

// ── PEDRO PATHING FIELD UTILS ─────────────────────────────────────────
// Pedro coords: 0–141.5 inches. Origin = bottom-left corner.
// Y is flipped for screen (y=0 → bottom of image, y=141.5 → top).
const FIELD    = 141.5;
const SZ       = 600;
const ROBOT_PX = Math.round((16 / FIELD) * SZ);

function toSx(x) { return (x / FIELD) * SZ; }
function toSy(y) { return SZ - (y / FIELD) * SZ; }
function psvg(p) { return { sx: toSx(p.x), sy: toSy(p.y) }; }

// Key poses from AutoRed.java (x, y in inches; deg = heading in degrees)
const P = {
  start:    { x: 105,                  y: 134,                 deg: 0  },
  shoot:    { x: 93.2111801242236,     y: 83.95496894409939,   deg: 0  },
  c1:       { x: 124,                  y: 64,                  deg: 0  },
  ctrl1:    { x: 84.59549689440996,    y: 62,                  deg: 0  },
  rCtrl1:   { x: 105.24245016260936,   y: 71.7388417843294,    deg: 0  },
  c2:       { x: 119,                  y: 93,                  deg: 0  },
  gate:     { x: 127,                  y: 66.5,                deg: 20 },
  gateDeep: { x: 130.22558355503236,   y: 58.46836679847239,   deg: 0  },
  gateCtrl: { x: 124.81271413776464,   y: 58.211667871285876,  deg: 0  },
  park:     { x: 108,                  y: 58,                  deg: 0  },
};

// Full path sequence matching AutoRed.java state machine
const AUTO_SEGMENTS = [
  { type:'line',   p0:P.start,    p2:P.shoot,                    col:'#ffc516', state:'START'  },
  { type:'bezier', p0:P.shoot,    p1:P.ctrl1,    p2:P.c1,        col:'#a855f7', state:'COL 1'  },
  { type:'bezier', p0:P.c1,       p1:P.rCtrl1,   p2:P.shoot,     col:'#f472b6', state:'RET 1'  },
  { type:'line',   p0:P.shoot,    p2:P.c2,                       col:'#a855f7', state:'COL 2'  },
  { type:'line',   p0:P.c2,       p2:P.shoot,                    col:'#f472b6', state:'RET 2'  },
  { type:'line',   p0:P.shoot,    p2:P.gate,                     col:'#a855f7', state:'COL 3'  },
  { type:'bezier', p0:P.gate,     p1:P.gateCtrl, p2:P.gateDeep,  col:'#c084fc', state:'GATE'   },
  { type:'line',   p0:P.gateDeep, p2:P.shoot,                    col:'#f472b6', state:'RET 3'  },
  { type:'line',   p0:P.shoot,    p2:P.gate,                     col:'#a855f7', state:'COL 4'  },
  { type:'bezier', p0:P.gate,     p1:P.gateCtrl, p2:P.gateDeep,  col:'#c084fc', state:'GATE'   },
  { type:'line',   p0:P.gateDeep, p2:P.shoot,                    col:'#f472b6', state:'RET 4'  },
  { type:'line',   p0:P.shoot,    p2:P.park,                     col:'#7c3aed', state:'PARK'   },
];

// Named waypoints shown as labels on the field
const FIELD_WAYPOINTS = [
  { p: P.start,    label: 'START', col: '#ffc516' },
  { p: P.shoot,    label: 'SHOOT', col: '#ef4444' },
  { p: P.c1,       label: '#1',    col: '#a855f7' },
  { p: P.c2,       label: '#2',    col: '#a855f7' },
  { p: P.gate,     label: 'GATE',  col: '#c084fc' },
  { p: P.gateDeep, label: 'DEEP',  col: '#c084fc' },
  { p: P.park,     label: 'PARK',  col: '#7c3aed' },
];

// Build SVG path string for a segment (line or quadratic Bezier)
function segD(s) {
  const sp0 = psvg(s.p0), sp2 = psvg(s.p2);
  if (s.type === 'bezier' && s.p1) {
    const sp1 = psvg(s.p1);
    return `M${sp0.sx.toFixed(1)},${sp0.sy.toFixed(1)} Q${sp1.sx.toFixed(1)},${sp1.sy.toFixed(1)} ${sp2.sx.toFixed(1)},${sp2.sy.toFixed(1)}`;
  }
  return `M${sp0.sx.toFixed(1)},${sp0.sy.toFixed(1)} L${sp2.sx.toFixed(1)},${sp2.sy.toFixed(1)}`;
}

// Pre-sample the full path into a polyline for smooth animation
const SPP = 60;

function buildAutoPoly() {
  const pts = [];
  for (let si = 0; si < AUTO_SEGMENTS.length; si++) {
    const s = AUTO_SEGMENTS[si];
    const sp0 = psvg(s.p0), sp2 = psvg(s.p2);
    const sp1 = s.p1 ? psvg(s.p1) : null;
    const h0 = s.p0.deg, h2 = s.p2.deg;
    for (let i = (si === 0 ? 0 : 1); i <= SPP; i++) {
      const t = i / SPP;
      let px, py;
      if (s.type === 'bezier' && sp1) {
        const mt = 1 - t;
        px = mt*mt*sp0.sx + 2*mt*t*sp1.sx + t*t*sp2.sx;
        py = mt*mt*sp0.sy + 2*mt*t*sp1.sy + t*t*sp2.sy;
      } else {
        px = sp0.sx + (sp2.sx - sp0.sx) * t;
        py = sp0.sy + (sp2.sy - sp0.sy) * t;
      }
      pts.push({ sx: px, sy: py, segIdx: si, hdeg: h0 + (h2 - h0) * t });
    }
  }
  return pts;
}

function buildDistTable(pts) {
  const dist = [0];
  for (let i = 1; i < pts.length; i++)
    dist.push(dist[i-1] + Math.hypot(pts[i].sx - pts[i-1].sx, pts[i].sy - pts[i-1].sy));
  return dist;
}

const AUTO_POLY = buildAutoPoly();
const AUTO_DIST = buildDistTable(AUTO_POLY);

function lerpAutoPoly(t) {
  const total  = AUTO_DIST[AUTO_DIST.length - 1];
  const target = total * t;
  let lo = 0, hi = AUTO_DIST.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (AUTO_DIST[mid] < target) lo = mid; else hi = mid;
  }
  const span = AUTO_DIST[hi] - AUTO_DIST[lo];
  const r    = span > 0 ? (target - AUTO_DIST[lo]) / span : 0;
  const a    = AUTO_POLY[lo];
  const b    = AUTO_POLY[Math.min(hi, AUTO_POLY.length - 1)];
  return {
    sx:       a.sx + (b.sx - a.sx) * r,
    sy:       a.sy + (b.sy - a.sy) * r,
    svgAngle: Math.atan2(b.sy - a.sy, b.sx - a.sx) * 180 / Math.PI,
    hdeg:     a.hdeg + (b.hdeg - a.hdeg) * r,
    segIdx:   a.segIdx,
  };
}

// ── SOCIAL ICONS ─────────────────────────────────────────────────────
const IconIG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);
const IconTG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
  </svg>
);
const IconYT = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
);
const IconGH = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const socials = [
  { label: "Instagram", href: "https://instagram.com/alemx33655",   Icon: IconIG },
  { label: "Telegram",  href: "https://t.me/alemx33655",            Icon: IconTG },
  { label: "YouTube",   href: "https://youtube.com/@alemx33655",    Icon: IconYT },
  { label: "GitHub",    href: "https://github.com/alemx33655",      Icon: IconGH },
];


// ── LANG SWITCHER ─────────────────────────────────────────────────────
function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-sw">
      {["kz", "ru", "en"].map(l => (
        <button key={l} className={`lang-btn${lang === l ? " lang-btn--on" : ""}`} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────────
function Navbar({ scrollY }) {
  const t       = useT();
  const opacity = useTransform(scrollY, [100, 360], [0, 1]);
  const y       = useTransform(scrollY, [100, 360], [22, 0]);
  const width   = useTransform(scrollY, [100, 360], ["8rem", "calc(100% - 2rem)"]);
  const linksOp = useTransform(scrollY, [280, 430], [0, 1]);
  const linksX  = useTransform(scrollY, [280, 430], [12, 0]);

  return (
    <motion.header className="site-header" style={{ opacity, y, width }}>
      <a className="brand-mark" href="#top">AlemX <span>#33655</span></a>
      <motion.nav className="site-nav" style={{ opacity: linksOp, x: linksX }}>
        {navItems.map(n => <a key={n.href} href={n.href}>{t(n.key)}</a>)}
      </motion.nav>
      <LangSwitcher />
    </motion.header>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────
function Hero({ scrollY }) {
  const t = useT();
  const scale   = useTransform(scrollY, [0, 380], [1, 0.78]);
  const opacity = useTransform(scrollY, [40, 360], [1, 0]);
  const textY   = useTransform(scrollY, [0, 420], [0, -130]);
  const robotY  = useTransform(scrollY, [0, 420], [0, -42]);

  return (
    <section className="hero-section" id="top">
      <div className="hero-bg" aria-hidden="true" />
      <HeroParticles />

      {/* 2 floating logos */}
      <div className="hero-float-logos" aria-hidden="true">
        {[
          { src: "https://i.ibb.co.com/99zxvwKy/image-removebg-preview.png",  cls: "hero-float-logo--1", dy: -8,  dur: 3.8 },
          { src: "https://i.ibb.co.com/LX6mNMLt/image-removebg-preview-1.png", cls: "hero-float-logo--2", dy: -6,  dur: 4.4 },
        ].map(({ src, cls, dy, dur }, i) => (
          <motion.img
            key={i}
            src={src}
            alt=""
            className={`hero-float-logo ${cls}`}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.88, scale: 1, y: [0, dy, 0] }}
            transition={{
              opacity: { delay: 0.9 + i * 0.15, duration: 0.6 },
              scale:   { delay: 0.9 + i * 0.15, duration: 0.6 },
              y:       { delay: 1.2, duration: dur, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        ))}
      </div>

      <motion.div
        className="hero-center"
        style={{ scale, opacity }}
        initial={{ opacity: 0, filter: "blur(18px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left: text — moves faster on scroll */}
        <motion.div className="hero-text" style={{ y: textY }}>
          <motion.p
            className="hero-tag"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t("hero.tag")}
          </motion.p>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            ALEMX
            <span>#33655</span>
          </motion.h1>

          <motion.div
            className="hero-line"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.62, duration: 0.65 }}
          />

          <motion.div
            className="hero-scroll-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown size={20} />
            </motion.div>
            <span>Scroll</span>
          </motion.div>
        </motion.div>

        {/* Right: robot PNG — moves slower on scroll */}
        <motion.div className="hero-robot-col" style={{ y: robotY }}>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.46, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.img
              src="https://allwebs.ru/images/2026/06/28/03b86a2a75b11c48e1f5c1bdad7d9257.png"
              alt="AlemX #33655 Robot"
              className="hero-robot-img"
              animate={{ y: [0, -16, 0] }}
              transition={{ delay: 1.3, duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── ROBOT BLUEPRINT ───────────────────────────────────────────────────
function RobotStage() {
  const t = useT();
  return (
    <motion.div
      className="robot-stage"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bp">
        <div className="bp__grid" />
        <div className="bp__line bp__line--h" /><div className="bp__line bp__line--v" />
        <div className="bp__c bp__c--1" /><div className="bp__c bp__c--2" /><div className="bp__c bp__c--3" />
        <div className="bp__corners"><span/><span/><span/><span/></div>
        <div className="bp__lbl bp__lbl--top">AlemX #33655</div>
        <div className="bp__lbl bp__lbl--rt">FTC Robot</div>
        <div className="bp__box">
          <strong>3D</strong>
          <small>{t("bp.soon")}</small>
        </div>
      </div>
    </motion.div>
  );
}

// ── TEAM ──────────────────────────────────────────────────────────────
function TeamMember({ m, i }) {
  const rotXRaw = useMotionValue(0);
  const rotYRaw = useMotionValue(0);
  const rotX = useSpring(rotXRaw, { stiffness: 260, damping: 22 });
  const rotY = useSpring(rotYRaw, { stiffness: 260, damping: 22 });

  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    rotXRaw.set(((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -9);
    rotYRaw.set(((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  9);
  };
  const onLeave = () => { rotXRaw.set(0); rotYRaw.set(0); };

  return (
    <motion.div
      className="member"
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 700 }}
      initial={{ opacity: 0, y: 55, scale: 0.78 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.72, delay: i * 0.055, ease: [0.34, 1.56, 0.64, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="member__avatar">
        <img src={m.img} alt={m.name} loading="lazy" />
      </div>
      <div className="member__overlay" />
      <div className="member__info">
        <p className="member__name">{m.name}</p>
        <span className="member__role">{m.role}</span>
      </div>
    </motion.div>
  );
}

// ── PEDRO PATHING VISUALIZER ──────────────────────────────────────────
function PedroVisualizer() {
  const t = useT();
  const [running, setRunning] = useState(true);
  const [prog, setProg]       = useState(0);
  const progRef               = useRef(0);

  useEffect(() => {
    let raf, last = 0;
    const tick = ts => {
      if (running) {
        if (last) { progRef.current = (progRef.current + (ts - last) / 18000) % 1; setProg(progRef.current); }
        last = ts;
      } else { last = 0; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const bot  = useMemo(() => lerpAutoPoly(prog), [prog]);
  const half = ROBOT_PX / 2;
  const seg  = AUTO_SEGMENTS[bot?.segIdx ?? 0];

  const inX = bot ? (bot.sx / SZ * FIELD).toFixed(2) : "0.00";
  const inY = bot ? ((SZ - bot.sy) / SZ * FIELD).toFixed(2) : "0.00";
  const hdg = bot ? bot.hdeg.toFixed(1) : "0.0";

  return (
    <motion.div
      className="pedro"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="pedro__header">
        <div>
          <span className="eyebrow">Pedro Pathing</span>
          <h3>Auto Field Visualizer</h3>
          <p>{t("pedro.sub")}</p>
        </div>
        <div className="pedro__legend">
          <span><i className="dot" style={{background:'#a855f7'}}/>Collect</span>
          <span><i className="dot" style={{background:'#f472b6'}}/>Return</span>
          <span><i className="dot" style={{background:'#ffc516'}}/>Start</span>
        </div>
      </div>

      <div className="pedro__field">
        <svg viewBox={`0 0 ${SZ} ${SZ}`} className="pedro__svg">
          <defs>
            <pattern id="robotHatch" patternUnits="userSpaceOnUse" width="10" height="10"
              patternTransform="rotate(45 0 0)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#f472b6" strokeWidth="2" strokeOpacity="0.65"/>
            </pattern>
            <clipPath id="robotClip">
              <rect x={-half} y={-half} width={ROBOT_PX} height={ROBOT_PX} rx="3"/>
            </clipPath>
            <filter id="glowBot" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glowLine" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <image href="/decode.webp" x="0" y="0" width={SZ} height={SZ}/>

          {/* Each segment: glow halo + coloured line */}
          {AUTO_SEGMENTS.map((s, i) => (
            <g key={i}>
              <path d={segD(s)} fill="none" stroke={s.col} strokeWidth="22" strokeOpacity="0.13"
                strokeLinecap="round" strokeLinejoin="round"/>
              <path d={segD(s)} fill="none" stroke={s.col} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" filter="url(#glowLine)"/>
            </g>
          ))}

          {/* Key waypoint dots + labels */}
          {FIELD_WAYPOINTS.map((wp, i) => {
            const { sx: wx, sy: wy } = psvg(wp.p);
            return (
              <g key={i}>
                <circle cx={wx} cy={wy} r="10" fill={wp.col} fillOpacity="0.18"/>
                <circle cx={wx} cy={wy} r="5"  fill={wp.col}/>
                <circle cx={wx} cy={wy} r="10" fill="none" stroke={wp.col} strokeWidth="1.5" strokeOpacity="0.6"/>
                <text x={wx} y={wy - 13} textAnchor="middle"
                  fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace"
                  stroke="rgba(0,0,0,0.85)" strokeWidth="3" paintOrder="stroke">
                  {wp.label}
                </text>
              </g>
            );
          })}

          {/* Animated robot */}
          {bot && (
            <g transform={`translate(${bot.sx},${bot.sy}) rotate(${bot.svgAngle})`}
               filter="url(#glowBot)">
              <rect x={-half} y={-half} width={ROBOT_PX} height={ROBOT_PX} rx="3"
                fill="url(#robotHatch)" clipPath="url(#robotClip)"/>
              <rect x={-half} y={-half} width={ROBOT_PX} height={ROBOT_PX} rx="3"
                fill="none" stroke="#f472b6" strokeWidth="3"/>
              <circle cx="0" cy="0" r="5" fill="#ffc516"/>
              {/* Direction arrow */}
              <line x1="0" y1="0" x2={half + 6} y2="0" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.85"/>
              <polygon points={`${half+6},-3 ${half+12},0 ${half+6},3`} fill="#fff" fillOpacity="0.85"/>
            </g>
          )}
        </svg>
      </div>

      <div className="pedro__controls">
        <button className="ctrl-btn" onClick={() => setRunning(v => !v)}>
          {running ? <Pause size={14}/> : <Play size={14}/>} {running ? t("btn.pause") : t("btn.play")}
        </button>
        <button className="ctrl-btn" onClick={() => { progRef.current = 0; setProg(0); setRunning(true); }}>
          <RotateCcw size={14}/> {t("btn.restart")}
        </button>
      </div>

      <div className="pedro__stats">
        {[
          ["X (in)", inX],
          ["Y (in)", inY],
          ["Heading", `${hdg}°`],
          ["State", seg?.state ?? "—"],
        ].map(([k, v]) => (
          <div key={k} className="pstat">
            <span>{k}</span><strong>{v}</strong>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── ANIMATED COUNTER ──────────────────────────────────────────────────
function CountStat({ num, suffix, label }) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);
  const elRef  = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true;
        let cur = 0;
        const step = Math.max(1, Math.ceil(num / 60));
        const timer = setInterval(() => {
          cur = Math.min(cur + step, num);
          setCount(cur);
          if (cur >= num) clearInterval(timer);
        }, 24);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [num]);

  return (
    <div className="stat-item" ref={elRef}>
      <div className="stat-num">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── ACHIEVEMENTS CAROUSEL ─────────────────────────────────────────────
function AchievementsCarousel() {
  const t = useT();
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const n = achievements.length;

  const go = useCallback((i) => {
    clearInterval(timerRef.current);
    setActive(i);
    timerRef.current = setInterval(() => setActive(p => (p + 1) % n), 4500);
  }, [n]);

  useEffect(() => {
    timerRef.current = setInterval(() => setActive(p => (p + 1) % n), 4500);
    return () => clearInterval(timerRef.current);
  }, [go, n]);

  const cur = achievements[active];

  return (
    <div className="ach-carousel">

      {/* Featured image */}
      <div className="ach-featured">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="ach-feat-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={cur.img} alt={t(cur.titleKey)} className="ach-feat-img" />
            <div className="ach-feat-overlay">
              <span className="ach-tag">{t(cur.tagKey)}</span>
              <div className="ach-feat-info">
                <motion.h3 initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1, duration:.3 }}>
                  {t(cur.titleKey)}
                </motion.h3>
                <motion.p initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.18, duration:.26 }}>
                  {t(cur.subKey)}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Overlay arrows */}
        <button className="ach-arrow ach-arrow--l" onClick={() => go((active - 1 + n) % n)} aria-label="Назад">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button className="ach-arrow ach-arrow--r" onClick={() => go((active + 1) % n)} aria-label="Вперёд">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="ach-progress">
        {achievements.map((_, i) => (
          <div key={i} className="ach-prog-seg">
            {i === active && (
              <motion.div
                className="ach-prog-fill"
                key={active}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 4.5, ease: "linear" }}
                style={{ transformOrigin: "left" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Circle navigation */}
      <div className="ach-circles">
        {achievements.map((item, i) => (
          <button key={i} className={`ach-circle${i === active ? " ach-circle--on" : ""}`}
            onClick={() => go(i)} aria-label={t(item.titleKey)}>
            <img src={item.img} alt={t(item.titleKey)} loading="lazy" />
          </button>
        ))}
      </div>

    </div>
  );
}

// ── PORTFOLIO ─────────────────────────────────────────────────────────
function PortfolioCard({ item, i }) {
  const t = useT();
  return (
    <motion.div
      className="pf-card"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.55, delay: i * 0.12 }}
    >
      <div className="pf-preview" style={{ background: `linear-gradient(${item.grad})` }}>
        <div className="pf-doc">
          <div className="pf-doc__top">
            <div className="pf-doc__brand">AlemX <em>#33655</em></div>
            <div className="pf-doc__tag">FTC 2024–25</div>
          </div>
          <div className="pf-doc__h">{item.title}</div>
          <div className="pf-doc__rows">
            {[88,72,80,60,68,45].map((w,k)=><div key={k} className="pf-doc__row" style={{width:`${w}%`}}/>)}
          </div>
          <div className="pf-doc__chart">
            {[55,70,40,85,60,75,50].map((h,k)=>(
              <div key={k} className="pf-doc__bar" style={{height:`${h}%`}}/>
            ))}
          </div>
        </div>
        <div className="pf-preview__corners"><span/><span/><span/><span/></div>
      </div>
      <div className="pf-footer">
        <div>
          <p className="pf-name">{item.title}</p>
          <p className="pf-sub">{item.sub}</p>
        </div>
        <a
          className="pf-btn"
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={14} /> {t("btn.open")}
        </a>
      </div>
    </motion.div>
  );
}

// ── TIMELINE ──────────────────────────────────────────────────────────
function TimelineItem({ item, i }) {
  const t = useT();
  const isRight = i % 2 === 0;
  const card = (
    <div className={`tl-content tl-content--${isRight ? "r" : "l"}`}>
      <span className="tl-date">{t(item.dateKey)}</span>
      <h4 className="tl-phase" style={{ color: item.col }}>{t(item.phaseKey)}</h4>
      <p className="tl-desc">{t(item.descKey)}</p>
    </div>
  );
  return (
    <motion.div
      className="tl-item"
      initial={{ opacity: 0, x: isRight ? 48 : -48 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
    >
      {isRight ? <div className="tl-gap" /> : card}
      <div className="tl-dot" style={{ background: item.col, boxShadow: `0 0 0 5px ${item.col}28, 0 0 18px ${item.col}50` }} />
      {isRight ? card : <div className="tl-gap" />}
    </motion.div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────
function Footer() {
  const t = useT();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5}}>
          <a className="brand-mark" href="#top">AlemX <span>#33655</span></a>
          <p className="footer-tag">{t("footer.tag")}</p>
        </motion.div>
        <motion.div className="footer-socials" initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.08}}>
          {socials.map(({label,href,Icon})=>(
            <a key={label} href={href} className="social-link" target="_blank" rel="noopener noreferrer" aria-label={label}>
              <Icon/><span>{label}</span>
            </a>
          ))}
        </motion.div>
        <motion.div className="footer-bottom" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:0.5,delay:0.14}}>
          <div className="footer-divider"/>
          <p className="footer-copy">{t("footer.copy")}</p>
        </motion.div>
      </div>
    </footer>
  );
}

// ── SECTION WRAPPER ───────────────────────────────────────────────────
function Sec({ id, eye, title, desc, children, cls="" }) {
  return (
    <section className={`section ${cls}`} id={id}>
      <div className="sec-head">
        <motion.span
          className="eyebrow"
          initial={{opacity:0, y:12, scale:0.88}}
          whileInView={{opacity:1, y:0, scale:1}}
          viewport={{once:true, amount:0.4}}
          transition={{duration:0.48, ease:[0.34,1.56,0.64,1]}}
        >{eye}</motion.span>
        <motion.h2
          initial={{opacity:0, y:32, filter:"blur(10px)"}}
          whileInView={{opacity:1, y:0, filter:"blur(0px)"}}
          viewport={{once:true, amount:0.3}}
          transition={{duration:0.65, delay:0.08, ease:[0.16,1,0.3,1]}}
        >{title}</motion.h2>
        {desc && (
          <motion.p
            initial={{opacity:0, y:16}}
            whileInView={{opacity:1, y:0}}
            viewport={{once:true, amount:0.3}}
            transition={{duration:0.55, delay:0.22}}
          >{desc}</motion.p>
        )}
      </div>
      {children}
    </section>
  );
}

// ── APP ───────────────────────────────────────────────────────────────
export default function App() {
  const t       = useT();
  const scrollY = useMotionValue(0);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const update = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [scrollY]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: x => Math.min(1, 1.001 - Math.pow(2, -10 * x)),
      smoothWheel: true,
    });
    let rafId;
    const raf = ts => { lenis.raf(ts); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, []);

  return (
    <div className="app-shell">
      <AnimatePresence>
        {splash && <SplashScreen key="splash" onDone={() => setSplash(false)} />}
      </AnimatePresence>
      <ScrollProgress />
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-grid" />

      <Navbar scrollY={scrollY} />

      <main>
        <Hero scrollY={scrollY} />

        <Sec id="robot" eye={t("sec.robot.eye")} title={t("sec.robot.title")} desc={t("sec.robot.desc")}>
          <RobotStage />
        </Sec>

        <Sec id="team" eye={t("sec.team.eye")} title={t("sec.team.title")} desc={t("sec.team.desc")}>
          {/* Mentors — featured row */}
          <div className="team-mentors">
            {teamMembers.filter(m => m.role === "Mentor").map((m, i) => (
              <TeamMember key={m.name} m={m} i={i} />
            ))}
          </div>
          {/* Core team */}
          <div className="team-grid">
            {teamMembers.filter(m => m.role !== "Mentor").map((m, i) => (
              <TeamMember key={m.name} m={m} i={i + 2} />
            ))}
          </div>
        </Sec>

        <Sec id="auto" eye={t("sec.auto.eye")} title={t("sec.auto.title")} desc={t("sec.auto.desc")}>
          <PedroVisualizer />
        </Sec>

        <Sec id="portfolio" eye={t("sec.portfolio.eye")} title={t("sec.portfolio.title")} desc={t("sec.portfolio.desc")}>
          <div className="pf-grid">
            {portfolioItems.map((item, i) => <PortfolioCard key={item.title} item={item} i={i} />)}
          </div>
        </Sec>

        <Sec id="timeline" eye={t("sec.timeline.eye")} title={t("sec.timeline.title")} desc={t("sec.timeline.desc")}>
          <div className="tl-wrap">
            <div className="tl-line" />
            {timeline.map((item, i) => <TimelineItem key={item.phase} item={item} i={i} />)}
          </div>
        </Sec>

        <Sec id="extras" eye={t("sec.extras.eye")} title={t("sec.extras.title")} desc={t("sec.extras.desc")}>
          <div className="stats-bar">
            {stats.map(s => <CountStat key={s.lk} num={s.num} suffix={s.suffix} label={t(s.lk)} />)}
          </div>
          <AchievementsCarousel />
        </Sec>
      </main>

      <Footer />
    </div>
  );
}
