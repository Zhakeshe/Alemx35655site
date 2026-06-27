import { createContext, useContext, useState } from "react";

const T = {
  kz: {
    "nav.team": "Команда", "nav.robot": "Робот", "nav.auto": "Авто",
    "nav.portfolio": "Портфолио", "nav.season": "Маусым", "nav.achievements": "Жетістіктер",
    "hero.tag": "First Tech Challenge · Қазақстан",
    "sec.robot.eye": "Біздің Роботымыз", "sec.robot.title": "Robot Stage",
    "sec.robot.desc": "AlemX #33655 командасының FTC роботы. 3D-модель жақын арада қосылады.",
    "sec.team.eye": "Команда", "sec.team.title": "Біздің адамдар",
    "sec.team.desc": "10 қатысушы — инженерлер, бағдарламашылар, дизайнерлер және SMM.",
    "sec.auto.eye": "Autonomous", "sec.auto.title": "Pedro Pathing",
    "sec.auto.desc": "Ресми open-source маршрут визуализаторы — 6×6 өріс, дюймдермен координаттар.",
    "sec.portfolio.eye": "Портфолио", "sec.portfolio.title": "Engineering Portfolio",
    "sec.portfolio.desc": "AlemX #33655 командасының инженерлік және негізгі портфолиосы.",
    "sec.timeline.eye": "Маусым 2024–25", "sec.timeline.title": "Жол картасы",
    "sec.timeline.desc": "FTC DECODE маусымының хронологиясы — kickoff-тан жеңіске дейін.",
    "sec.extras.eye": "Жетістіктер", "sec.extras.title": "Жетістіктер",
    "sec.extras.desc": "AlemX командасының 2024–25 маусымдағы негізгі фактілері мен жетістіктері.",
    "stats.members": "Қатысушылар", "stats.hours": "Жұмыс сағаты",
    "stats.paths": "Auto маршрут", "stats.months": "Маусым айы",
    "btn.pause": "Пауза", "btn.play": "Старт", "btn.restart": "Рестарт", "btn.open": "Ашу",
    "pedro.sub": "FTC DECODE 2025–26 · Demo Auto Path",
    "footer.tag": "FTC Robotics Team · Қазақстан",
    "footer.copy": "© 2025 AlemX #33655. Барлық құқықтар қорғалған.",
    "bp.soon": "Model · Жақында",
  },
  ru: {
    "nav.team": "Команда", "nav.robot": "Робот", "nav.auto": "Авто",
    "nav.portfolio": "Портфолио", "nav.season": "Сезон", "nav.achievements": "Достижения",
    "hero.tag": "First Tech Challenge · Казахстан",
    "sec.robot.eye": "Наш Робот", "sec.robot.title": "Robot Stage",
    "sec.robot.desc": "Кастомный FTC-робот команды AlemX #33655. 3D-модель появится здесь совсем скоро.",
    "sec.team.eye": "Команда", "sec.team.title": "Наши люди",
    "sec.team.desc": "10 участников — инженеры, программисты, дизайнеры и SMM.",
    "sec.auto.eye": "Autonomous", "sec.auto.title": "Pedro Pathing",
    "sec.auto.desc": "Официальный open-source визуализатор маршрута — поле 6×6, координаты в дюймах.",
    "sec.portfolio.eye": "Портфолио", "sec.portfolio.title": "Engineering Portfolio",
    "sec.portfolio.desc": "Инженерское и основное портфолио команды AlemX #33655.",
    "sec.timeline.eye": "Сезон 2024–25", "sec.timeline.title": "Дорожная карта",
    "sec.timeline.desc": "Хронология сезона FTC DECODE — от кикоффа до победы.",
    "sec.extras.eye": "Достижения", "sec.extras.title": "Жетістіктер",
    "sec.extras.desc": "Ключевые факты и достижения команды AlemX на сезон 2024–25.",
    "stats.members": "Участников", "stats.hours": "Часов работы",
    "stats.paths": "Auto маршрута", "stats.months": "Месяцев сезона",
    "btn.pause": "Пауза", "btn.play": "Старт", "btn.restart": "Рестарт", "btn.open": "Открыть",
    "pedro.sub": "FTC DECODE 2025–26 · Demo Auto Path",
    "footer.tag": "FTC Robotics Team · Казахстан",
    "footer.copy": "© 2025 AlemX #33655. Все права защищены.",
    "bp.soon": "Model · Скоро",
  },
  en: {
    "nav.team": "Team", "nav.robot": "Robot", "nav.auto": "Auto",
    "nav.portfolio": "Portfolio", "nav.season": "Season", "nav.achievements": "Awards",
    "hero.tag": "First Tech Challenge · Kazakhstan",
    "sec.robot.eye": "Our Robot", "sec.robot.title": "Robot Stage",
    "sec.robot.desc": "AlemX #33655's custom FTC robot. A full 3D model is coming soon.",
    "sec.team.eye": "Team", "sec.team.title": "Our People",
    "sec.team.desc": "10 members — engineers, coders, designers and social media.",
    "sec.auto.eye": "Autonomous", "sec.auto.title": "Pedro Pathing",
    "sec.auto.desc": "Official open-source path visualizer — 6×6 field, coordinates in inches.",
    "sec.portfolio.eye": "Portfolio", "sec.portfolio.title": "Engineering Portfolio",
    "sec.portfolio.desc": "Engineering and main portfolio of team AlemX #33655.",
    "sec.timeline.eye": "Season 2024–25", "sec.timeline.title": "Road Map",
    "sec.timeline.desc": "FTC DECODE season timeline — from kickoff to the championship.",
    "sec.extras.eye": "Awards", "sec.extras.title": "Achievements",
    "sec.extras.desc": "Key facts and achievements of AlemX for the 2024–25 season.",
    "stats.members": "Members", "stats.hours": "Work hours",
    "stats.paths": "Auto paths", "stats.months": "Season months",
    "btn.pause": "Pause", "btn.play": "Play", "btn.restart": "Restart", "btn.open": "Open",
    "pedro.sub": "FTC DECODE 2025–26 · Demo Auto Path",
    "footer.tag": "FTC Robotics Team · Kazakhstan",
    "footer.copy": "© 2025 AlemX #33655. All rights reserved.",
    "bp.soon": "Model · Soon",
  },
};

export const LangCtx = createContext({ lang: "ru", setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("ax-lang") || "ru"; } catch { return "ru"; }
  });
  const change = l => {
    setLang(l);
    try { localStorage.setItem("ax-lang", l); } catch {}
  };
  return <LangCtx.Provider value={{ lang, setLang: change }}>{children}</LangCtx.Provider>;
}

export function useT() {
  const { lang } = useContext(LangCtx);
  return k => T[lang]?.[k] ?? T.ru[k] ?? k;
}

export function useLang() {
  return useContext(LangCtx);
}
