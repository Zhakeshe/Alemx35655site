import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useScroll } from "framer-motion";
import { ExternalLink, ChevronDown, Pause, Play, RotateCcw, Eye, X, Send, MessageCircle } from "lucide-react";
import Lenis from "lenis";
import { useT, useLang } from "./i18n.jsx";
import { FIREBASE_READY, initFirebase } from "./firebase.js";
import * as FB from "./firebase.js";

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

// ── GLITCH TEXT ──────────────────────────────────────────────────────
const GLITCH_CHARS = "0123456789ABCDEF#@!%";
const SPLASH_LETTERS = ["A", "L", "E", "M", "X"];

function GlitchText({ text, delay = 0 }) {
  const chars = useMemo(() => text.split(""), [text]);
  const [disp, setDisp] = useState(() =>
    chars.map(c => c === " " ? " " : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)])
  );

  useEffect(() => {
    const t = setTimeout(() => {
      let step = 0;
      const iv = setInterval(() => {
        step++;
        const settled = Math.floor(step / 2.5);
        setDisp(chars.map((c, i) => {
          if (c === " " || i < settled) return c;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }));
        if (settled >= chars.length) { clearInterval(iv); setDisp(chars); }
      }, 42);
      return () => clearInterval(iv);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [chars, delay]);

  return <>{disp.join("")}</>;
}

// ── SPLASH SCREEN ────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const [pct, setPct] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const TOTAL = 3000;
    const start = performance.now();
    let raf;
    const tick = now => {
      const p = Math.min(100, Math.round(((now - start) / TOTAL) * 100));
      setPct(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setFlashing(true);
        setTimeout(onDone, 800);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      className="splash"
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 1, 1] }}
    >
      {/* Exit flash */}
      <AnimatePresence>
        {flashing && (
          <motion.div
            className="splash-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, times: [0, 0.18, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Sweeping scanline */}
      <div className="splash-scanline" aria-hidden="true" />

      {/* Ambient rings */}
      {[1.8, 2.7, 3.8].map((s, i) => (
        <motion.div key={i} className="splash-pulse-ring" style={{ scale: s }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.12, 0] }}
          transition={{ delay: 0.5 + i * 0.32, duration: 3.4, repeat: Infinity }}
        />
      ))}

      {/* ── HUD frame ── */}
      <motion.div
        className="splash-hud"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Corner brackets */}
        {[
          { cls: "tl", ix: -18, iy: -18 },
          { cls: "tr", ix:  18, iy: -18 },
          { cls: "bl", ix: -18, iy:  18 },
          { cls: "br", ix:  18, iy:  18 },
        ].map(({ cls, ix, iy }, i) => (
          <motion.div key={cls}
            className={`splash-corner splash-corner--${cls}`}
            initial={{ x: ix, y: iy, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}

        {/* Status row */}
        <motion.div className="splash-hud-status"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45 }}
        >
          <span className="splash-dot" />
          <span className="splash-status-txt">SYSTEM ONLINE</span>
          <span className="splash-hud-badge">FTC · 2025</span>
        </motion.div>

        <motion.div className="splash-divider"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.36, duration: 0.5 }}
          style={{ transformOrigin: "left" }}
        />

        {/* ALEMX title */}
        <div className="splash-name-block">
          <div className="splash-name">
            {SPLASH_LETTERS.map((ch, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, y: 56, filter: "blur(20px)", scale: 0.55 }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                transition={{ delay: 0.44 + i * 0.1, duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
              >{ch}</motion.span>
            ))}
          </div>

          <motion.div className="splash-num"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.02, duration: 0.6 }}
          >
            <GlitchText text="#33655" delay={0.95} />
          </motion.div>
        </div>

        <motion.p className="splash-tag"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.55 }}
        >
          FTC ROBOTICS · DECODE 2025 · MANGISTAU
        </motion.p>

        <motion.div className="splash-divider"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          style={{ marginTop: "1.5rem", transformOrigin: "left" }}
        />

        {/* Loading bar */}
        <motion.div className="splash-loader"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        >
          <div className="splash-bar-track">
            <div className="splash-bar-fill" style={{ width: `${pct}%` }} />
            {pct > 0 && pct < 100 && (
              <div className="splash-bar-tip" style={{ left: `${pct}%` }} />
            )}
          </div>
          <div className="splash-bar-row">
            <span className="splash-bar-label">LOADING</span>
            <span className="splash-bar-pct">{pct}%</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── HERO PARTICLES ────────────────────────────────────────────────────
const PARTICLES = [
  {x:"7%",  y:"18%", s:3, dur:3.8, delay:0,   dy:-22, dx:10  },
  {x:"26%", y:"38%", s:4, dur:3.2, delay:0.8, dy:-28, dx:6   },
  {x:"56%", y:"62%", s:3, dur:4.0, delay:0.6, dy:-20, dx:8   },
  {x:"73%", y:"80%", s:4, dur:4.8, delay:0.2, dy:-25, dx:10  },
  {x:"83%", y:"44%", s:3, dur:3.4, delay:1.0, dy:-19, dx:-9  },
  {x:"49%", y:"87%", s:3, dur:4.2, delay:1.8, dy:-22, dx:-4  },
  {x:"79%", y:"66%", s:4, dur:4.6, delay:0.3, dy:-26, dx:-7  },
  {x:"60%", y:"90%", s:2, dur:3.7, delay:0.9, dy:-17, dx:-10 },
];

function HeroParticles() {
  return (
    <div className="hero-particles" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="hero-particle"
          style={{
            left:p.x, top:p.y, width:p.s, height:p.s,
            '--dur':`${p.dur}s`, '--delay':`${p.delay}s`,
            '--dy':`${p.dy}px`, '--dx':`${p.dx}px`,
          }}
        />
      ))}
    </div>
  );
}

// ── NAV ──────────────────────────────────────────────────────────────
const navItems = [
  { key: "nav.team",      href: "#team" },
  { key: "nav.robot",     href: "#robot" },
  { key: "nav.auto",      href: "#auto" },
  { key: "nav.ranking",   href: "#ranking" },
  { key: "nav.portfolio", href: "#portfolio" },
];

// ── DATA ──────────────────────────────────────────────────────────────
const ROLE_KEY = {
  "Mentor":             "role.mentor",
  "Captain · Engineer": "role.captain",
  "Engineer":           "role.engineer",
  "Main Coder":         "role.main_coder",
  "Junior Coder":       "role.junior_coder",
  "Designer":           "role.designer",
  "Auto Coder":         "role.auto_coder",
  "SMM":                "role.smm",
};

const teamMembers = [
  { name: "Buxarbaev Zhaxan",   role: "Mentor",            img: "https://i.ibb.co.com/r2rX1ryJ/Zhaxan.jpg" },
  { name: "Zholbatyrov Elaman", role: "Mentor",            img: "https://i.ibb.co.com/8g6Dz5yS/Elaman.jpg" },
  { name: "Alisher",            role: "Captain · Engineer",img: "https://i.ibb.co.com/hJY7nLB3/Alisher.jpg" },
  { name: "Nurdaulet",          role: "Engineer",          img: "https://i.ibb.co.com/rLTctj6/nurda.jpg" },
  { name: "Zhaqsylyq",          role: "Main Coder",        img: "https://i.yapx.ru/d5NGC.jpg" },
  { name: "Merey",              role: "Main Coder",        img: "https://i.ibb.co.com/nMSXzT58/Merey.jpg" },
  { name: "Zhienbek",           role: "Junior Coder",      img: "https://i.ibb.co.com/Kj4YVMYk/zhora.jpg" },
  { name: "Tamerlan",           role: "Designer",          img: "https://i.ibb.co.com/6JpzNW7D/Tamer.jpg" },
  { name: "Zhandos",            role: "Auto Coder",        img: "https://i.yapx.ru/d5NJu.png" },
  { name: "Sabina",             role: "SMM",               img: "https://i.ibb.co.com/JR9ZR9Sj/sssabina.jpg" },
  { name: "Tannur",             role: "SMM",               img: "https://i.ibb.co.com/bgmkFzPz/Tannur.jpg" },
];

const achievements = [
  { img: "https://i.ibb.co.com/FL6VpSFD/news.jpg",  titleKey: "ach.0.title", subKey: "ach.0.sub", tagKey: "ach.0.tag" },
  { img: "https://i.ibb.co.com/dwTTmRY3/Batys.jpg", titleKey: "ach.1.title", subKey: "ach.1.sub", tagKey: "ach.1.tag" },
  { img: "https://i.yapx.ru/d5NGV.png",             titleKey: "ach.2.title", subKey: "ach.2.sub", tagKey: "ach.2.tag" },
  { img: "https://i.yapx.ru/d5NGV.png",             titleKey: "ach.3.title", subKey: "ach.3.sub", tagKey: "ach.3.tag" },
];

const portfolioItems = [
  { title: "Портфолио",            sub: "AlemX #33655 · Основное",   href: "https://canva.link/y61tz7v37q6bnkt",  embedSrc: "https://canva.link/y61tz7v37q6bnkt",  grad: "135deg, #7c3aed 0%, #a855f7 40%, #c084fc 100%" },
  { title: "Engineering Portfolio", sub: "AlemX #33655 · Инженерное", href: "https://canva.link/ouqtylruru8b0cr", embedSrc: "https://canva.link/ouqtylruru8b0cr", grad: "135deg, #1e1b4b 0%, #4c1d95 40%, #7c3aed 100%" },
];

const robotSpecs = [
  { label: "Drive Train", value: "Mecanum 4WD" },
  { label: "Auto Path",   value: "Pedro Pathing" },
  { label: "Motors",      value: "REV × 4" },
  { label: "Season",      value: "DECODE 2025" },
];

// ── RANKING DATA ─────────────────────────────────────────────────────
const OPR_STATS = [
  { label: "Best OPR",    value: 62.12, rank: "1708th", pct: 79.54, col: "#a855f7" },
  { label: "Auto OPR",    value: 12.06, rank: "2965th", pct: 64.48, col: "#7c3aed" },
  { label: "Teleop OPR",  value: 50.07, rank: "1456th", pct: 82.56, col: "#c084fc" },
  { label: "Endgame OPR", value:  7.95, rank: "3339th", pct: 60.00, col: "#f472b6" },
];

const FTC_EVENTS = [
  {
    name: "Batys FIRST Qualifier",
    loc: "Aktau",
    date: "17–18 Jan 2026",
    place: "1st",
    record: [6, 0, 0],
    npOPR: "+62.12",
    rp: 3.50,
    awards: ["Winning Alliance Captain", "Control Award"],
    col: "#ffc516",
    best: true,
  },
  {
    name: "Mangystau Regional",
    loc: "Aktau",
    date: "6–7 Dec 2025",
    place: "9th",
    record: [2, 3, 0],
    npOPR: "+0.69",
    rp: 1.20,
    awards: ["Judges' Choice Award 3rd"],
    col: "#a855f7",
    best: false,
  },
  {
    name: "Bilim Shyny 2026",
    loc: "Astana",
    date: "10–11 Apr 2026",
    place: "28th",
    record: [1, 4, 0],
    npOPR: "–8.52",
    rp: 1.00,
    awards: ["Connect Award 2nd"],
    col: "#f472b6",
    best: false,
  },
];

// ── FTC SCOUT API ─────────────────────────────────────────────────────
const FTCSCOUT = "https://api.ftcscout.org/graphql";
const FTC_SEASON = 2025;

async function ftcGql(query, variables) {
  const r = await fetch(FTCSCOUT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors[0].message);
  return j.data;
}

const AWARD_LABEL = {
  DeansListFinalist:"Dean's List Finalist",DeansListSemiFinalist:"Dean's List Semi-Finalist",
  DeansListWinner:"Dean's List Winner",JudgesChoice:"Judges' Choice",
  DivisionFinalist:"Division Finalist",DivisionWinner:"Division Winner",
  ConferenceFinalist:"Conference Finalist",Compass:"Compass Award",Promote:"Promote Award",
  Control:"Control Award",Motivate:"Motivate Award",Reach:"Reach Award",Sustain:"Sustain Award",
  Design:"Design Award",Innovate:"Innovate Award",Connect:"Connect Award",Think:"Think Award",
  TopRanked:"Top Ranked",Inspire:"Inspire Award",Winner:"Winner",Finalist:"Finalist",
};
const ord = n => n===1?"1st":n===2?"2nd":n===3?"3rd":`${n}th`;

const Q_SEARCH = `query($q:String!,$l:Int){teamsSearch(searchText:$q,limit:$l){number name location{city state country}rookieYear}}`;
const Q_TEAM   = `query($n:Int!,$s:Int!){teamByNumber(number:$n){number name schoolName location{city state country}rookieYear quickStats(season:$s){count tot{value rank}auto{value rank}dc{value rank}eg{value rank}}events(season:$s){event{name location{city}start}stats{...on TeamEventStats2019{rank wins losses ties}...on TeamEventStats2022{rank wins losses ties}...on TeamEventStats2023{rank wins losses ties}...on TeamEventStats2024{rank wins losses ties}...on TeamEventStats2025{rank wins losses ties rp}}awards{type placement}}matches(season:$s){alliance allianceRole match{hasBeenPlayed tournamentLevel matchNum description event{name}teams{teamNumber alliance onField noShow}scores{...on MatchScores2025{red{totalPoints autoPoints dcPoints}blue{totalPoints autoPoints dcPoints}}}}}}}`

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
  { type:'line',   p0:P.start,    p2:P.shoot,                    col:'#ffc516', state:'START',  turretDeg:90  },
  { type:'bezier', p0:P.shoot,    p1:P.ctrl1,    p2:P.c1,        col:'#a855f7', state:'COL 1',  turretDeg:315 },
  { type:'bezier', p0:P.c1,       p1:P.rCtrl1,   p2:P.shoot,     col:'#f472b6', state:'RET 1',  turretDeg:90  },
  { type:'line',   p0:P.shoot,    p2:P.c2,                       col:'#a855f7', state:'COL 2',  turretDeg:315 },
  { type:'line',   p0:P.c2,       p2:P.shoot,                    col:'#f472b6', state:'RET 2',  turretDeg:90  },
  { type:'line',   p0:P.shoot,    p2:P.gate,                     col:'#a855f7', state:'COL 3',  turretDeg:0   },
  { type:'bezier', p0:P.gate,     p1:P.gateCtrl, p2:P.gateDeep,  col:'#c084fc', state:'GATE',   turretDeg:270 },
  { type:'line',   p0:P.gateDeep, p2:P.shoot,                    col:'#f472b6', state:'RET 3',  turretDeg:90  },
  { type:'line',   p0:P.shoot,    p2:P.gate,                     col:'#a855f7', state:'COL 4',  turretDeg:0   },
  { type:'bezier', p0:P.gate,     p1:P.gateCtrl, p2:P.gateDeep,  col:'#c084fc', state:'GATE',   turretDeg:270 },
  { type:'line',   p0:P.gateDeep, p2:P.shoot,                    col:'#f472b6', state:'RET 4',  turretDeg:90  },
  { type:'line',   p0:P.shoot,    p2:P.park,                     col:'#7c3aed', state:'PARK',   turretDeg:90  },
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

// Generic poly builder / lerper (used by PedroVisualizerGen)
function buildPolyFor(segs) {
  const pts = [];
  for (let si = 0; si < segs.length; si++) {
    const s = segs[si];
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

function lerpPolyFor(poly, dist, t) {
  const total  = dist[dist.length - 1];
  const target = total * t;
  let lo = 0, hi = dist.length - 1;
  while (lo < hi - 1) { const mid = (lo + hi) >> 1; if (dist[mid] < target) lo = mid; else hi = mid; }
  const span = dist[hi] - dist[lo];
  const r    = span > 0 ? (target - dist[lo]) / span : 0;
  const a    = poly[lo], b = poly[Math.min(hi, poly.length - 1)];
  return {
    sx: a.sx + (b.sx - a.sx) * r,
    sy: a.sy + (b.sy - a.sy) * r,
    svgAngle: Math.atan2(b.sy - a.sy, b.sx - a.sx) * 180 / Math.PI,
    hdeg: a.hdeg + (b.hdeg - a.hdeg) * r,
    segIdx: a.segIdx,
  };
}

// ── AUTO BLUE PATH DATA ───────────────────────────────────────────────
// Coordinates from AutoBlue.java — Blue alliance, 5 shots, 12 segments
const PB = {
  start:    { x: 35,    y: 134,   deg: 180 },
  shoot:    { x: 47.15, y: 83.95, deg: 180 },
  c1:       { x: 18,    y: 64,    deg: 180 },
  ctrl1:    { x: 59.69, y: 61.56, deg: 180 },
  rCtrl1:   { x: 60.57, y: 69.71, deg: 180 },
  c2:       { x: 21,    y: 87,    deg: 180 },
  gate:     { x: 14,    y: 66.5,  deg: 160 },
  gateDeep: { x: 13.18, y: 57.59, deg: 180 },
  gateCtrl: { x: 27.61, y: 58.43, deg: 180 },
  park:     { x: 39.67, y: 58.22, deg: 180 },
};
const SEGS_BLUE = [
  { type:'line',   p0:PB.start,    p2:PB.shoot,                          col:'#ffc516', state:'START',  turretDeg:90  },
  { type:'bezier', p0:PB.shoot,    p1:PB.ctrl1,    p2:PB.c1,             col:'#3b82f6', state:'COL 1',  turretDeg:225 },
  { type:'bezier', p0:PB.c1,       p1:PB.rCtrl1,   p2:PB.shoot,          col:'#60a5fa', state:'RET 1',  turretDeg:90  },
  { type:'line',   p0:PB.shoot,    p2:PB.c2,                             col:'#3b82f6', state:'COL 2',  turretDeg:225 },
  { type:'line',   p0:PB.c2,       p2:PB.shoot,                          col:'#60a5fa', state:'RET 2',  turretDeg:90  },
  { type:'line',   p0:PB.shoot,    p2:PB.gate,                           col:'#3b82f6', state:'COL 3',  turretDeg:180 },
  { type:'bezier', p0:PB.gate,     p1:PB.gateCtrl, p2:PB.gateDeep,       col:'#a78bfa', state:'GATE',   turretDeg:270 },
  { type:'line',   p0:PB.gateDeep, p2:PB.shoot,                          col:'#60a5fa', state:'RET 3',  turretDeg:90  },
  { type:'line',   p0:PB.shoot,    p2:PB.gate,                           col:'#3b82f6', state:'COL 4',  turretDeg:180 },
  { type:'bezier', p0:PB.gate,     p1:PB.gateCtrl, p2:PB.gateDeep,       col:'#a78bfa', state:'GATE',   turretDeg:270 },
  { type:'line',   p0:PB.gateDeep, p2:PB.shoot,                          col:'#60a5fa', state:'RET 4',  turretDeg:90  },
  { type:'line',   p0:PB.shoot,    p2:PB.park,                           col:'#1d4ed8', state:'PARK',   turretDeg:90  },
];
const WP_BLUE = [
  { p: PB.start,    label:'START', col:'#ffc516' },
  { p: PB.shoot,    label:'SHOOT', col:'#ef4444' },
  { p: PB.c1,       label:'#1',    col:'#3b82f6' },
  { p: PB.c2,       label:'#2',    col:'#3b82f6' },
  { p: PB.gate,     label:'GATE',  col:'#a78bfa' },
  { p: PB.gateDeep, label:'DEEP',  col:'#a78bfa' },
  { p: PB.park,     label:'PARK',  col:'#1d4ed8' },
];

// ── AUTO BLUE 2 PATH DATA ─────────────────────────────────────────────
// Coordinates from AutoBlue2.java — mirrored from Autored2, 4 shots, 8 segments
const PB2 = {
  start:  { x: 60.22, y: 127.4,  deg: 270 },
  shoot:  { x: 60.22, y: 127.4,  deg: 270 },
  ctrl1:  { x: 56.33, y: 105.46, deg: 180 },
  c1:     { x: 16.44, y: 109.64, deg: 180 },
  c2:     { x: 11,    y: 132,    deg: 180 },
  park:   { x: 59.94, y: 117.92, deg: 270 },
};
const SEGS_B2 = [
  { type:'bezier', p0:PB2.shoot, p1:PB2.ctrl1, p2:PB2.c1,    col:'#06b6d4', state:'COL 1', turretDeg:225 },
  { type:'line',   p0:PB2.c1,   p2:PB2.shoot,                col:'#22d3ee', state:'RET 1', turretDeg:45  },
  { type:'line',   p0:PB2.shoot, p2:PB2.c2,                  col:'#06b6d4', state:'COL 2', turretDeg:225 },
  { type:'line',   p0:PB2.c2,   p2:PB2.shoot,                col:'#22d3ee', state:'RET 2', turretDeg:45  },
  { type:'line',   p0:PB2.shoot, p2:PB2.c2,                  col:'#06b6d4', state:'COL 3', turretDeg:225 },
  { type:'line',   p0:PB2.c2,   p2:PB2.shoot,                col:'#22d3ee', state:'RET 3', turretDeg:45  },
  { type:'line',   p0:PB2.shoot, p2:PB2.park,                col:'#0e7490', state:'PARK',  turretDeg:270 },
];
const WP_B2 = [
  { p: PB2.start, label:'START', col:'#ffc516' },
  { p: PB2.shoot, label:'SHOOT', col:'#ef4444' },
  { p: PB2.c1,    label:'#1',    col:'#06b6d4' },
  { p: PB2.c2,    label:'#2',    col:'#06b6d4' },
  { p: PB2.park,  label:'PARK',  col:'#0e7490' },
];

// ── AUTO RED 2 PATH DATA ─────────────────────────────────────────────
// Mirror of AutoBlue2 (x_red = 141.5 – x_blue, heading 180°→0°)
const PR2 = {
  start:  { x: 81.28,  y: 127.4,  deg: 270 },
  shoot:  { x: 81.28,  y: 127.4,  deg: 270 },
  ctrl1:  { x: 85.17,  y: 105.46, deg: 0   },
  c1:     { x: 125.06, y: 109.64, deg: 0   },
  c2:     { x: 130.5,  y: 132,    deg: 0   },
  park:   { x: 81.56,  y: 117.92, deg: 270 },
};
const SEGS_R2 = [
  { type:'bezier', p0:PR2.shoot, p1:PR2.ctrl1, p2:PR2.c1,    col:'#f97316', state:'COL 1', turretDeg:0   },
  { type:'line',   p0:PR2.c1,   p2:PR2.shoot,                col:'#fb923c', state:'RET 1', turretDeg:135 },
  { type:'line',   p0:PR2.shoot, p2:PR2.c2,                  col:'#f97316', state:'COL 2', turretDeg:0   },
  { type:'line',   p0:PR2.c2,   p2:PR2.shoot,                col:'#fb923c', state:'RET 2', turretDeg:135 },
  { type:'line',   p0:PR2.shoot, p2:PR2.c2,                  col:'#f97316', state:'COL 3', turretDeg:0   },
  { type:'line',   p0:PR2.c2,   p2:PR2.shoot,                col:'#fb923c', state:'RET 3', turretDeg:135 },
  { type:'line',   p0:PR2.shoot, p2:PR2.park,                col:'#c2410c', state:'PARK',  turretDeg:270 },
];
const WP_R2 = [
  { p: PR2.start, label:'START', col:'#ffc516' },
  { p: PR2.shoot, label:'SHOOT', col:'#ef4444' },
  { p: PR2.c1,    label:'#1',    col:'#f97316' },
  { p: PR2.c2,    label:'#2',    col:'#f97316' },
  { p: PR2.park,  label:'PARK',  col:'#c2410c' },
];

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
function Navbar({ scrollY, onOpenPage }) {
  const t       = useT();
  const opacity = useTransform(scrollY, [100, 360], [0, 1]);
  const y       = useTransform(scrollY, [100, 360], [22, 0]);
  const width   = useTransform(scrollY, [100, 360], ["8rem", "calc(100% - 2rem)"]);
  const linksOp = useTransform(scrollY, [280, 430], [0, 1]);
  const linksX  = useTransform(scrollY, [280, 430], [12, 0]);

  return (
    <motion.header className="site-header" style={{ opacity, y, width }}>
      <a className="brand-mark" href="#top">AlemX <span>#33655</span></a>
      <motion.nav className="site-nav" style={{ opacity: linksOp }}>
        {navItems.map(n => <a key={n.href} href={n.href}>{t(n.key)}</a>)}
        <button className="nav-page-btn" onClick={() => onOpenPage("ftcscout")}>FTC Scout</button>
        <button className="nav-page-btn nav-page-btn--cup" onClick={() => onOpenPage("techcup")}>Tech Cup</button>
      </motion.nav>
      <LangSwitcher />
    </motion.header>
  );
}

// ── MOBILE NAV ────────────────────────────────────────────────────────
function MobileNav({ onOpenPage }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        className={`mob-burger${open ? " mob-burger--open" : ""}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
      >
        <span /><span /><span />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mob-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mob-drawer"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mob-drawer__brand">
              <a className="brand-mark" href="#top" onClick={close}>AlemX <span>#33655</span></a>
            </div>

            <nav className="mob-nav">
              {navItems.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  className="mob-nav__link"
                  onClick={close}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.055, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {t(n.key)}
                </motion.a>
              ))}
              <motion.button
                className="mob-nav__link mob-nav__link--page"
                onClick={() => { close(); onOpenPage("ftcscout"); }}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + navItems.length * 0.055, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                FTC Scout
              </motion.button>
              <motion.button
                className="mob-nav__link mob-nav__link--page mob-nav__link--cup"
                onClick={() => { close(); onOpenPage("techcup"); }}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + (navItems.length + 1) * 0.055, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                Tech Cup
              </motion.button>
            </nav>

            <div className="mob-drawer__footer">
              <LangSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── HERO AURORA ───────────────────────────────────────────────────────
function HeroAurora() {
  return (
    <div className="hero-aurora" aria-hidden="true">
      <div className="aurora-blob aurora-blob--1" />
      <div className="aurora-blob aurora-blob--2" />
      <div className="aurora-blob aurora-blob--3" />
    </div>
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
      <HeroAurora />
      <HeroParticles />

      {/* 2 floating logos — float handled by CSS to avoid JS infinite loops */}
      <div className="hero-float-logos" aria-hidden="true">
        {[
          { src: "https://i.ibb.co.com/99zxvwKy/image-removebg-preview.png",  cls: "hero-float-logo--1" },
          { src: "https://i.ibb.co.com/LX6mNMLt/image-removebg-preview-1.png", cls: "hero-float-logo--2" },
        ].map(({ src, cls }, i) => (
          <motion.img
            key={i}
            src={src}
            alt=""
            className={`hero-float-logo ${cls}`}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.88, scale: 1 }}
            transition={{ delay: 0.9 + i * 0.15, duration: 0.6 }}
          />
        ))}
      </div>

      <motion.div
        className="hero-center"
        style={{ scale, opacity }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left: text — moves faster on scroll */}
        <motion.div className="hero-text" style={{ y: textY }}>
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
            <span className="hero-chevron-bounce"><ChevronDown size={20} /></span>
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
            <img
              src="https://allwebs.ru/images/2026/06/28/03b86a2a75b11c48e1f5c1bdad7d9257.png"
              alt="AlemX #33655 Robot"
              className="hero-robot-img hero-robot-float"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── LIVE ROBOT TELEMETRY ──────────────────────────────────────────────
const MOTOR_NAMES   = ["FL", "FR", "BL", "BR"];
const MOTOR_TARGETS = [1248, 1195, 1162, 1210];
const AUTO_STATES   = ["COLLECT", "RETURN", "SHOOT", "PARK"];

function RobotStage() {
  const stageRef = useRef(null);
  const t = useT();

  return (
    <motion.div
      ref={stageRef}
      className="robot-stage"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >

      {/* ── 3D Model placeholder ── */}
      <div className="bp-wrap">
        <div className="bp-glow" aria-hidden="true" />
        <div className="bp-scene" aria-hidden="true">
          <div className="bp-cube">
            <div className="bp-face bp-face--front" />
            <div className="bp-face bp-face--back" />
            <div className="bp-face bp-face--right" />
            <div className="bp-face bp-face--left" />
            <div className="bp-face bp-face--top" />
            <div className="bp-face bp-face--bottom" />
          </div>
        </div>
        <p className="bp-eye">3D MODEL · ROBOT</p>
        <h3 className="bp-title">{t("bp.soon")}</h3>
        <span className="bp-badge">Coming Soon</span>
      </div>
    </motion.div>
  );
}

// ── TEAM ──────────────────────────────────────────────────────────────
function TeamMember({ m, i }) {
  const t = useT();
  const onMove = e => {
    const el = e.currentTarget;
    const r  = el.getBoundingClientRect();
    const hx = (e.clientX - r.left) / r.width;
    const hy = (e.clientY - r.top)  / r.height;
    el.style.transform = `perspective(700px) rotateX(${((hy-0.5)*-14).toFixed(1)}deg) rotateY(${((hx-0.5)*14).toFixed(1)}deg)`;
    el.style.setProperty('--hx',     `${(hx * 100).toFixed(1)}%`);
    el.style.setProperty('--hy',     `${(hy * 100).toFixed(1)}%`);
    el.style.setProperty('--hangle', `${(hx * 360).toFixed(0)}deg`);
  };
  const onLeave = e => {
    const el = e.currentTarget;
    el.style.transform = '';
    el.style.removeProperty('--hx');
    el.style.removeProperty('--hy');
    el.style.removeProperty('--hangle');
  };

  return (
    <motion.div
      className="member"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.55, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="member__avatar">
        <img src={m.img} alt={m.name} loading="lazy" />
      </div>
      <div className="member__holo" aria-hidden="true" />
      <div className="member__overlay" />
      <div className="member__info">
        <p className="member__name">{m.name}</p>
        <span className="member__role">{t(ROLE_KEY[m.role] ?? m.role)}</span>
      </div>
    </motion.div>
  );
}

// ── PEDRO TABS DATA ───────────────────────────────────────────────────
const AUTO_TABS = [
  { key:'red',   label:'AutoRed',   badge:'5 shot · 12 сег', segs:AUTO_SEGMENTS, waypoints:FIELD_WAYPOINTS, border:'#f472b6' },
  { key:'red2',  label:'AutoRed2',  badge:'4 shot · 7 сег',  segs:SEGS_R2,       waypoints:WP_R2,           border:'#f97316' },
  { key:'blue',  label:'AutoBlue',  badge:'5 shot · 12 сег', segs:SEGS_BLUE,     waypoints:WP_BLUE,         border:'#3b82f6' },
  { key:'blue2', label:'AutoBlue2', badge:'4 shot · 7 сег',  segs:SEGS_B2,       waypoints:WP_B2,           border:'#06b6d4' },
];

// ── PEDRO VISUALIZER (Generic) ────────────────────────────────────────
function PedroVisualizerGen({ segs, waypoints, title, subtitle, uid, robotBorder = '#3b82f6' }) {
  const t = useT();
  const [running, setRunning] = useState(true);
  const [prog, setProg]       = useState(0);
  const progRef    = useRef(0);
  const visibleRef = useRef(false);
  const wrapRef    = useRef(null);

  const [poly, dist] = useMemo(() => {
    const p = buildPolyFor(segs);
    return [p, buildDistTable(p)];
  }, [segs]);

  const bezierCtrl = useMemo(() =>
    segs.filter(s => s.type === 'bezier' && s.p1)
        .filter((s, i, arr) => arr.findIndex(x => x.p1 === s.p1) === i),
    [segs]
  );

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }, { threshold: 0.05 });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let raf, last = 0;
    const tick = ts => {
      if (running && visibleRef.current) {
        if (last) { progRef.current = (progRef.current + (ts - last) / 18000) % 1; setProg(progRef.current); }
        last = ts;
      } else { last = 0; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const bot        = useMemo(() => lerpPolyFor(poly, dist, prog), [poly, dist, prog]);
  const half       = ROBOT_PX / 2;
  const seg        = segs[bot?.segIdx ?? 0];
  const turretDeg  = seg?.turretDeg ?? 0;
  const inX        = bot ? (bot.sx / SZ * FIELD).toFixed(2) : "0.00";
  const inY        = bot ? ((SZ - bot.sy) / SZ * FIELD).toFixed(2) : "0.00";
  const hdg        = bot ? bot.hdeg.toFixed(1) : "0.0";
  const sliderVal  = Math.round(prog * 1000);

  const ids = { hatch:`rH-${uid}`, clip:`rC-${uid}`, gBot:`gB-${uid}`, gLn:`gL-${uid}`, gTur:`gT-${uid}` };

  return (
    <motion.div ref={wrapRef} className="pedro"
      initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6 }}>
      <div className="pedro__header">
        <div>
          <span className="eyebrow">Pedro Pathing</span>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="pedro__legend">
          <span><i className="dot" style={{background: robotBorder}}/>Collect</span>
          <span><i className="dot" style={{background:'#93c5fd'}}/>Return</span>
          <span><i className="dot" style={{background:'#ffc516'}}/>Start</span>
          <span><i className="dot" style={{background:'#22d3ee'}}/>Turrel</span>
        </div>
      </div>

      <div className="pedro__field">
        <svg viewBox={`0 0 ${SZ} ${SZ}`} className="pedro__svg">
          <defs>
            <pattern id={ids.hatch} patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45 0 0)">
              <line x1="0" y1="0" x2="0" y2="10" stroke={robotBorder} strokeWidth="2" strokeOpacity="0.65"/>
            </pattern>
            <clipPath id={ids.clip}>
              <rect x={-half} y={-half} width={ROBOT_PX} height={ROBOT_PX} rx="3"/>
            </clipPath>
            <filter id={ids.gBot} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id={ids.gLn} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id={ids.gTur} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <image href="/decode.webp" x="0" y="0" width={SZ} height={SZ}/>

          {segs.map((s, i) => (
            <g key={i}>
              <path d={segD(s)} fill="none" stroke={s.col} strokeWidth="22" strokeOpacity="0.13" strokeLinecap="round" strokeLinejoin="round"/>
              <path d={segD(s)} fill="none" stroke={s.col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${ids.gLn})`}/>
            </g>
          ))}

          {bezierCtrl.map((s, i) => {
            const sp0 = psvg(s.p0), sp1 = psvg(s.p1), sp2 = psvg(s.p2);
            return (
              <g key={`ctrl-${i}`}>
                <line x1={sp0.sx} y1={sp0.sy} x2={sp1.sx} y2={sp1.sy} stroke="#ffc516" strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.45"/>
                <line x1={sp2.sx} y1={sp2.sy} x2={sp1.sx} y2={sp1.sy} stroke="#ffc516" strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.45"/>
                <rect x={sp1.sx-5} y={sp1.sy-5} width="10" height="10"
                  fill="rgba(255,197,22,.18)" stroke="#ffc516" strokeWidth="1.5"
                  transform={`rotate(45 ${sp1.sx} ${sp1.sy})`}/>
              </g>
            );
          })}

          {waypoints.map((wp, i) => {
            const { sx: wx, sy: wy } = psvg(wp.p);
            return (
              <g key={i}>
                <circle cx={wx} cy={wy} r="10" fill={wp.col} fillOpacity="0.18"/>
                <circle cx={wx} cy={wy} r="5"  fill={wp.col}/>
                <circle cx={wx} cy={wy} r="10" fill="none" stroke={wp.col} strokeWidth="1.5" strokeOpacity="0.6"/>
                <text x={wx} y={wy-13} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace"
                  stroke="rgba(0,0,0,0.85)" strokeWidth="3" paintOrder="stroke">{wp.label}</text>
              </g>
            );
          })}

          {bot && (
            <>
              {/* Robot body — rotates with robot heading */}
              <g transform={`translate(${bot.sx},${bot.sy}) rotate(${-bot.hdeg})`} filter={`url(#${ids.gBot})`}>
                <rect x={-half} y={-half} width={ROBOT_PX} height={ROBOT_PX} rx="3" fill={`url(#${ids.hatch})`} clipPath={`url(#${ids.clip})`}/>
                <rect x={-half} y={-half} width={ROBOT_PX} height={ROBOT_PX} rx="3" fill="none" stroke={robotBorder} strokeWidth="3"/>
                <circle cx="0" cy="0" r="5" fill="#ffc516"/>
                <line x1="0" y1="0" x2={half+6} y2="0" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.9"/>
                <polygon points={`${half+6},-3.5 ${half+13},0 ${half+6},3.5`} fill="#fff" fillOpacity="0.9"/>
              </g>
              {/* Turrel arm — rotates independently (field-absolute angle) */}
              <g transform={`translate(${bot.sx},${bot.sy}) rotate(${-turretDeg})`} filter={`url(#${ids.gTur})`}>
                <line x1="0" y1="0" x2={half+11} y2="0" stroke="#22d3ee" strokeWidth="2.5" strokeOpacity="0.92" strokeLinecap="round"/>
                <circle cx={half+11} cy="0" r="3.5" fill="#22d3ee" fillOpacity="0.92"/>
                <circle cx="0" cy="0" r="3" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.6"/>
              </g>
            </>
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

      <div className="pedro__scrub">
        <span className="scrub-label">Жол</span>
        <input type="range" min="0" max="1000" step="1" value={sliderVal}
          className="scrub-slider" style={{ '--val': `${(prog*100).toFixed(1)}%` }}
          onChange={e => { const v = Number(e.target.value)/1000; progRef.current=v; setProg(v); }}
          onMouseDown={() => setRunning(false)} onTouchStart={() => setRunning(false)}/>
        <span className="scrub-pct">{Math.round(prog*100)}%</span>
      </div>

      <div className="pedro__stats">
        {[["X (in)", inX],["Y (in)", inY],["Heading", `${hdg}°`],["Turrel", `${turretDeg}°`],["State", seg?.state ?? "—"]].map(([k,v]) => (
          <div key={k} className="pstat"><span>{k}</span><strong>{v}</strong></div>
        ))}
      </div>
    </motion.div>
  );
}

// ── PEDRO TABS WRAPPER ────────────────────────────────────────────────
function PedroTabs() {
  const [active, setActive] = useState('red');
  const tab = AUTO_TABS.find(t => t.key === active);
  return (
    <div>
      <div className="pedro-tabs__btns">
        {AUTO_TABS.map(({ key, label, badge, border }) => (
          <button
            key={key}
            className={`pedro-tabs__btn${active === key ? ' pedro-tabs__btn--on' : ''}`}
            style={active === key ? { '--tab-col': border } : {}}
            onClick={() => setActive(key)}
          >
            <span className="pedro-tabs__name">{label}</span>
            <span className="pedro-tabs__badge">{badge}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.22 }}
        >
          <PedroVisualizerGen
            uid={tab.key}
            segs={tab.segs}
            waypoints={tab.waypoints}
            title={`${tab.label} · ${tab.badge}`}
            subtitle={`ZHORIK ${tab.label.toUpperCase()} · нақты координаттар`}
            robotBorder={tab.border}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── RANKING SECTION ───────────────────────────────────────────────────
function RankingSection() {
  return (
    <div className="ranking-wrap">
      <div className="opr-grid">
        {OPR_STATS.map((s, i) => (
          <motion.div key={s.label} className="opr-card"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.09 }}
          >
            <div className="opr-card__val" style={{ color: s.col }}>{s.value}</div>
            <div className="opr-card__label">{s.label}</div>
            <div className="opr-card__meta">{s.rank} · Top {(100 - s.pct).toFixed(0)}%</div>
            <div className="opr-bar">
              <div className="opr-bar__fill" style={{ width: `${s.pct}%`, background: s.col }} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="events-list">
        {FTC_EVENTS.map((ev, i) => (
          <motion.div key={ev.name}
            className={`ev-card${ev.best ? " ev-card--best" : ""}`}
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: i * 0.09 }}
          >
            <div className="ev-place" style={{ color: ev.col, borderColor: `${ev.col}44` }}>
              {ev.place}
            </div>
            <div className="ev-info">
              <div className="ev-name">{ev.name}</div>
              <div className="ev-meta">{ev.loc} · {ev.date}</div>
              {ev.awards.length > 0 && (
                <div className="ev-awards">
                  {ev.awards.map(a => (
                    <span key={a} className="ev-award" style={{ borderColor: `${ev.col}55`, color: ev.col }}>{a}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="ev-stats">
              <div className="ev-stat">
                <span>W–L–T</span>
                <strong>{ev.record[0]}–{ev.record[1]}–{ev.record[2]}</strong>
              </div>
              <div className="ev-stat">
                <span>npOPR</span>
                <strong>{ev.npOPR}</strong>
              </div>
              <div className="ev-stat">
                <span>RP</span>
                <strong>{ev.rp.toFixed(2)}</strong>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── FTC SCOUT TEAM SEARCH ─────────────────────────────────────────────
function MatchRow({ mp, teamNum }) {
  const [open, setOpen] = useState(false);
  const m = mp.match;
  if (!m.hasBeenPlayed) return null;

  const s          = m.scores;
  const myAlliance = mp.alliance;
  const myScore    = s ? (myAlliance === "Red" ? s.red  : s.blue) : null;
  const oppScore   = s ? (myAlliance === "Red" ? s.blue : s.red ) : null;
  const won  = myScore && oppScore && myScore.totalPoints > oppScore.totalPoints;
  const tied = myScore && oppScore && myScore.totalPoints === oppScore.totalPoints;

  const redTeams  = m.teams.filter(t => t.alliance === "Red"  && t.onField);
  const blueTeams = m.teams.filter(t => t.alliance === "Blue" && t.onField);
  const myTeams   = myAlliance === "Red" ? redTeams  : blueTeams;
  const oppTeams  = myAlliance === "Red" ? blueTeams : redTeams;
  const partners  = myTeams.filter(t => t.teamNumber !== teamNum);

  return (
    <div className={`tm-row${open ? " tm-row--open" : ""}`}>
      <button className="tm-row__header" onClick={() => setOpen(v => !v)}>
        <span className={`tm-alliance tm-alliance--${myAlliance.toLowerCase()}`}>{myAlliance[0]}</span>
        <span className="tm-desc">{m.description || `${m.tournamentLevel}-${m.matchNum}`}</span>
        <span className={`tm-result tm-result--${won ? "win" : tied ? "tie" : "loss"}`}>
          {won ? "W" : tied ? "T" : "L"}
        </span>
        <span className="tm-scoreline">
          <span className="tm-score tm-score--red">{s?.red?.totalPoints ?? "—"}</span>
          <span className="tm-score-sep">:</span>
          <span className="tm-score tm-score--blue">{s?.blue?.totalPoints ?? "—"}</span>
        </span>
        <span className="tm-partners">
          {partners.map(t => `#${t.teamNumber}`).join(" ")}
          {oppTeams.length > 0 && <span className="tm-vs"> vs {oppTeams.map(t => `#${t.teamNumber}`).join(" ")}</span>}
        </span>
        <svg className={`tm-chevron${open ? " tm-chevron--open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="tm-row__detail">
          <div className="tm-detail-grid">
            {[{ label: "Red", teams: redTeams, score: s?.red }, { label: "Blue", teams: blueTeams, score: s?.blue }].map(col => (
              <div key={col.label} className={`tm-detail-col tm-detail-col--${col.label.toLowerCase()}`}>
                <div className="tm-detail-col-label">{col.label === "Red" ? "🔴" : "🔵"} {col.label}</div>
                {col.teams.map(t => (
                  <div key={t.teamNumber} className={`tm-detail-team${t.teamNumber === teamNum ? " tm-detail-team--you" : ""}`}>
                    #{t.teamNumber}
                    {t.teamNumber === teamNum && mp.allianceRole && (
                      <span className="tm-role">{mp.allianceRole}</span>
                    )}
                  </div>
                ))}
                {col.score && (
                  <div className="tm-detail-score">
                    <span>Auto <b>{col.score.autoPoints}</b></span>
                    <span>DC <b>{col.score.dcPoints}</b></span>
                    <span className="tm-detail-total">Total <b>{col.score.totalPoints}</b></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TeamMatchesList({ matches, teamNum }) {
  const played = matches.filter(mp => mp.match.hasBeenPlayed);
  if (played.length === 0) return null;

  const byEvent = {};
  played.forEach(mp => {
    const key = mp.match.event?.name || "Unknown";
    if (!byEvent[key]) byEvent[key] = [];
    byEvent[key].push(mp);
  });

  return (
    <div className="tm-list">
      <h4 className="ts-events-title">Ойындар · Season {FTC_SEASON}–{FTC_SEASON + 1}</h4>
      {Object.entries(byEvent).map(([evName, evMatches]) => (
        <div key={evName} className="tm-event-group">
          <div className="tm-event-name">{evName}</div>
          {evMatches.map((mp, i) => (
            <MatchRow key={i} mp={mp} teamNum={teamNum} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TeamDetailCard({ team, onBack, t }) {
  const qs = team.quickStats;
  const total = qs?.count ?? 0;
  const pct = (rank) => total > 0 ? +((1 - rank / total) * 100).toFixed(1) : null;
  const statItems = qs ? [
    { label: "Total OPR",   value: qs.tot.value,  rank: qs.tot.rank,  pct: pct(qs.tot.rank),  col: "#a855f7" },
    { label: "Auto OPR",    value: qs.auto.value, rank: qs.auto.rank, pct: pct(qs.auto.rank), col: "#7c3aed" },
    { label: "TeleOp OPR",  value: qs.dc.value,   rank: qs.dc.rank,   pct: pct(qs.dc.rank),   col: "#c084fc" },
    { label: "Endgame OPR", value: qs.eg.value,   rank: qs.eg.rank,   pct: pct(qs.eg.rank),   col: "#f472b6" },
  ] : [];

  // Derive elimination alliance partners per event from matches
  const elimByEvent = {};
  (team.matches || []).forEach(mp => {
    if (!mp.match.hasBeenPlayed) return;
    const lvl = mp.match.tournamentLevel;
    if (!["DoubleElim","Semis","Finals"].includes(lvl)) return;
    const evName = mp.match.event?.name;
    if (!evName) return;
    if (!elimByEvent[evName]) elimByEvent[evName] = { role: mp.allianceRole, partners: new Set() };
    mp.match.teams
      .filter(t2 => t2.alliance === mp.alliance && t2.teamNumber !== team.number && t2.onField)
      .forEach(t2 => elimByEvent[evName].partners.add(t2.teamNumber));
  });

  return (
    <motion.div
      className="ts-detail"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
    >
      <button className="ts-back" onClick={onBack}>
        ← {t("search.back")}
      </button>

      <div className="ts-detail-header">
        <div className="ts-detail-num">#{team.number}</div>
        <div className="ts-detail-meta">
          <h3 className="ts-detail-name">{team.name}</h3>
          {team.schoolName && <div className="ts-detail-school">{team.schoolName}</div>}
          <div className="ts-detail-loc">
            {[team.location?.city, team.location?.state, team.location?.country].filter(Boolean).join(" · ")}
          </div>
          <div className="ts-detail-row">
            <div className="ts-detail-rookie">FTC since {team.rookieYear}</div>
            <a
              className="ts-ext-chip"
              href={`https://ftc-events.firstinspires.org/team/${team.number}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Events ↗
            </a>
          </div>
        </div>
      </div>

      {statItems.length > 0 && (
        <div className="ts-stats-grid">
          {statItems.map(s => (
            <div key={s.label} className="ts-stat-card" style={{ "--col": s.col }}>
              <div className="ts-stat-label">{s.label}</div>
              <div className="ts-stat-value" style={{ color: s.col }}>
                {s.value != null ? s.value.toFixed(2) : "—"}
              </div>
              <div className="ts-stat-rank">{s.rank != null ? `#${s.rank}` : "—"}</div>
              <div className="ts-stat-bar">
                <div className="ts-stat-fill" style={{ width: `${s.pct ?? 0}%`, background: s.col }} />
              </div>
              <div className="ts-stat-pct">{s.pct != null ? `${s.pct}%` : ""}</div>
            </div>
          ))}
        </div>
      )}

      {team.events?.length > 0 && (
        <div className="ts-events">
          <h4 className="ts-events-title">Іс-шаралар · Season {FTC_SEASON}–{FTC_SEASON + 1}</h4>
          {team.events.map((ev, i) => {
            const al = elimByEvent[ev.event.name];
            return (
              <div key={i} className="ts-ev-row">
                <div className="ts-ev-left">
                  <div className="ts-ev-name">{ev.event.name}</div>
                  <div className="ts-ev-loc">
                    {ev.event.location?.city}
                    {ev.event.start && ` · ${new Date(ev.event.start).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`}
                  </div>
                  {al && al.partners.size > 0 && (
                    <div className="ts-ev-alliance">
                      <span className="ts-ev-role">{al.role}</span>
                      {[...al.partners].map(n => (
                        <span key={n} className="ts-ev-ally">#{n}</span>
                      ))}
                    </div>
                  )}
                  {ev.awards?.length > 0 && (
                    <div className="ts-ev-awards">
                      {ev.awards.map((a, j) => (
                        <span key={j} className="ts-ev-award">
                          {AWARD_LABEL[a.type] || a.type}{a.placement > 1 ? ` · ${ord(a.placement)}` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {ev.stats && (
                  <div className="ts-ev-right">
                    <div className="ts-ev-rank">#{ev.stats.rank}</div>
                    <div className="ts-ev-rec">{ev.stats.wins}–{ev.stats.losses}–{ev.stats.ties}</div>
                    {ev.stats.rp != null && <div className="ts-ev-rp">RP {ev.stats.rp.toFixed(2)}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {team.matches?.length > 0 && (
        <TeamMatchesList matches={team.matches} teamNum={team.number} />
      )}
    </motion.div>
  );
}

function TeamSearchSection() {
  const t = useT();
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [detLoading, setDetLoading] = useState(false);
  const [error, setError]     = useState(null);
  const debRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    const raw = q.trim();
    if (!raw) { setResults([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      if (/^\d+$/.test(raw)) {
        const d = await ftcGql(Q_TEAM, { n: parseInt(raw, 10), s: FTC_SEASON });
        setResults(d.teamByNumber ? [d.teamByNumber] : []);
      } else {
        const d = await ftcGql(Q_SEARCH, { q: raw, l: 8 });
        setResults(d.teamsSearch || []);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const onInput = e => {
    const v = e.target.value;
    setQuery(v);
    if (selected) { setSelected(null); setDetail(null); }
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => doSearch(v), 380);
  };

  const openTeam = async (num) => {
    setSelected(num);
    setDetLoading(true);
    setDetail(null);
    try {
      const d = await ftcGql(Q_TEAM, { n: num, s: FTC_SEASON });
      setDetail(d.teamByNumber);
    } catch (e) { setError(e.message); }
    finally { setDetLoading(false); }
  };

  return (
    <div className="ts-wrap">
      <div className="ts-search-bar">
        <svg className="ts-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="ts-input"
          type="text"
          placeholder={t("search.placeholder")}
          value={query}
          onChange={onInput}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <span className="ts-spinner" />}
      </div>

      {error && <div className="ts-error">{error}</div>}

      <AnimatePresence mode="wait">
        {selected ? (
          detLoading ? (
            <motion.div key="loading" className="ts-det-loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <span className="ts-spinner ts-spinner--lg" />
            </motion.div>
          ) : detail ? (
            <TeamDetailCard key={detail.number} team={detail} onBack={() => { setSelected(null); setDetail(null); }} t={t} />
          ) : null
        ) : results.length > 0 ? (
          <motion.div key="results" className="ts-results" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.28 }}>
            {results.map((team, i) => (
              <motion.button
                key={team.number}
                className="ts-card"
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.04, duration: 0.26 }}
                onClick={() => openTeam(team.number)}
              >
                <div className="ts-card-num">#{team.number}</div>
                <div className="ts-card-body">
                  <div className="ts-card-name">{team.name}</div>
                  <div className="ts-card-loc">
                    {[team.location?.city, team.location?.state, team.location?.country].filter(Boolean).join(", ")}
                  </div>
                </div>
                <div className="ts-card-meta">
                  <span className="ts-card-year">Since {team.rookieYear}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : query.trim() && !loading ? (
          <motion.div key="empty" className="ts-empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            {t("search.empty")}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!query && (
        <div className="ts-hint">
          <span>{t("search.hint")}</span>
        </div>
      )}
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
  const [embedOpen, setEmbedOpen] = useState(false);

  return (
    <>
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
          <div className="pf-footer-btns">
            {item.embedSrc && (
              <button className="pf-btn pf-btn--ghost" onClick={() => setEmbedOpen(true)}>
                <Eye size={14} /> Preview
              </button>
            )}
            <a className="pf-btn" href={item.href} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} /> {t("btn.open")}
            </a>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {embedOpen && (
          <motion.div
            className="pf-embed-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setEmbedOpen(false)}
          >
            <motion.div
              className="pf-embed-modal"
              initial={{ opacity: 0, scale: 0.92, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 28 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div className="pf-embed-header">
                <span className="pf-embed-title">{item.title}</span>
                <button className="pf-embed-close" onClick={() => setEmbedOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="pf-embed-body">
                <iframe
                  src={item.embedSrc}
                  className="pf-embed-iframe"
                  allowFullScreen
                  title={item.title}
                  loading="lazy"
                />
              </div>
              <div className="pf-embed-footer">
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="pf-btn">
                  <ExternalLink size={14} /> Canva-да ашу
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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

// ── LIVE VISITORS PANEL ───────────────────────────────────────────────
const STAT_NS = "alemx33655-site";

const SESSION_ID = (() => {
  const k = "__sid";
  let id = sessionStorage.getItem(k);
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem(k, id); }
  return id;
})();

function detectDevice() {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Samsung/i.test(ua)) return "Samsung";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh/i.test(ua)) return "Mac";
  return "Браузер";
}

function maskIP(ip) {
  if (!ip) return "•••.•••.•••.•••";
  const p = ip.split(".");
  return p.length === 4 ? `${p[0]}.${p[1]}.•••.•••` : ip;
}

function fmtAgo(ms) {
  const s = Math.round(ms / 1000);
  if (s < 5)    return "қазір";
  if (s < 60)   return `${s} сек`;
  if (s < 3600) return `${Math.round(s/60)} мин`;
  const h = Math.round(s/3600);
  if (h < 24)   return `${h} сағ`;
  return `${Math.round(h/24)} күн`;
}

function LivePanel() {
  const [online,      setOnline]      = useState(0);
  const [history,     setHistory]     = useState([]);
  const [totalVisits, setTotalVisits] = useState(null);
  const [tick,        setTick]        = useState(0);

  useEffect(() => {
    fetch(`https://api.counterapi.dev/v1/${STAT_NS}/visits/up`)
      .then(r => r.json()).then(d => setTotalVisits(d.count)).catch(() => {});

    const tickIv = setInterval(() => setTick(t => t + 1), 15_000);
    if (!FIREBASE_READY) return () => clearInterval(tickIv);

    const offs = [];

    initFirebase().then(ok => {
      if (!ok) return;

      const presRef = FB.fbRef(FB.db, `presence/${SESSION_ID}`);

      const log = city => {
        // Presence — online count (removed on disconnect)
        FB.fbSet(presRef, { city, device: detectDevice(), ts: Date.now() });
        FB.fbOnDisconnect(presRef).remove();
        // Visit history — stays in Firebase permanently
        FB.fbPush(FB.fbRef(FB.db, "visits"), { city, device: detectDevice(), ts: Date.now() });
      };

      fetch("https://freeipapi.com/api/json")
        .then(r => r.json())
        .then(d => log(d.cityName || d.countryName || "—"))
        .catch(() => log("—"));

      // Online count (presence)
      offs.push(FB.fbOnValue(FB.fbRef(FB.db, "presence"), snap => {
        setOnline(snap.size);
      }));

      // Visit history (last 60, newest first)
      const q = FB.fbQuery(FB.fbRef(FB.db, "visits"), FB.fbLimitToLast(60));
      offs.push(FB.fbOnValue(q, snap => {
        const list = [];
        snap.forEach(c => list.push({ _id: c.key, ...c.val() }));
        setHistory(list.reverse());
      }));
    });

    return () => { clearInterval(tickIv); offs.forEach(f => f?.()); };
  }, []);

  const now = Date.now();

  return (
    <motion.div className="live-panel"
      initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
      viewport={{once:true}} transition={{duration:0.5}}>

      <div className="live-panel__hdr">
        <div className="live-panel__hdr-left">
          <span className="live-panel__dot-pulse"/>
          <span className="live-panel__title">{online} адам онлайн</span>
        </div>
        <div className="live-panel__hdr-right">
          <Eye size={13}/>
          <span>{totalVisits != null ? totalVisits.toLocaleString("ru") : "…"} визит</span>
        </div>
      </div>

      {!FIREBASE_READY ? (
        <div className="live-panel__note">
          Firebase конфигурациясын <b>src/firebase.js</b> файлына қойыңыз
        </div>
      ) : history.length === 0 ? (
        <div className="live-panel__note">Жүктелуде…</div>
      ) : (
        <div className="live-panel__list">
          <AnimatePresence initial={false}>
            {history.map((v, i) => (
              <motion.div key={v._id}
                className={`live-panel__row${i === 0 ? " live-panel__row--me" : ""}`}
                initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}}
                exit={{opacity:0}} transition={{duration:0.22}}
              >
                <span className="live-panel__flag">🇰🇿</span>
                <span className="live-panel__city">{v.city}</span>
                <span className="live-panel__device">{v.device}</span>
                <span className="live-panel__ago">{fmtAgo(now - v.ts)}</span>
                {i === 0 && <span className="live-panel__you">● қазір</span>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
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
        <LivePanel />
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
          initial={{opacity:0, y:24}}
          whileInView={{opacity:1, y:0}}
          viewport={{once:true, amount:0.3}}
          transition={{duration:0.55, delay:0.06, ease:[0.16,1,0.3,1]}}
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


// ── FTC SCOUT PAGE ────────────────────────────────────────────────────
function FTCScoutPage({ onClose }) {
  const t = useT();
  return (
    <div className="sub-page">
      <div className="sub-page__topbar">
        <button className="sub-page__back" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {t("search.back")}
        </button>
        <div className="sub-page__title">
          <span className="sub-page__eye">FTC Scout · Global</span>
          <h2>{t("sec.search.title")}</h2>
        </div>
        <a className="sub-page__extlink" href="https://ftc-events.firstinspires.org/team/33655" target="_blank" rel="noopener noreferrer">
          AlemX #33655 ↗
        </a>
      </div>
      <div className="sub-page__body">
        <TeamSearchSection />
      </div>
    </div>
  );
}

// ── TECH CUP PAGE ─────────────────────────────────────────────────────

// ── TIME HELPERS ──────────────────────────────────────────────────────
function parseSlotMs(dayStr, timeRange) {
  const parts = timeRange.split(/[–\-]/);
  const [dd, mm] = dayStr.split(".");
  const mo = Number(mm) - 1, d = Number(dd);
  const toMs = hhmm => { const [h, m] = hhmm.trim().split(":").map(Number); return new Date(2026, mo, d, h, m).getTime(); };
  return { start: toMs(parts[0]), end: toMs(parts[1]) };
}

function useNow(interval = 20000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), interval); return () => clearInterval(id); }, [interval]);
  return now;
}

function fmtMs(ms, lang) {
  const min = Math.ceil(ms / 60000);
  if (min <= 0) return "";
  const h = Math.floor(min / 60), m = min % 60;
  if (lang === "kz") return h ? `~${h} сағ${m ? ` ${m} мин` : ""}` : `~${m} мин`;
  if (lang === "ru") return h ? `~${h} ч${m ? ` ${m} мин` : ""}` : `~${m} мин`;
  return h ? `~${h}h${m ? ` ${m}m` : ""}` : `~${m}m`;
}

// Normalize team name for fuzzy search
const fllNorm = s => s.toLowerCase().replace(/[\s\-\/\.]+/g, "");

// ── FLL Robot Game schedule (30 June & 1 July) ────────────────────────
const FLL_GAME_SLOTS = [
  { day:"30.06", rnd:"train1",   time:"11:30–11:40", f:["SAMURYQ","218-Qstem","ENDER FORCE","Heroes of Olympus","Lion Tech","Barni"] },
  { day:"30.06", rnd:"train1",   time:"11:40–11:50", f:["SilkWayBots","Sirius","FiftyOne Teams Semey","Tengri","QBIS_ALASH","EVA 01"] },
  { day:"30.06", rnd:"train1",   time:"11:50–12:00", f:["StarDust","Yassi","AquaTech","ApxeoQazaq","GEAR UP","Nova"] },
  { day:"30.06", rnd:"train1",   time:"12:00–12:10", f:["INSPIRO","Tolebi Daryn","Robospark213","SlapSeals","i-Stars","Daryn Dynamics"] },
  { day:"30.06", rnd:"train1",   time:"12:10–12:20", f:["Lv 3000","Nova Astqyz","Zytron","AMOR","Qazygurt","KAZBOTS"] },
  { day:"30.06", rnd:"train1",   time:"12:20–12:30", f:["Farabi Robotics","PEAK","RUH","33TurRobotics / 311608","Mf squad","Sunkar-q"] },
  { day:"30.06", rnd:"train1",   time:"12:30–12:40", f:["Flashforce","Uhud Robotics","Silicon Steppe","A.T.O.M","Tulpar","Mandoki Robotics"] },
  { day:"30.06", rnd:"train1",   time:"12:40–12:50", f:["Infinite Intelligence","imperium","","","",""] },
  { day:"30.06", rnd:"train2",   time:"14:00–14:10", f:["Robospark213","i-Stars","Uhud Robotics","Flashforce","ApxeoQazaq","Tulpar"] },
  { day:"30.06", rnd:"train2",   time:"14:10–14:20", f:["PEAK","Silicon Steppe","StarDust","Lion Tech","Sunkar-q","Zytron"] },
  { day:"30.06", rnd:"train2",   time:"14:20–14:30", f:["33TurRobotics / 311608","ENDER FORCE","Mf squad","Lv 3000","SilkWayBots","Infinite Intelligence"] },
  { day:"30.06", rnd:"train2",   time:"14:30–14:40", f:["Qazygurt","GEAR UP","QBIS_ALASH","Nova Astqyz","Nova","A.T.O.M"] },
  { day:"30.06", rnd:"train2",   time:"14:40–14:50", f:["RUH","Farabi Robotics","Tengri","SAMURYQ","imperium","AquaTech"] },
  { day:"30.06", rnd:"train2",   time:"14:50–15:00", f:["Mandoki Robotics","Heroes of Olympus","EVA 01","Daryn Dynamics","Yassi","FiftyOne Teams Semey"] },
  { day:"30.06", rnd:"train2",   time:"15:00–15:10", f:["Sirius","KAZBOTS","218-Qstem","Barni","INSPIRO","SlapSeals"] },
  { day:"30.06", rnd:"train2",   time:"15:10–15:20", f:["Tolebi Daryn","AMOR","","","",""] },
  { day:"30.06", rnd:"official1",time:"15:40–15:50", f:["KAZBOTS","33TurRobotics / 311608","Sirius","Zytron","SlapSeals","PEAK"] },
  { day:"30.06", rnd:"official1",time:"15:50–16:00", f:["A.T.O.M","Barni","Heroes of Olympus","GEAR UP","Uhud Robotics","INSPIRO"] },
  { day:"30.06", rnd:"official1",time:"16:00–16:10", f:["Silicon Steppe","Robospark213","Daryn Dynamics","FiftyOne Teams Semey","Tengri","SAMURYQ"] },
  { day:"30.06", rnd:"official1",time:"16:10–16:20", f:["218-Qstem","StarDust","Flashforce","Sunkar-q","RUH","AMOR"] },
  { day:"30.06", rnd:"official1",time:"16:20–16:30", f:["Nova","SilkWayBots","Mandoki Robotics","Yassi","Infinite Intelligence","Lion Tech"] },
  { day:"30.06", rnd:"official1",time:"16:30–16:40", f:["ENDER FORCE","Qazygurt","ApxeoQazaq","Tolebi Daryn","AquaTech","Lv 3000"] },
  { day:"30.06", rnd:"official1",time:"16:40–16:50", f:["Nova Astqyz","EVA 01","imperium","i-Stars","Farabi Robotics","Mf squad"] },
  { day:"30.06", rnd:"official1",time:"16:50–17:00", f:["QBIS_ALASH","Tulpar","","","",""] },
  { day:"01.07", rnd:"official2",time:"10:30–10:40", f:["FiftyOne Teams Semey","INSPIRO","Infinite Intelligence","EVA 01","AMOR","Qazygurt"] },
  { day:"01.07", rnd:"official2",time:"10:40–10:50", f:["i-Stars","Mf squad","Farabi Robotics","Robospark213","Flashforce","Nova Astqyz"] },
  { day:"01.07", rnd:"official2",time:"10:50–11:00", f:["Sunkar-q","Zytron","Barni","RUH","KAZBOTS","QBIS_ALASH"] },
  { day:"01.07", rnd:"official2",time:"11:00–11:10", f:["AquaTech","Lion Tech","Lv 3000","imperium","PEAK","Sirius"] },
  { day:"01.07", rnd:"official2",time:"11:10–11:20", f:["Heroes of Olympus","ApxeoQazaq","Tulpar","218-Qstem","Tolebi Daryn","StarDust"] },
  { day:"01.07", rnd:"official2",time:"11:20–11:30", f:["Uhud Robotics","SAMURYQ","GEAR UP","SilkWayBots","A.T.O.M","Silicon Steppe"] },
  { day:"01.07", rnd:"official2",time:"11:30–11:40", f:["Daryn Dynamics","Tengri","Nova","ENDER FORCE","33TurRobotics / 311608","Yassi"] },
  { day:"01.07", rnd:"official2",time:"11:40–11:50", f:["SlapSeals","Mandoki Robotics","","","",""] },
  { day:"01.07", rnd:"official3",time:"12:00–12:10", f:["Tengri","QBIS_ALASH","Sunkar-q","AquaTech","Daryn Dynamics","RUH"] },
  { day:"01.07", rnd:"official3",time:"12:10–12:20", f:["Yassi","Lv 3000","AMOR","Mandoki Robotics","ENDER FORCE","ApxeoQazaq"] },
  { day:"01.07", rnd:"official3",time:"12:20–12:30", f:["imperium","SlapSeals","PEAK","Farabi Robotics","Heroes of Olympus","i-Stars"] },
  { day:"01.07", rnd:"official3",time:"12:30–12:40", f:["Tulpar","Infinite Intelligence","33TurRobotics / 311608","Mf squad","Silicon Steppe","SilkWayBots"] },
  { day:"01.07", rnd:"official3",time:"12:40–12:50", f:["Barni","A.T.O.M","INSPIRO","Sirius","EVA 01","Uhud Robotics"] },
  { day:"01.07", rnd:"official3",time:"12:50–13:00", f:["Zytron","Flashforce","KAZBOTS","StarDust","Nova Astqyz","218-Qstem"] },
  { day:"01.07", rnd:"official3",time:"13:00–13:10", f:["GEAR UP","FiftyOne Teams Semey","SAMURYQ","Qazygurt","Robospark213","Tolebi Daryn"] },
  { day:"01.07", rnd:"official3",time:"13:10–13:20", f:["Lion Tech","Nova","","","",""] },
];

// ── FLL Judging ───────────────────────────────────────────────────────
const FLL_JUDGING = [
  { day:"30.06", time:"11:30–12:10", r:{1:"RUH",2:"Mandoki Robotics",3:"imperium",4:"PEAK"} },
  { day:"30.06", time:"12:10–12:50", r:{1:"FiftyOne Teams Semey",2:"GEAR UP",3:"ENDER FORCE",4:"Barni"} },
  { day:"30.06", time:"14:00–14:40", r:{1:"EVA 01",2:"Tolebi Daryn",3:"Heroes of Olympus",4:"Yassi"} },
  { day:"30.06", time:"14:40–15:20", r:{1:"Sunkar-q",2:"33TurRobotics / 311608",3:"Mf squad",4:"Silicon Steppe"} },
  { day:"30.06", time:"15:20–16:00", r:{1:"StarDust",2:"Lv 3000",3:"Farabi Robotics",4:"ApxeoQazaq"} },
  { day:"30.06", time:"16:00–16:40", r:{1:"Sirius",2:"KAZBOTS",3:"Zytron",4:"Tulpar"} },
  { day:"01.07", time:"10:20–11:00", r:{1:"SlapSeals",2:"218-Qstem",3:"SAMURYQ",4:"A.T.O.M"} },
  { day:"01.07", time:"11:00–11:40", r:{1:"AMOR",2:"i-Stars",3:"Flashforce",4:"Qazygurt"} },
  { day:"01.07", time:"11:40–12:20", r:{1:"INSPIRO",2:"Infinite Intelligence",3:"SilkWayBots",4:"Nova Astqyz"} },
  { day:"01.07", time:"12:20–13:00", r:{1:"Nova",2:"AquaTech",3:"Lion Tech",4:"Daryn Dynamics"} },
  { day:"01.07", time:"14:00–14:40", r:{1:"QBIS_ALASH",2:"Tengri",3:"Robospark213",4:"Uhud Robotics"} },
];

// ── FLL Explore Judging (30 June only) ───────────────────────────────
const EXPLORE_JUDGING = [
  { time:"12:00–12:20", r:{1:"Zhas Qyran 159",2:"PEAK",3:"Altun kids",4:"Saturn"} },
  { time:"12:30–12:50", r:{1:"Smart Sisters",2:"TechnoKids",3:"Future Axions 218",4:"Bad guys"} },
  { time:"14:00–14:20", r:{1:"Super Mario",2:"LionTech",3:"Ikigai",4:"Bolashaq"} },
  { time:"14:30–14:50", r:{1:"Archeology x",2:"Cosmo pixels",3:"ABAI TEAM",4:"KELESHEK INNOVATORS"} },
  { time:"15:00–15:20", r:{1:"OtAi",2:"RoboKids Merke",3:"KoneTech",4:"TurAndroid / 211626"} },
  { time:"15:30–15:50", r:{1:"",2:"Digital Nomads",3:"Galaxy",4:"Kaido"} },
];

// ── FLL Explore Pit Numbers ───────────────────────────────────────────
const EXPLORE_PITS = [
  {pit:1,team:"Future Axions 218"},{pit:2,team:"OtAi"},{pit:3,team:"Saturn"},
  {pit:4,team:"TurAndroid / 211626"},{pit:5,team:"KELESHEK INNOVATORS"},{pit:6,team:"PEAK"},
  {pit:7,team:"Bad guys"},{pit:8,team:"Digital Nomads"},{pit:9,team:"Zhas Qyran 159"},
  {pit:10,team:"RoboKids Merke"},{pit:11,team:"Altun kids"},{pit:12,team:"Bolashaq"},
  {pit:13,team:"Super Mario"},{pit:14,team:"LionTech"},{pit:15,team:"Smart Sisters"},
  {pit:16,team:"ABAI TEAM"},{pit:17,team:"TechnoKids"},{pit:18,team:"KoneTech"},
  {pit:19,team:"Archeology x"},{pit:20,team:"Ikigai"},{pit:21,team:"Cosmo pixels"},
  {pit:22,team:"Galaxy"},{pit:23,team:"Kaido"},
];

const FLL_RND = {
  train1:    {kz:"Жаттығу 1",    ru:"Трен. матч 1",  en:"Train 1"},
  train2:    {kz:"Жаттығу 2",    ru:"Трен. матч 2",  en:"Train 2"},
  official1: {kz:"Ресми матч 1", ru:"Офиц. матч 1",  en:"Official 1"},
  official2: {kz:"Ресми матч 2", ru:"Офиц. матч 2",  en:"Official 2"},
  official3: {kz:"Ресми матч 3", ru:"Офиц. матч 3",  en:"Official 3"},
};

// FTC Streams — fill URLs when ready
const FTC_STREAM1_URL = "";
const FTC_STREAM2_URL = "";
// Rules page video — fill URL when ready
const TC_RULES_VIDEO_URL = "";

const TC_TABS = [
  { key:"fll" },
  { key:"explore", label:"FLL Explore" },
  { key:"ftc",     label:"FTC" },
  { key:"rules" },
  { key:"myteam" },
  { key:"chat",    label:"💬 Чат" },
];

function tcEmbedUrl(raw) {
  const m = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/))([^?&\s]+)/);
  const id = m?.[1] ?? raw;
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&modestbranding=1`;
}

// ── FLL TEAM SEARCH ───────────────────────────────────────────────────
function FLLTeamSearch() {
  const { lang } = useLang();
  const [query, setQuery]     = useState("");
  const [selected, setSelected] = useState(null);
  const now = useNow(30000);
  const qn  = useMemo(() => fllNorm(query), [query]);

  const gameSlotsTimed  = useMemo(() => FLL_GAME_SLOTS.map(s => ({ ...s, ...parseSlotMs(s.day, s.time) })), []);
  const judgeSlotsTimed = useMemo(() => FLL_JUDGING.map(s => ({ ...s, ...parseSlotMs(s.day, s.time) })), []);

  const allTeams = useMemo(() => {
    const set = new Set();
    FLL_GAME_SLOTS.forEach(s => s.f.forEach(t => t && set.add(t)));
    FLL_JUDGING.forEach(s => Object.values(s.r).forEach(t => t && set.add(t)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, []);

  const matchingTeams = useMemo(() =>
    qn ? allTeams.filter(t => fllNorm(t).includes(qn)) : [],
    [qn, allTeams]
  );

  // Detail data for selected team
  const selGame = useMemo(() => {
    if (!selected) return [];
    const sn = fllNorm(selected);
    return gameSlotsTimed.map(slot => {
      const fields = slot.f.reduce((acc, tm, i) => { if (tm && fllNorm(tm) === sn) acc.push(i+1); return acc; }, []);
      if (!fields.length) return null;
      const isNow = now >= slot.start && now < slot.end;
      const isPast = now >= slot.end;
      const slotsBefore = gameSlotsTimed.filter(s => s.start > now && s.start < slot.start).length;
      return { ...slot, fields, isNow, isPast, slotsBefore, msBefore: Math.max(0, slot.start - now) };
    }).filter(Boolean);
  }, [selected, gameSlotsTimed, now]);

  const selJudgeSlot = useMemo(() => {
    if (!selected) return null;
    const sn = fllNorm(selected);
    return judgeSlotsTimed.find(s => Object.values(s.r).some(t => t && fllNorm(t) === sn)) ?? null;
  }, [selected, judgeSlotsTimed]);

  const selJudgeRoom = useMemo(() => {
    if (!selected || !selJudgeSlot) return null;
    const sn = fllNorm(selected);
    return Object.entries(selJudgeSlot.r).find(([, t]) => t && fllNorm(t) === sn)?.[0] ?? null;
  }, [selected, selJudgeSlot]);

  const L = {
    ph:   lang==="kz"?"Команда атын іздеу...":lang==="ru"?"Поиск команды...":"Search team...",
    hint: lang==="kz"?"Команда атын жазыңыз — тізімнен таңдаңыз":lang==="ru"?"Введите название — выберите из списка":"Type a name — select from the list",
    nf:   lang==="kz"?"Команда табылмады":lang==="ru"?"Команда не найдена":"Team not found",
    back: lang==="kz"?"← Артқа":lang==="ru"?"← Назад":"← Back",
    G:    lang==="kz"?"🤖 Робот Ойыны":lang==="ru"?"🤖 Игра Роботов":"🤖 Robot Game",
    J:    lang==="kz"?"🏆 Бағалау":lang==="ru"?"🏆 Судейство":"🏆 Judging",
    F:    lang==="kz"?"Алаң":lang==="ru"?"Поле":"Field",
    R:    lang==="kz"?"Бөлме":lang==="ru"?"Комната":"Room",
  };

  const slotBadge = (isNow, isPast, slotsBefore, msBefore) => {
    if (isNow)  return <span className="np-before np-before--now">{lang==="kz"?"🔴 Қазір ойнайды!":lang==="ru"?"🔴 Играет сейчас!":"🔴 Playing now!"}</span>;
    if (isPast) return <span className="np-before np-before--past">{lang==="kz"?"Өтті":lang==="ru"?"Завершено":"Done"}</span>;
    if (slotsBefore === 0) return <span className="np-before np-before--next">{lang==="kz"?"⏭ Келесі сіздер!":lang==="ru"?"⏭ Вы следующие!":"⏭ You're next!"}</span>;
    return <span className="np-before">{lang==="kz"?`${slotsBefore} слот алда · ${fmtMs(msBefore,lang)}`:lang==="ru"?`${slotsBefore} сл. до вас · ${fmtMs(msBefore,lang)}`:`${slotsBefore} slots ahead · ${fmtMs(msBefore,lang)}`}</span>;
  };

  // ── DETAIL VIEW ──
  if (selected) {
    const js = selJudgeSlot;
    const jIsNow  = js && now >= js.start && now < js.end;
    const jIsPast = js && now >= js.end;
    const jBefore = js ? judgeSlotsTimed.filter(s => s.start > now && s.start < js.start).length : 0;
    return (
      <div className="fll-search-wrap">
        <button className="fll-detail-back" onClick={() => setSelected(null)}>{L.back}</button>
        <div className="fll-detail-name">{selected}</div>

        {selGame.length > 0 && (
          <div className="fll-hit-section">
            <div className="fll-hit-section-title">{L.G}</div>
            {selGame.map((slot, i) => (
              <div key={i} className={`fll-hit-card fll-hit-card--game${slot.isPast?" fll-hit-card--past":""}`}>
                <div className="fll-hit-left">
                  <div className="fll-hit-time">{slot.time}</div>
                  <div className="fll-hit-day">{slot.day}</div>
                </div>
                <div className="fll-hit-right">
                  <div className="fll-hit-round">{FLL_RND[slot.rnd]?.[lang] ?? slot.rnd}</div>
                  {slot.fields.map(fn => <div key={fn} className="fll-hit-field">{L.F} {fn}</div>)}
                  {slotBadge(slot.isNow, slot.isPast, slot.slotsBefore, slot.msBefore)}
                </div>
              </div>
            ))}
          </div>
        )}

        {js && (
          <div className="fll-hit-section">
            <div className="fll-hit-section-title">{L.J}</div>
            <div className={`fll-hit-card fll-hit-card--judge${jIsPast?" fll-hit-card--past":""}`}>
              <div className="fll-hit-left">
                <div className="fll-hit-time">{js.time}</div>
                <div className="fll-hit-day">{js.day}</div>
              </div>
              <div className="fll-hit-right">
                <div className="fll-hit-field">{L.R} {selJudgeRoom} · <strong>{selected}</strong></div>
                {slotBadge(jIsNow, jIsPast, jBefore, Math.max(0, js.start - now))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="fll-search-wrap">
      <div className="tc-search-bar fll-search-bar">
        <svg className="tc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input className="tc-search-input fll-input" type="text" placeholder={L.ph}
          value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" spellCheck={false} />
      </div>
      {!query && <div className="fll-search-hint">{L.hint}</div>}
      {query && (
        <AnimatePresence mode="wait">
          <motion.div key={qn||"_"} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}>
            {matchingTeams.length === 0
              ? <div className="fll-not-found">{L.nf}</div>
              : <div className="fll-team-list">
                  {matchingTeams.map(team => (
                    <button key={team} className="fll-team-row" onClick={() => setSelected(team)}>
                      <span className="fll-team-row-name">{team}</span>
                      <span className="fll-team-row-arr">›</span>
                    </button>
                  ))}
                </div>
            }
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ── EXPLORE TEAM SEARCH ───────────────────────────────────────────────
function ExploreTeamSearch() {
  const { lang } = useLang();
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState(null);
  const now = useNow(30000);
  const qn  = useMemo(() => fllNorm(query), [query]);

  const judgeSlotsTimed = useMemo(() =>
    EXPLORE_JUDGING.map(s => ({ ...s, ...parseSlotMs("30.06", s.time) })), []);

  const allTeams = useMemo(() => {
    const set = new Set();
    EXPLORE_JUDGING.forEach(s => Object.values(s.r).forEach(t => t && set.add(t)));
    EXPLORE_PITS.forEach(p => set.add(p.team));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, []);

  const matchingTeams = useMemo(() =>
    qn ? allTeams.filter(t => fllNorm(t).includes(qn)) : [],
    [qn, allTeams]
  );

  const selPit = useMemo(() => {
    if (!selected) return null;
    const sn = fllNorm(selected);
    return EXPLORE_PITS.find(p => fllNorm(p.team) === sn) ?? null;
  }, [selected]);

  const selJudgeSlot = useMemo(() => {
    if (!selected) return null;
    const sn = fllNorm(selected);
    return judgeSlotsTimed.find(s => Object.values(s.r).some(t => t && fllNorm(t) === sn)) ?? null;
  }, [selected, judgeSlotsTimed]);

  const selJudgeRoom = useMemo(() => {
    if (!selected || !selJudgeSlot) return null;
    const sn = fllNorm(selected);
    return Object.entries(selJudgeSlot.r).find(([, t]) => t && fllNorm(t) === sn)?.[0] ?? null;
  }, [selected, selJudgeSlot]);

  const L = {
    ph:   lang==="kz"?"Команда атын іздеу...":lang==="ru"?"Поиск команды...":"Search team...",
    hint: lang==="kz"?"Команда атын жазыңыз — тізімнен таңдаңыз":lang==="ru"?"Введите название — выберите из списка":"Type a name — select from the list",
    nf:   lang==="kz"?"Команда табылмады":lang==="ru"?"Команда не найдена":"Team not found",
    back: lang==="kz"?"← Артқа":lang==="ru"?"← Назад":"← Back",
    P:    lang==="kz"?"📍 Пит нөмірі":lang==="ru"?"📍 Пит номер":"📍 Pit #",
    J:    lang==="kz"?"🏆 Бағалау":lang==="ru"?"🏆 Судейство":"🏆 Judging",
    R:    lang==="kz"?"Бөлме":lang==="ru"?"Комната":"Room",
  };

  const slotBadge = (isNow, isPast, slotsBefore, msBefore) => {
    if (isNow)  return <span className="np-before np-before--now">{lang==="kz"?"🔴 Бағалауда!":lang==="ru"?"🔴 На судействе!":"🔴 Being judged!"}</span>;
    if (isPast) return <span className="np-before np-before--past">{lang==="kz"?"Өтті":lang==="ru"?"Завершено":"Done"}</span>;
    if (slotsBefore === 0) return <span className="np-before np-before--next">{lang==="kz"?"⏭ Келесі сіздер!":lang==="ru"?"⏭ Вы следующие!":"⏭ You're next!"}</span>;
    return <span className="np-before">{lang==="kz"?`${slotsBefore} сессия алда · ${fmtMs(msBefore,lang)}`:lang==="ru"?`${slotsBefore} сесс. до вас · ${fmtMs(msBefore,lang)}`:`${slotsBefore} sessions ahead · ${fmtMs(msBefore,lang)}`}</span>;
  };

  // ── DETAIL VIEW ──
  if (selected) {
    const js = selJudgeSlot;
    const jIsNow  = js && now >= js.start && now < js.end;
    const jIsPast = js && now >= js.end;
    const jBefore = js ? judgeSlotsTimed.filter(s => s.start > now && s.start < js.start).length : 0;
    return (
      <div className="fll-search-wrap">
        <button className="fll-detail-back" onClick={() => setSelected(null)}>{L.back}</button>
        <div className="fll-detail-name">{selected}</div>

        {selPit && (
          <div className="fll-hit-section">
            <div className="fll-hit-section-title">{L.P}</div>
            <div className="fll-hit-card fll-hit-card--pit">
              <span className="fll-pit-num">{selPit.pit}</span>
              <span className="fll-pit-team">{selPit.team}</span>
            </div>
          </div>
        )}

        {js && (
          <div className="fll-hit-section">
            <div className="fll-hit-section-title">{L.J}</div>
            <div className={`fll-hit-card fll-hit-card--judge${jIsPast?" fll-hit-card--past":""}`}>
              <div className="fll-hit-left">
                <div className="fll-hit-time">{js.time}</div>
                <div className="fll-hit-day">30.06</div>
              </div>
              <div className="fll-hit-right">
                <div className="fll-hit-field">{L.R} {selJudgeRoom} · <strong>{selected}</strong></div>
                {slotBadge(jIsNow, jIsPast, jBefore, Math.max(0, js.start - now))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="fll-search-wrap">
      <div className="tc-search-bar fll-search-bar">
        <svg className="tc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input className="tc-search-input fll-input" type="text" placeholder={L.ph}
          value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" spellCheck={false} />
      </div>
      {!query && <div className="fll-search-hint">{L.hint}</div>}
      {query && (
        <AnimatePresence mode="wait">
          <motion.div key={qn||"_"} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}>
            {matchingTeams.length === 0
              ? <div className="fll-not-found">{L.nf}</div>
              : <div className="fll-team-list">
                  {matchingTeams.map(team => (
                    <button key={team} className="fll-team-row" onClick={() => setSelected(team)}>
                      <span className="fll-team-row-name">{team}</span>
                      <span className="fll-team-row-arr">›</span>
                    </button>
                  ))}
                </div>
            }
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ── FLL LIVE BANNER ───────────────────────────────────────────────────
function FLLLiveBanner() {
  const { lang } = useLang();
  const now = useNow(20000);

  const gameSlots = useMemo(() => FLL_GAME_SLOTS.map(s => ({ ...s, ...parseSlotMs(s.day, s.time) })), []);
  const judgeSlots = useMemo(() => FLL_JUDGING.map(s => ({ ...s, ...parseSlotMs(s.day, s.time) })), []);

  const curGame  = gameSlots.find(s => now >= s.start && now < s.end);
  const nextGame = gameSlots.find(s => s.start > now);
  const remGame  = gameSlots.filter(s => s.start > now).length;
  const curJudge  = judgeSlots.find(s => now >= s.start && now < s.end);
  const nextJudge = judgeSlots.find(s => s.start > now);
  const remJudge  = judgeSlots.filter(s => s.start > now).length;

  if (!curGame && !nextGame && !curJudge && !nextJudge) return null;

  const lbl = {
    now:   lang==="kz"?"🔴 ҚАЗІР":lang==="ru"?"🔴 СЕЙЧАС":"🔴 NOW",
    next:  lang==="kz"?"⏭ КЕЛЕСІ":lang==="ru"?"⏭ СЛЕДУЮЩИЙ":"⏭ NEXT",
    soon:  lang==="kz"?"⏰ Жақында":lang==="ru"?"⏰ Скоро":"⏰ Soon",
    game:  lang==="kz"?"🤖 Робот Ойыны":lang==="ru"?"🤖 Игра Роботов":"🤖 Robot Game",
    judge: lang==="kz"?"🏆 Бағалау":lang==="ru"?"🏆 Судейство":"🏆 Judging",
    F: lang==="kz"?"А":lang==="ru"?"П":"F",
    R: lang==="kz"?"Б":lang==="ru"?"К":"R",
  };

  const GameSection = ({ slot, badge }) => !slot ? null : (
    <div className="np-section">
      <div className="np-row">
        <span className={`np-badge np-badge--${badge}`}>{lbl[badge]}</span>
        <span className="np-time">{slot.time} · {FLL_RND[slot.rnd]?.[lang] ?? slot.rnd}</span>
      </div>
      <div className="np-teams">
        {slot.f.map((tm, i) => tm ? <span key={i} className="np-chip">{lbl.F}{i+1}·{tm}</span> : null)}
      </div>
    </div>
  );

  const JudgeSection = ({ slot, badge }) => !slot ? null : (
    <div className="np-section">
      <div className="np-row">
        <span className={`np-badge np-badge--${badge}`}>{lbl[badge]}</span>
        <span className="np-time">{slot.time}</span>
      </div>
      <div className="np-teams">
        {[1,2,3,4].map(n => slot.r[n] ? <span key={n} className="np-chip">{lbl.R}{n}·{slot.r[n]}</span> : null)}
      </div>
    </div>
  );

  return (
    <div className="np-wrap">
      {(curGame || nextGame) && (
        <div className="np-card">
          <div className="np-card-label">{lbl.game}</div>
          {curGame ? <GameSection slot={curGame} badge="now" /> : <GameSection slot={nextGame} badge="soon" />}
          {curGame && nextGame && <GameSection slot={nextGame} badge="next" />}
          {remGame > 0 && <div className="np-rem">{lang==="kz"?`Қалды: ${remGame} слот`:lang==="ru"?`Осталось: ${remGame} сл.`:`Left: ${remGame} slots`}</div>}
        </div>
      )}
      {(curJudge || nextJudge) && (
        <div className="np-card np-card--judge">
          <div className="np-card-label">{lbl.judge}</div>
          {curJudge ? <JudgeSection slot={curJudge} badge="now" /> : <JudgeSection slot={nextJudge} badge="soon" />}
          {curJudge && nextJudge && <JudgeSection slot={nextJudge} badge="next" />}
          {remJudge > 0 && <div className="np-rem">{lang==="kz"?`Қалды: ${remJudge} сессия`:lang==="ru"?`Осталось: ${remJudge} сесс.`:`Left: ${remJudge} sessions`}</div>}
        </div>
      )}
    </div>
  );
}

// ── EXPLORE LIVE BANNER ───────────────────────────────────────────────
function ExploreLiveBanner() {
  const { lang } = useLang();
  const now = useNow(20000);

  const judgeSlots = useMemo(() => EXPLORE_JUDGING.map(s => ({ ...s, ...parseSlotMs("30.06", s.time) })), []);

  const curJudge  = judgeSlots.find(s => now >= s.start && now < s.end);
  const nextJudge = judgeSlots.find(s => s.start > now);
  const remJudge  = judgeSlots.filter(s => s.start > now).length;

  if (!curJudge && !nextJudge) return null;

  const lbl = {
    now:   lang==="kz"?"🔴 ҚАЗІР":lang==="ru"?"🔴 СЕЙЧАС":"🔴 NOW",
    next:  lang==="kz"?"⏭ КЕЛЕСІ":lang==="ru"?"⏭ СЛЕДУЮЩИЙ":"⏭ NEXT",
    soon:  lang==="kz"?"⏰ Жақында":lang==="ru"?"⏰ Скоро":"⏰ Soon",
    judge: lang==="kz"?"🏆 Бағалау":lang==="ru"?"🏆 Судейство":"🏆 Judging",
    R: lang==="kz"?"Б":lang==="ru"?"К":"R",
  };

  const Section = ({ slot, badge }) => !slot ? null : (
    <div className="np-section">
      <div className="np-row">
        <span className={`np-badge np-badge--${badge}`}>{lbl[badge]}</span>
        <span className="np-time">{slot.time}</span>
      </div>
      <div className="np-teams">
        {[1,2,3,4].map(n => slot.r[n] ? <span key={n} className="np-chip">{lbl.R}{n}·{slot.r[n]}</span> : null)}
      </div>
    </div>
  );

  return (
    <div className="np-wrap">
      <div className="np-card np-card--judge">
        <div className="np-card-label">{lbl.judge}</div>
        {curJudge ? <Section slot={curJudge} badge="now" /> : <Section slot={nextJudge} badge="soon" />}
        {curJudge && nextJudge && <Section slot={nextJudge} badge="next" />}
        {remJudge > 0 && <div className="np-rem">{lang==="kz"?`Қалды: ${remJudge} сессия`:lang==="ru"?`Осталось: ${remJudge} сесс.`:`Left: ${remJudge} sessions`}</div>}
      </div>
    </div>
  );
}

// ── FLL GAME FULL SCHEDULE ────────────────────────────────────────────
function FLLGameSchedule() {
  const { lang } = useLang();
  const [day, setDay] = useState("30.06");
  const dayLabel = d => d === "30.06"
    ? (lang==="kz" ? "30 маусым" : lang==="ru" ? "30 июня" : "June 30")
    : (lang==="kz" ? "1 шілде"  : lang==="ru" ? "1 июля"  : "July 1");

  const groups = {};
  FLL_GAME_SLOTS.filter(s => s.day === day).forEach(s => {
    if (!groups[s.rnd]) groups[s.rnd] = [];
    groups[s.rnd].push(s);
  });
  const lblT = lang==="kz" ? "Уақыт" : lang==="ru" ? "Время" : "Time";

  return (
    <div className="fll-sched-wrap">
      <div className="fll-day-tabs">
        {["30.06","01.07"].map(d => (
          <button key={d} className={`fll-day-tab${day===d?" fll-day-tab--on":""}`} onClick={() => setDay(d)}>{dayLabel(d)}</button>
        ))}
      </div>
      {Object.entries(groups).map(([rnd, slots]) => (
        <div key={rnd} className="fll-rnd-block">
          <div className="fll-rnd-title">{FLL_RND[rnd]?.[lang] ?? rnd}</div>
          <div className="fll-sched-scroll">
            <div className="fll-sched-table fll-sched-table--6">
              <div className="fll-sched-head">
                <span>{lblT}</span>{[1,2,3,4,5,6].map(n => <span key={n}>F{n}</span>)}
              </div>
              {slots.map((slot, i) => (
                <div key={i} className="fll-sched-row">
                  <span className="fll-sched-time">{slot.time}</span>
                  {slot.f.map((tm, j) => <span key={j} className={`fll-sched-cell${!tm?" fll-sched-cell--empty":""}`}>{tm||"—"}</span>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FLLJudgingSchedule() {
  const { lang } = useLang();
  const [day, setDay] = useState("30.06");
  const dayLabel = d => d === "30.06"
    ? (lang==="kz" ? "30 маусым" : lang==="ru" ? "30 июня" : "June 30")
    : (lang==="kz" ? "1 шілде"  : lang==="ru" ? "1 июля"  : "July 1");
  const slots  = FLL_JUDGING.filter(s => s.day === day);
  const lblT   = lang==="kz" ? "Уақыт" : lang==="ru" ? "Время" : "Time";
  const lblR   = n => lang==="kz" ? `Бөлме ${n}` : lang==="ru" ? `Комн. ${n}` : `Room ${n}`;

  return (
    <div className="fll-sched-wrap">
      <div className="fll-day-tabs">
        {["30.06","01.07"].map(d => (
          <button key={d} className={`fll-day-tab${day===d?" fll-day-tab--on":""}`} onClick={() => setDay(d)}>{dayLabel(d)}</button>
        ))}
      </div>
      <div className="fll-sched-table fll-sched-table--4">
        <div className="fll-sched-head">
          <span>{lblT}</span>{[1,2,3,4].map(n => <span key={n}>{lblR(n)}</span>)}
        </div>
        {slots.map((slot, i) => (
          <div key={i} className="fll-sched-row">
            <span className="fll-sched-time">{slot.time}</span>
            {[1,2,3,4].map(n => <span key={n} className="fll-sched-cell">{slot.r[n]}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EXPLORE SCHEDULE VIEWS ────────────────────────────────────────────
function ExploreJudgingSchedule() {
  const { lang } = useLang();
  const lblT = lang==="kz" ? "Уақыт" : lang==="ru" ? "Время" : "Time";
  const lblR = n => lang==="kz" ? `Бөлме ${n}` : lang==="ru" ? `Комн. ${n}` : `Room ${n}`;
  return (
    <div className="fll-sched-wrap">
      <div className="fll-sched-table fll-sched-table--4">
        <div className="fll-sched-head">
          <span>{lblT}</span>{[1,2,3,4].map(n => <span key={n}>{lblR(n)}</span>)}
        </div>
        {EXPLORE_JUDGING.map((slot, i) => (
          <div key={i} className="fll-sched-row">
            <span className="fll-sched-time">{slot.time}</span>
            {[1,2,3,4].map(n => <span key={n} className={`fll-sched-cell${!slot.r[n]?" fll-sched-cell--empty":""}`}>{slot.r[n]||"—"}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExplorePitList() {
  const { lang } = useLang();
  const lblPit  = lang==="kz" ? "Пит №" : lang==="ru" ? "Пит №" : "Pit #";
  const lblTeam = lang==="kz" ? "Команда" : lang==="ru" ? "Команда" : "Team";
  return (
    <div className="explore-pit-wrap">
      <div className="explore-pit-header">
        <span>{lblPit}</span><span>{lblTeam}</span>
      </div>
      {EXPLORE_PITS.map(({ pit, team }) => (
        <div key={pit} className="explore-pit-row">
          <span className="explore-pit-num">{pit}</span>
          <span className="explore-pit-team">{team}</span>
        </div>
      ))}
    </div>
  );
}

// ── FLL TAB (Search / Robot Game / Judging) ───────────────────────────
function FLLTab() {
  const { lang } = useLang();
  const [sub, setSub] = useState("search");
  const subs = [
    { key:"search",  lbl: lang==="kz"?"Іздеу":lang==="ru"?"Поиск":"Search" },
    { key:"game",    lbl: lang==="kz"?"Робот Ойыны":lang==="ru"?"Игра Роботов":"Robot Game" },
    { key:"judging", lbl: lang==="kz"?"Бағалау":lang==="ru"?"Судейство":"Judging" },
  ];
  return (
    <div className="fll-tab-wrap">
      <FLLLiveBanner />
      <div className="fll-subtabs">
        {subs.map(s => (
          <button key={s.key} className={`fll-subtab${sub===s.key?" fll-subtab--on":""}`} onClick={() => setSub(s.key)}>{s.lbl}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.22}}>
          {sub==="search"  ? <FLLTeamSearch /> :
           sub==="game"    ? <FLLGameSchedule /> :
                             <FLLJudgingSchedule />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── EXPLORE TAB (Search / Judging / Pit Numbers) ──────────────────────
function ExploreTab() {
  const { lang } = useLang();
  const [sub, setSub] = useState("search");
  const subs = [
    { key:"search",  lbl: lang==="kz"?"Іздеу":lang==="ru"?"Поиск":"Search" },
    { key:"judging", lbl: lang==="kz"?"Бағалау":lang==="ru"?"Судейство":"Judging" },
    { key:"pits",    lbl: lang==="kz"?"Пит нөмірлері":lang==="ru"?"Пит номера":"Pit Numbers" },
  ];
  return (
    <div className="fll-tab-wrap">
      <ExploreLiveBanner />
      <div className="fll-subtabs">
        {subs.map(s => (
          <button key={s.key} className={`fll-subtab${sub===s.key?" fll-subtab--on":""}`} onClick={() => setSub(s.key)}>{s.lbl}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.22}}>
          {sub==="search"  ? <ExploreTeamSearch /> :
           sub==="judging" ? <ExploreJudgingSchedule /> :
                             <ExplorePitList />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── FTC JUDGING DATA (Tech Cup — Almaty Arena, 30.06.2026) ───────────
const FTC_JUDGING_TC = [
  { time:"12:00–12:15", r:{1:{name:"MLP",num:19163},2:{name:"Bil.Barbie",num:25272},3:{name:"Panheya(˔͟˔)",num:21058},4:{name:"POINT",num:22958}} },
  { time:"12:15–12:30", r:{1:{name:"Antares",num:24924},2:{name:"Y-Tech",num:29112},3:{name:"AMD",num:28588},4:{name:"URAN 92",num:25300}} },
  { time:"12:30–12:45", r:{1:{name:"RAI",num:26053},2:{name:"SANA",num:24697},3:{name:"Future vortex",num:30326},4:{name:"LionTech",num:34066}} },
  { time:"12:45–13:00", r:{1:{name:"North Star",num:21094},2:{name:"TGJ",num:33033},3:{name:"Red Lotus",num:28862},4:{name:"Nemeziz",num:28689}} },
  { time:"13:00–14:00", lunch:true },
  { time:"14:00–14:15", r:{1:{name:"Qazaq style",num:31881},2:{name:"ThunderBolts",num:32717},3:{name:"Celestial",num:32728},4:{name:"Gambit",num:33929}} },
  { time:"14:15–14:30", r:{1:{name:"EQUINITY",num:33420},2:{name:"Sirius",num:33422},3:{name:"Uly Dala",num:33444},4:{name:"Akita",num:33483}} },
  { time:"14:30–14:45", r:{1:{name:"AlemX",num:33655},2:{name:"Atomic Heart",num:33680},3:{name:"SunRise",num:33833},4:{name:"Berkut",num:34800}} },
  { time:"14:45–15:00", r:{1:{name:"NazarX",num:34241},2:{name:"OZGE",num:34350},3:{name:"DNA",num:34158},4:{name:"STAR LINE",num:29626}} },
];

// ── FTC JUDGING FULL SCHEDULE ──────────────────────────────────────────
function FTCJudgingSchedule() {
  const { lang } = useLang();
  const lblT = lang==="kz"?"Уақыт":lang==="ru"?"Время":"Time";
  const lblR = n => lang==="kz"?`Бөлме ${n}`:lang==="ru"?`Комн. ${n}`:`Room ${n}`;
  const lblL = lang==="kz"?"🍽 Түскі үзіліс":lang==="ru"?"🍽 Обеденный перерыв":"🍽 Lunch break";
  return (
    <div className="fll-sched-wrap">
      <div className="fll-sched-scroll">
        <div className="fll-sched-table fll-sched-table--4">
          <div className="fll-sched-head">
            <span>{lblT}</span>{[1,2,3,4].map(n => <span key={n}>{lblR(n)}</span>)}
          </div>
          {FTC_JUDGING_TC.map((slot, i) =>
            slot.lunch ? (
              <div key={i} className="fll-sched-row fll-sched-row--lunch">
                <span className="fll-sched-time">{slot.time}</span>
                <span className="fll-sched-lunch" style={{gridColumn:"2 / -1"}}>{lblL}</span>
              </div>
            ) : (
              <div key={i} className="fll-sched-row">
                <span className="fll-sched-time">{slot.time}</span>
                {[1,2,3,4].map(n => (
                  <span key={n} className={`fll-sched-cell${slot.r[n]?.name==="AlemX"?" fll-sched-cell--highlight":""}`}>
                    {slot.r[n] ? <>{slot.r[n].name}<em className="ftc-cell-num"> #{slot.r[n].num}</em></> : "—"}
                  </span>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── FTC TEAM SEARCH (local schedule + FTC Scout API) ──────────────────
function FTCTeamSearch() {
  const { lang } = useLang();
  const [query, setQuery]         = useState("");
  const [selected, setSelected]   = useState(null);
  const [scoutData, setScoutData] = useState(null);
  const [scoutLoading, setScoutLoading] = useState(false);
  const now = useNow(20000);

  const slottedTeams = useMemo(() => {
    const list = [];
    FTC_JUDGING_TC.forEach(slot => {
      if (slot.lunch) return;
      const { start, end } = parseSlotMs("30.06", slot.time);
      [1,2,3,4].forEach(n => {
        if (slot.r[n]) list.push({ ...slot.r[n], time: slot.time, room: n, start, end });
      });
    });
    return list;
  }, []);

  const allSlotStarts = useMemo(() =>
    FTC_JUDGING_TC.filter(s => !s.lunch).map(s => parseSlotMs("30.06", s.time).start),
  []);

  const qn = useMemo(() => fllNorm(query), [query]);

  const matchingTeams = useMemo(() => {
    if (!qn) return [];
    return slottedTeams.filter(t =>
      fllNorm(t.name).includes(qn) || String(t.num).includes(query.trim())
    );
  }, [qn, query, slottedTeams]);

  const openTeam = async (team) => {
    setSelected(team);
    setScoutData(null);
    setScoutLoading(true);
    try {
      const d = await ftcGql(Q_TEAM, { n: team.num, s: FTC_SEASON });
      setScoutData(d.teamByNumber ?? null);
    } catch (_) {
      setScoutData(null);
    } finally {
      setScoutLoading(false);
    }
  };

  const L = {
    ph:   lang==="kz"?"Команда атын немесе нөмірін іздеу...":lang==="ru"?"Поиск по названию или номеру...":"Search by name or number...",
    hint: lang==="kz"?"Команда атын жазыңыз — тізімнен таңдаңыз":lang==="ru"?"Введите название — выберите из списка":"Type a name — select from the list",
    nf:   lang==="kz"?"Команда табылмады":lang==="ru"?"Команда не найдена":"Team not found",
    back: lang==="kz"?"← Артқа":lang==="ru"?"← Назад":"← Back",
    J:    lang==="kz"?"⏰ Бағалау уақыты":lang==="ru"?"⏰ Время судейства":"⏰ Judging slot",
    R:    lang==="kz"?"Бөлме":lang==="ru"?"Комната":"Room",
    stats:lang==="kz"?"📊 FTC Scout статистикасы":lang==="ru"?"📊 Статистика FTC Scout":"📊 FTC Scout stats",
    load: lang==="kz"?"Жүктелуде...":lang==="ru"?"Загрузка...":"Loading...",
    na:   lang==="kz"?"Деректер жоқ":lang==="ru"?"Нет данных":"No data",
  };

  const slotBadge = (start, end) => {
    const isNow  = now >= start && now < end;
    const isPast = now >= end;
    const slotsBefore = allSlotStarts.filter(s => s > now && s < start).length;
    const msBefore    = Math.max(0, start - now);
    if (isNow)  return <span className="np-before np-before--now">{lang==="kz"?"🔴 Бағалауда!":lang==="ru"?"🔴 На судействе!":"🔴 Being judged!"}</span>;
    if (isPast) return <span className="np-before np-before--past">{lang==="kz"?"Өтті":lang==="ru"?"Завершено":"Done"}</span>;
    if (slotsBefore === 0) return <span className="np-before np-before--next">{lang==="kz"?"⏭ Келесі сіздер!":lang==="ru"?"⏭ Вы следующие!":"⏭ You're next!"}</span>;
    return <span className="np-before">{lang==="kz"?`${slotsBefore} слот алда · ${fmtMs(msBefore,lang)}`:lang==="ru"?`${slotsBefore} сл. до вас · ${fmtMs(msBefore,lang)}`:`${slotsBefore} slots ahead · ${fmtMs(msBefore,lang)}`}</span>;
  };

  if (selected) {
    const qs = scoutData?.quickStats;
    return (
      <div className="fll-search-wrap">
        <button className="fll-detail-back" onClick={() => { setSelected(null); setScoutData(null); }}>{L.back}</button>
        <div className="fll-detail-name">{selected.name} <span className="ftc-detail-num">#{selected.num}</span></div>

        <div className="fll-hit-section">
          <div className="fll-hit-section-title">{L.J}</div>
          <div className="fll-hit-card fll-hit-card--judge">
            <div className="fll-hit-left">
              <div className="fll-hit-time">{selected.time}</div>
              <div className="fll-hit-day">30.06</div>
            </div>
            <div className="fll-hit-right">
              <div className="fll-hit-field">{L.R} {selected.room} · <strong>{selected.name}</strong></div>
              {slotBadge(selected.start, selected.end)}
            </div>
          </div>
        </div>

        <div className="fll-hit-section">
          <div className="fll-hit-section-title">{L.stats}</div>
          {scoutLoading ? (
            <div className="ftc-scout-loading">{L.load}</div>
          ) : qs ? (
            <div className="ftc-scout-stats">
              {[
                {label:"Total OPR",   v:qs.tot?.value,  rank:qs.tot?.rank,  col:"#a855f7"},
                {label:"Auto OPR",    v:qs.auto?.value, rank:qs.auto?.rank, col:"#7c3aed"},
                {label:"Teleop OPR",  v:qs.dc?.value,   rank:qs.dc?.rank,   col:"#c084fc"},
                {label:"Endgame OPR", v:qs.eg?.value,   rank:qs.eg?.rank,   col:"#f472b6"},
              ].map(({label,v,rank,col}) => (
                <div key={label} className="ftc-scout-stat-row">
                  <span className="ftc-scout-stat-label">{label}</span>
                  <span className="ftc-scout-stat-value" style={{color:col}}>
                    {v != null ? v.toFixed(2) : "—"}
                  </span>
                  {rank != null && <span className="ftc-scout-stat-rank">#{rank}</span>}
                </div>
              ))}
              {scoutData?.location && (
                <div className="ftc-scout-loc">
                  📍 {[scoutData.location.city, scoutData.location.country].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          ) : (
            <div className="ftc-scout-loading">{L.na}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fll-search-wrap">
      <div className="tc-search-bar fll-search-bar">
        <svg className="tc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input className="tc-search-input fll-input" type="text" placeholder={L.ph}
          value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" spellCheck={false} />
      </div>
      {!query && <div className="fll-search-hint">{L.hint}</div>}
      {query && (
        <AnimatePresence mode="wait">
          <motion.div key={qn||"_"} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}>
            {matchingTeams.length === 0
              ? <div className="fll-not-found">{L.nf}</div>
              : <div className="fll-team-list">
                  {matchingTeams.map(team => (
                    <button key={team.num} className="fll-team-row" onClick={() => openTeam(team)}>
                      <span className="fll-team-row-name">{team.name}</span>
                      <span className="fll-team-row-num">#{team.num}</span>
                      <span className="fll-team-row-arr">›</span>
                    </button>
                  ))}
                </div>
            }
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ── FTC TAB — Search + Schedule + Streams ─────────────────────────────
function FTCTab({ t }) {
  const { lang } = useLang();
  const [sub, setSub] = useState("search");
  const subs = [
    { key:"search",   lbl: lang==="kz"?"Іздеу":lang==="ru"?"Поиск":"Search" },
    { key:"schedule", lbl: lang==="kz"?"Кесте":lang==="ru"?"Расписание":"Schedule" },
    { key:"streams",  lbl: lang==="kz"?"Стрим":lang==="ru"?"Стримы":"Streams" },
  ];
  const streams = [
    { title:"FTC Stream 1", url:FTC_STREAM1_URL },
    { title:"FTC Stream 2", url:FTC_STREAM2_URL },
  ];
  return (
    <div className="fll-tab-wrap">
      <div className="fll-subtabs">
        {subs.map(s => (
          <button key={s.key} className={`fll-subtab${sub===s.key?" fll-subtab--on":""}`} onClick={() => setSub(s.key)}>{s.lbl}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.22}}>
          {sub==="search" ? <FTCTeamSearch /> :
           sub==="schedule" ? <FTCJudgingSchedule /> : (
            <div className="ftc-streams-wrap">
              {streams.map((s, i) => (
                <div key={i} className="ftc-stream-block">
                  {s.url
                    ? (
                      <div className="tc-embed__frame-wrap">
                        <iframe className="tc-embed__frame" src={tcEmbedUrl(s.url)} title={s.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    ) : (
                      <div className="tc-embed-soon">
                        <span className="tc-embed-soon__label">{s.title}</span>
                        <p className="tc-embed-soon__msg">{t("tc.stream.soon")}</p>
                      </div>
                    )
                  }
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── RULES TAB — announcement + video + location ───────────────────────
const RULES_CONTENT = {
  kz: [
    "🌟 Құрметті Almaty Tech Cup XII қатысушылары!",
    "Жарыс басталар алдында келесі ережелерге назар аударыңыз:",
    "",
    "1️⃣ Кортта, трибунада және пит-зонада тамақ ішуге тыйым салынады. ❌",
    "",
    "2️⃣ Қабырғаларға және парталарға таспа (скотч) жабыстыруға болмайды. 🚫",
    "",
    "3️⃣ Ұзартқыш сымды (удлинитель) өзіңізбен ала келіңіз. 🔌",
    "",
    "4️⃣ Арена аумағында және пит-зонада аралау, кесу, бұрғылау және басқа да қауіпті құралдарды қолдануға тыйым салынады. ⚠️",
    "",
    "5️⃣ Әрбір қатысушыға білезік пен Driver team қатысушыларына жапсырма беріледі. 🎫",
    "🔹 Білезік - Almaty Arena ғимаратына кіру үшін міндетті.",
    "🔹 Жапсырма - корт аумағына кіру үшін міндетті.",
    "Білезік немесе жапсырма болмаған жағдайда тиісті аймаққа кіруге рұқсат етілмейді.",
    "",
    "6️⃣ Корт аумағына тек жапсырмасы бар Driver Team қатысушыларына ғана кіруге рұқсат етіледі.",
    "Пит зоналар 2 этажда, төрешілік кабинет 1 этажда орналасқан.",
  ],
  ru: [
    "🌟 Уважаемые участники Almaty Tech Cup XII!",
    "Перед началом соревнований обратите внимание на следующие правила:",
    "",
    "1️⃣ Запрещается принимать пищу на корте, трибунах и в пит-зоне. ❌",
    "",
    "2️⃣ Нельзя клеить скотч на стены и парты. 🚫",
    "",
    "3️⃣ Возьмите с собой удлинитель. 🔌",
    "",
    "4️⃣ Запрещается использовать пилы, ножи, дрели и другие опасные инструменты на территории арены и в пит-зоне. ⚠️",
    "",
    "5️⃣ Каждому участнику выдаётся браслет, а участникам Driver Team — стикер. 🎫",
    "🔹 Браслет — обязателен для входа в здание Almaty Arena.",
    "🔹 Стикер — обязателен для входа на территорию корта.",
    "Без браслета или стикера вход в соответствующую зону запрещён.",
    "",
    "6️⃣ На территорию корта допускаются только участники Driver Team со стикерами.",
    "Пит-зоны находятся на 2 этаже, судейские комнаты — на 1 этаже.",
  ],
  en: [
    "🌟 Dear Almaty Tech Cup XII participants!",
    "Please note the following rules before the competition begins:",
    "",
    "1️⃣ Food and drinks are not allowed on the court, stands, or in the pit area. ❌",
    "",
    "2️⃣ Tape may not be applied to walls or desks. 🚫",
    "",
    "3️⃣ Please bring your own extension cord. 🔌",
    "",
    "4️⃣ Sawing, cutting, drilling and other dangerous tools are prohibited in the arena and pit area. ⚠️",
    "",
    "5️⃣ Each participant receives a wristband; Driver Team members receive a sticker. 🎫",
    "🔹 Wristband — required to enter the Almaty Arena building.",
    "🔹 Sticker — required to enter the court area.",
    "Without a wristband or sticker, entry to the respective area is prohibited.",
    "",
    "6️⃣ Only Driver Team members with stickers are allowed on the court.",
    "Pit zones are on the 2nd floor; judging rooms are on the 1st floor.",
  ],
};

function RulesTab({ t }) {
  const { lang } = useLang();
  const lines = RULES_CONTENT[lang] ?? RULES_CONTENT.ru;
  return (
    <div className="rules-tab">
      {TC_RULES_VIDEO_URL && (
        <div className="tc-embed__frame-wrap rules-video-wrap">
          <iframe className="tc-embed__frame" src={tcEmbedUrl(TC_RULES_VIDEO_URL)} title="Rules Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      )}
      <div className="rules-text-card">
        {lines.map((line, i) =>
          line
            ? <p key={i} className="rules-line">{line}</p>
            : <div key={i} className="rules-spacer" />
        )}
      </div>
    </div>
  );
}

// ── MY TEAM TAB ───────────────────────────────────────────────────────
function MyTeamTab() {
  const { lang } = useLang();
  const nowSec = useNow(1000);

  const [myTeam, setMyTeam] = useState(() => {
    try { return localStorage.getItem("tc-my-team") || null; } catch { return null; }
  });
  const [query, setQuery] = useState("");
  const qn = useMemo(() => fllNorm(query), [query]);

  const saveTeam = useCallback(team => {
    setMyTeam(team); setQuery("");
    try { localStorage.setItem("tc-my-team", team); } catch {}
  }, []);
  const clearTeam = useCallback(() => {
    setMyTeam(null);
    try { localStorage.removeItem("tc-my-team"); } catch {}
  }, []);

  const allTeams = useMemo(() => {
    const set = new Set();
    FLL_GAME_SLOTS.forEach(s => s.f.forEach(t => t && set.add(t)));
    FLL_JUDGING.forEach(s => Object.values(s.r).forEach(t => t && set.add(t)));
    EXPLORE_JUDGING.forEach(s => Object.values(s.r).forEach(t => t && set.add(t)));
    EXPLORE_PITS.forEach(p => set.add(p.team));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, []);

  const matchingTeams = useMemo(() =>
    qn ? allTeams.filter(t => fllNorm(t).includes(qn)) : allTeams,
    [qn, allTeams]
  );

  const gameSlotsTimed = useMemo(() => FLL_GAME_SLOTS.map(s => ({ ...s, ...parseSlotMs(s.day, s.time) })), []);
  const fllJudgeTimed  = useMemo(() => FLL_JUDGING.map(s => ({ ...s, ...parseSlotMs(s.day, s.time) })), []);
  const expJudgeTimed  = useMemo(() => EXPLORE_JUDGING.map(s => ({ ...s, ...parseSlotMs("30.06", s.time) })), []);

  const myGameSlots = useMemo(() => {
    if (!myTeam) return [];
    const sn = fllNorm(myTeam);
    return gameSlotsTimed.map(slot => {
      const fields = slot.f.reduce((acc, tm, i) => { if (tm && fllNorm(tm) === sn) acc.push(i+1); return acc; }, []);
      return fields.length ? { ...slot, fields } : null;
    }).filter(Boolean);
  }, [myTeam, gameSlotsTimed]);

  const myFLLJudge = useMemo(() => {
    if (!myTeam) return null;
    const sn = fllNorm(myTeam);
    const s = fllJudgeTimed.find(sl => Object.values(sl.r).some(t => t && fllNorm(t) === sn));
    if (!s) return null;
    const room = Object.entries(s.r).find(([, t]) => t && fllNorm(t) === sn)?.[0];
    return { ...s, room };
  }, [myTeam, fllJudgeTimed]);

  const myExpJudge = useMemo(() => {
    if (!myTeam) return null;
    const sn = fllNorm(myTeam);
    const s = expJudgeTimed.find(sl => Object.values(sl.r).some(t => t && fllNorm(t) === sn));
    if (!s) return null;
    const room = Object.entries(s.r).find(([, t]) => t && fllNorm(t) === sn)?.[0];
    return { ...s, room };
  }, [myTeam, expJudgeTimed]);

  const myPit = useMemo(() => {
    if (!myTeam) return null;
    const sn = fllNorm(myTeam);
    return EXPLORE_PITS.find(p => fllNorm(p.team) === sn) ?? null;
  }, [myTeam]);

  const { curEvent, nxtEvent } = useMemo(() => {
    const all = [];
    myGameSlots.forEach(s => all.push({ start:s.start, end:s.end, label:FLL_RND[s.rnd]?.[lang]??s.rnd }));
    if (myFLLJudge) all.push({ start:myFLLJudge.start, end:myFLLJudge.end, label:lang==="kz"?"🏆 Бағалау":lang==="ru"?"🏆 Судейство":"🏆 Judging" });
    if (myExpJudge) all.push({ start:myExpJudge.start, end:myExpJudge.end, label:lang==="kz"?"🏆 Бағалау (Explore)":lang==="ru"?"🏆 Судейство (Explore)":"🏆 Judging (Explore)" });
    all.sort((a,b) => a.start - b.start);
    return {
      curEvent: all.find(e => nowSec >= e.start && nowSec < e.end) ?? null,
      nxtEvent: all.find(e => e.start > nowSec) ?? null,
    };
  }, [myGameSlots, myFLLJudge, myExpJudge, lang, nowSec]);

  const fmtCd = ms => {
    if (ms <= 0) return "00:00";
    const h = Math.floor(ms / 3600000), m = Math.floor((ms%3600000)/60000), s = Math.floor((ms%60000)/1000);
    return h ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
             : `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const L = {
    pick: lang==="kz"?"Командамды таңдаңыз":lang==="ru"?"Выберите вашу команду":"Select your team",
    all:  lang==="kz"?"Барлық командалар":lang==="ru"?"Все команды":"All teams",
    srch: lang==="kz"?"Команда іздеу...":lang==="ru"?"Поиск команды...":"Search team...",
    chg:  lang==="kz"?"Өзгерту":lang==="ru"?"Изменить":"Change",
    nxt:  lang==="kz"?"Келесі матч":lang==="ru"?"Следующий матч":"Next match",
    now:  lang==="kz"?"🔴 Қазір!":lang==="ru"?"🔴 Сейчас!":"🔴 Now!",
    done: lang==="kz"?"Барлық матчтар аяқталды ✅":lang==="ru"?"Все матчи завершены ✅":"All matches done ✅",
    G:    lang==="kz"?"🤖 Робот Ойыны":lang==="ru"?"🤖 Игра Роботов":"🤖 Robot Game",
    J:    lang==="kz"?"🏆 Бағалау":lang==="ru"?"🏆 Судейство":"🏆 Judging",
    P:    lang==="kz"?"📍 Пит нөмірі":lang==="ru"?"📍 Пит номер":"📍 Pit #",
    F:    lang==="kz"?"Алаң":lang==="ru"?"Поле":"Field",
    R:    lang==="kz"?"Бөлме":lang==="ru"?"Комната":"Room",
  };

  const badge = (start, end, listForBefore) => {
    const isNow  = nowSec >= start && nowSec < end;
    const isPast = nowSec >= end;
    const sb = listForBefore.filter(s => s.start > nowSec && s.start < start).length;
    const ms = Math.max(0, start - nowSec);
    if (isNow)  return <span className="np-before np-before--now">🔴 {lang==="kz"?"Қазір!":lang==="ru"?"Сейчас!":"Now!"}</span>;
    if (isPast) return <span className="np-before np-before--past">{lang==="kz"?"Өтті":lang==="ru"?"Завершено":"Done"}</span>;
    if (sb===0) return <span className="np-before np-before--next">⏭ {lang==="kz"?"Келесі!":lang==="ru"?"Следующий!":"Next!"}</span>;
    return <span className="np-before">{sb} {lang==="kz"?"алда":lang==="ru"?"до вас":"ahead"} · {fmtMs(ms,lang)}</span>;
  };

  // ── PICKER ──
  if (!myTeam) return (
    <div className="my-team-wrap">
      <div className="my-team-pick-title">{L.pick}</div>
      <div className="tc-search-bar fll-search-bar">
        <svg className="tc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input className="tc-search-input fll-input" type="text" placeholder={L.srch}
          value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" spellCheck={false} />
      </div>
      {!query && <div className="fll-search-hint">{L.all} ({allTeams.length})</div>}
      <div className="fll-team-list my-team-list">
        {matchingTeams.map(team => (
          <button key={team} className="fll-team-row" onClick={() => saveTeam(team)}>
            <span className="fll-team-row-name">{team}</span>
            <span className="fll-team-row-arr">›</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ── SCHEDULE VIEW ──
  return (
    <div className="my-team-wrap">
      <div className="my-team-header">
        <div className="my-team-name">{myTeam}</div>
        <button className="my-team-action" onClick={clearTeam}>{L.chg}</button>
      </div>

      {curEvent ? (
        <div className="my-team-cd my-team-cd--live">
          <div className="my-team-cd-label">{L.now}</div>
          <div className="my-team-cd-event">{curEvent.label}</div>
        </div>
      ) : nxtEvent ? (
        <div className="my-team-cd">
          <div className="my-team-cd-label">{L.nxt}: {nxtEvent.label}</div>
          <div className="my-team-cd-timer">{fmtCd(nxtEvent.start - nowSec)}</div>
        </div>
      ) : (
        <div className="my-team-cd my-team-cd--done">
          <div className="my-team-cd-label">{L.done}</div>
        </div>
      )}

      {myGameSlots.length > 0 && (
        <div className="fll-hit-section">
          <div className="fll-hit-section-title">{L.G}</div>
          {myGameSlots.map((slot, i) => (
            <div key={i} className={`fll-hit-card fll-hit-card--game${nowSec>=slot.end?" fll-hit-card--past":""}`}>
              <div className="fll-hit-left">
                <div className="fll-hit-time">{slot.time}</div>
                <div className="fll-hit-day">{slot.day}</div>
              </div>
              <div className="fll-hit-right">
                <div className="fll-hit-round">{FLL_RND[slot.rnd]?.[lang]??slot.rnd}</div>
                {slot.fields.map(fn => <div key={fn} className="fll-hit-field">{L.F} {fn}</div>)}
                {badge(slot.start, slot.end, gameSlotsTimed)}
              </div>
            </div>
          ))}
        </div>
      )}

      {myFLLJudge && (
        <div className="fll-hit-section">
          <div className="fll-hit-section-title">{L.J}</div>
          <div className={`fll-hit-card fll-hit-card--judge${nowSec>=myFLLJudge.end?" fll-hit-card--past":""}`}>
            <div className="fll-hit-left">
              <div className="fll-hit-time">{myFLLJudge.time}</div>
              <div className="fll-hit-day">{myFLLJudge.day}</div>
            </div>
            <div className="fll-hit-right">
              <div className="fll-hit-field">{L.R} {myFLLJudge.room} · <strong>{myTeam}</strong></div>
              {badge(myFLLJudge.start, myFLLJudge.end, fllJudgeTimed)}
            </div>
          </div>
        </div>
      )}

      {myPit && (
        <div className="fll-hit-section">
          <div className="fll-hit-section-title">{L.P}</div>
          <div className="fll-hit-card fll-hit-card--pit">
            <span className="fll-pit-num">{myPit.pit}</span>
            <span className="fll-pit-team">{myPit.team}</span>
          </div>
        </div>
      )}

      {myExpJudge && (
        <div className="fll-hit-section">
          <div className="fll-hit-section-title">{L.J} (FLL Explore)</div>
          <div className={`fll-hit-card fll-hit-card--judge${nowSec>=myExpJudge.end?" fll-hit-card--past":""}`}>
            <div className="fll-hit-left">
              <div className="fll-hit-time">{myExpJudge.time}</div>
              <div className="fll-hit-day">30.06</div>
            </div>
            <div className="fll-hit-right">
              <div className="fll-hit-field">{L.R} {myExpJudge.room} · <strong>{myTeam}</strong></div>
              {badge(myExpJudge.start, myExpJudge.end, expJudgeTimed)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TechCupPage({ onClose }) {
  const t = useT();
  const { lang, setLang } = useLang();
  const [tab, setTab] = useState("myteam");
  return (
    <div className="sub-page">
      <div className="sub-page__topbar">
        <button className="sub-page__back" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {t("search.back")}
        </button>
        <div className="sub-page__title">
          <span className="sub-page__eye">AlemX · 2026</span>
          <h2>Tech Cup</h2>
        </div>
        <div className="tc-lang-row tc-lang-row--inline">
          {["kz","ru","en"].map(l => (
            <button key={l} className={`tc-lang-btn${lang===l?" tc-lang-btn--on":""}`} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <Countdown />

      <div className="tc-tabs">
        {TC_TABS.map(tb => (
          <button
            key={tb.key}
            className={`tc-tab${tab === tb.key ? " tc-tab--on" : ""}${tb.key === "chat" ? " tc-tab--chat" : ""}`}
            onClick={() => setTab(tb.key)}
          >
            {tb.label ?? t(`tc.tab.${tb.key}`)}
          </button>
        ))}
      </div>

      <div className={`sub-page__body${tab === "chat" ? " sub-page__body--chat" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.26 }}
            style={tab === "chat" ? { height: "100%" } : {}}
          >
            {tab === "chat"    ? <TechCupChat /> :
             tab === "myteam"  ? <MyTeamTab /> :
             tab === "fll"     ? <FLLTab /> :
             tab === "explore" ? <ExploreTab /> :
             tab === "ftc"     ? <FTCTab t={t} /> :
             tab === "rules"   ? <RulesTab t={t} /> :
             <TechCupComingSoon label={TC_TABS.find(tb => tb.key === tab)?.label ?? t(`tc.tab.${tab}`)} t={t} />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function TechCupComingSoon({ label, t }) {
  return (
    <div className="tc-soon">
      <div className="tc-soon__pulse" />
      <h3 className="tc-soon__title">{t("tc.soon")}</h3>
      <p className="tc-soon__desc">{t("tc.soon.desc")}</p>
      <div className="tc-soon__badge">{label}</div>
    </div>
  );
}

// ── COUNTDOWN ────────────────────────────────────────────────────────
// ↓↓ ТУРНИР КҮНІН ОСЫНДА ӨЗГЕРТІҢІЗ ↓↓
const TC_EVENT_DATE = new Date("2026-06-30T08:00:00+05:00");

function useCountdown(target) {
  const [delta, setDelta] = useState(() => target - Date.now());
  useEffect(() => {
    const iv = setInterval(() => setDelta(target - Date.now()), 1000);
    return () => clearInterval(iv);
  }, [target]);
  return Math.max(0, delta);
}

function Countdown() {
  const delta = useCountdown(TC_EVENT_DATE.getTime());
  const units = [
    { v: Math.floor(delta / 86400e3),               l: "күн"  },
    { v: Math.floor((delta % 86400e3) / 3600e3),    l: "сағ"  },
    { v: Math.floor((delta % 3600e3) / 60e3),       l: "мин"  },
    { v: Math.floor((delta % 60e3) / 1000),         l: "сек"  },
  ];
  if (delta === 0) return (
    <div className="tc-live-now">
      <span className="tc-live-dot"/>
      <span>ТУРНИР ЖҮРІП ЖАТЫР</span>
    </div>
  );
  return (
    <motion.div className="tc-countdown"
      initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
      <div className="tc-countdown__label">Tech Cup дейін</div>
      <div className="tc-countdown__nums">
        {units.map(({v,l},i) => (
          <div key={l} className="tc-countdown__cell">
            <div className="tc-countdown__unit">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={v}
                  className="tc-countdown__n"
                  initial={{y:-14,opacity:0}} animate={{y:0,opacity:1}} exit={{y:14,opacity:0}}
                  transition={{duration:0.18}}
                >{String(v).padStart(2,"0")}</motion.span>
              </AnimatePresence>
              <span className="tc-countdown__l">{l}</span>
            </div>
            {i < 3 && <span className="tc-countdown__sep">:</span>}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── TECH CUP CHAT ────────────────────────────────────────────────────
const CHAT_PATH = "techcup-chat-2026";

function TechCupChat() {
  const [msgs, setMsgs]   = useState([]);
  const [text, setText]   = useState("");
  const [name, setName]   = useState(() => localStorage.getItem("__tc_name") || "");
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!FIREBASE_READY) return;
    let off;
    initFirebase().then(ok => {
      if (!ok) return;
      setReady(true);
      const q = FB.fbQuery(FB.fbRef(FB.db, CHAT_PATH), FB.fbLimitToLast(100));
      off = FB.fbOnValue(q, snap => {
        const list = [];
        snap.forEach(c => list.push({ id: c.key, ...c.val() }));
        setMsgs(list);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
      });
    });
    return () => off?.();
  }, []);

  const saveName = v => { setName(v); localStorage.setItem("__tc_name", v); };

  const send = async () => {
    if (!text.trim() || !ready) return;
    setSending(true);
    await FB.fbPush(FB.fbRef(FB.db, CHAT_PATH), {
      name: name.trim() || "Қонақ",
      text: text.trim(),
      ts: Date.now(),
    });
    setText("");
    setSending(false);
  };

  const onKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  if (!FIREBASE_READY) return (
    <div className="tc-chat-setup">
      <MessageCircle size={28} className="tc-chat-setup__icon"/>
      <h3>Чатты іске қосу керек</h3>
      <p>
        <b>firebase.js</b> файлында Firebase конфигурациясын толтырыңыз.<br/>
        console.firebase.google.com → Жаңа жоба → Realtime Database → Test mode
      </p>
    </div>
  );

  if (!ready) return (
    <div className="tc-chat-setup">
      <span className="ts-spinner ts-spinner--lg"/>
    </div>
  );

  return (
    <div className="tc-chat">
      <div className="tc-chat__msgs">
        {msgs.length === 0 && (
          <div className="tc-chat__empty">Алғашқы хабарламаны жіберіңіз!</div>
        )}
        {msgs.map((m, i) => {
          const isNew = Date.now() - m.ts < 5000;
          return (
            <motion.div
              key={m.id}
              className="tc-chat__bubble"
              initial={isNew ? {opacity:0,y:10} : false}
              animate={{opacity:1,y:0}}
              transition={{duration:0.22}}
            >
              <div className="tc-chat__meta">
                <span className="tc-chat__author">{m.name}</span>
                <span className="tc-chat__time">{fmtAgo(Date.now() - m.ts)}</span>
              </div>
              <div className="tc-chat__text">{m.text}</div>
            </motion.div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      <div className="tc-chat__composer">
        <input
          className="tc-chat__name-in"
          placeholder="Атыңыз (міндетті емес)"
          value={name}
          onChange={e => saveName(e.target.value)}
          maxLength={24}
        />
        <div className="tc-chat__row">
          <input
            className="tc-chat__msg-in"
            placeholder="Хабарлама жазыңыз…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
            maxLength={300}
          />
          <button
            className={`tc-chat__send${sending ? " tc-chat__send--busy" : ""}`}
            onClick={send}
            disabled={sending || !text.trim()}
          >
            <Send size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── URL helpers ───────────────────────────────────────────────────────
const getPathPage = () => {
  const p = window.location.pathname.replace(/\/+$/, "");
  if (p === "/ftcscout") return "ftcscout";
  if (p === "/techcup")  return "techcup";
  return null;
};

// ── APP ───────────────────────────────────────────────────────────────
export default function App() {
  const t          = useT();
  const scrollY    = useMotionValue(0);
  const lenisRef   = useRef(null);
  const [pageView, setPageView] = useState(getPathPage);

  // Clean up old localStorage keys from previous version
  useEffect(() => {
    ["__al_history", "__al_seeded", "__al_online"].forEach(k => localStorage.removeItem(k));
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: x => Math.min(1, 1.001 - Math.pow(2, -10 * x)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
    });
    lenisRef.current = lenis;
    // if page opened via direct URL, keep lenis running — data-lenis-prevent
    // on the overlay handles scroll isolation without setting overflow:clip on html
    lenis.on("scroll", ({ scroll }) => scrollY.set(scroll));
    let rafId;
    const raf = ts => { lenis.raf(ts); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); lenisRef.current = null; };
  }, [scrollY]);

  // Resume Lenis when sub-page closes; when open, data-lenis-prevent on the
  // overlay prevents Lenis from swallowing wheel events (lenis.stop() would set
  // overflow:clip on <html> which blocks scroll inside the fixed sub-page).
  useEffect(() => {
    const l = lenisRef.current;
    if (!l) return;
    if (!pageView) l.start();
  }, [pageView]);

  // URL navigation
  const openPage = useCallback((page) => {
    setPageView(page);
    window.history.pushState({ page }, "", `/${page}`);
  }, []);

  const closePage = useCallback(() => {
    setPageView(null);
    window.history.pushState({}, "", "/");
  }, []);

  // Browser back / forward
  useEffect(() => {
    const onPop = () => setPageView(getPathPage());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div className="app-shell">
      <ScrollProgress />
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-grid" />

      <Navbar scrollY={scrollY} onOpenPage={openPage} />
      <MobileNav onOpenPage={openPage} />

      <main>
        <Hero scrollY={scrollY} />

        <Sec id="robot" eye={t("sec.robot.eye")} title={t("sec.robot.title")} desc={t("sec.robot.desc")}>
          <RobotStage />
        </Sec>

        <Sec id="team" eye={t("sec.team.eye")} title={t("sec.team.title")} desc={t("sec.team.desc")}>
          <div className="team-mentors">
            {teamMembers.filter(m => m.role === "Mentor").map((m, i) => (
              <TeamMember key={m.name} m={m} i={i} />
            ))}
          </div>
          <div className="team-grid">
            {teamMembers.filter(m => m.role !== "Mentor").map((m, i) => (
              <TeamMember key={m.name} m={m} i={i + 2} />
            ))}
          </div>
        </Sec>

        <Sec id="auto" eye={t("sec.auto.eye")} title={t("sec.auto.title")} desc={t("sec.auto.desc")}>
          <PedroTabs />
        </Sec>

        <Sec id="ranking" eye={t("sec.ranking.eye")} title={t("sec.ranking.title")} desc={t("sec.ranking.desc")}>
          <RankingSection />
        </Sec>

        <Sec id="portfolio" eye={t("sec.portfolio.eye")} title={t("sec.portfolio.title")} desc={t("sec.portfolio.desc")}>
          <div className="pf-grid">
            {portfolioItems.map((item, i) => <PortfolioCard key={item.title} item={item} i={i} />)}
          </div>
        </Sec>

        <Sec id="extras" eye={t("sec.extras.eye")} title={t("sec.extras.title")} desc={t("sec.extras.desc")}>
          <AchievementsCarousel />
        </Sec>
      </main>

      <Footer />

      <AnimatePresence>
        {pageView && (
          <motion.div
            key={pageView}
            className="sub-page-wrap"
            data-lenis-prevent
            initial={{ x: "100vw" }}
            animate={{ x: 0 }}
            exit={{ x: "100vw" }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {pageView === "ftcscout"
              ? <FTCScoutPage onClose={closePage} />
              : <TechCupPage  onClose={closePage} />
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
