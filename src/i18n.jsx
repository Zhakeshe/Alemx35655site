import { createContext, useContext, useState } from "react";

const T = {
  kz: {
    "nav.team": "Команда", "nav.robot": "Робот", "nav.auto": "Авто",
    "nav.portfolio": "Портфолио", "nav.season": "Маусым", "nav.achievements": "Жетістіктер",
    "hero.tag": "First Tech Challenge · Маңғыстау",
    "sec.robot.eye": "Біздің Роботымыз", "sec.robot.title": "Robot Stage",
    "sec.robot.desc": "AlemX #33655 командасының FTC роботы. 3D-модель жақын арада қосылады.",
    "sec.team.eye": "Команда", "sec.team.title": "Біздің Команда",
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
    "footer.tag": "FTC Robotics Team · Маңғыстау",
    "footer.copy": "© 2025 AlemX #33655. Барлық құқықтар қорғалған.",
    "bp.soon": "Model · Жақында",

    // Команда рөлдері
    "role.mentor":       "Тәлімгер",
    "role.captain":      "Капитан · Инженер",
    "role.engineer":     "Инженер",
    "role.main_coder":   "Бас Бағдарламашы",
    "role.junior_coder": "Кіші Бағдарламашы",
    "role.designer":     "Дизайнер",
    "role.auto_coder":   "Авто Бағдарламашы",
    "role.smm":          "SMM",

    // Timeline
    "tl.0.date": "Қыркүйек 2024", "tl.0.phase": "Сезон Старты",     "tl.0.desc": "FTC DECODE 2025–26 сезоны жарияланды. Команда 10 адаммен толықтырылды.",
    "tl.1.date": "Қазан 2024",    "tl.1.phase": "Құрастыру Кезеңі", "tl.1.desc": "Mecanum жетегі, 4 REV мотор, intake + outtake. 200+ сағат жұмыс.",
    "tl.2.date": "Қараша 2024",   "tl.2.phase": "FTC Qualifier",     "tl.2.desc": "IntoTheDeep Qualifier · 3-ші орын. Бірінші ресми жарыс.",
    "tl.3.date": "Қаңтар 2025",   "tl.3.phase": "Аймақтық Чемпион", "tl.3.desc": "Аймақтық чемпионат · 1-ші орын + Engineering Award.",
    "tl.4.date": "Наурыз 2025",   "tl.4.phase": "Инновация Сыйлығы","tl.4.desc": "Үздік инновациялық жоба · 2024–25 маусымы аяқталды.",

    // Жетістіктер
    "ach.0.title": "Аймақтық Чемпионат",  "ach.0.sub": "1-ші орын · FTC Маңғыстау 2024",   "ach.0.tag": "Чемпионат",
    "ach.1.title": "Engineering Award",    "ach.1.sub": "Инженерлік диплом · 2024",          "ach.1.tag": "Диплом",
    "ach.2.title": "FTC Qualifier",        "ach.2.sub": "FTC Qualifier · IntoTheDeep",        "ach.2.tag": "Сертификат",
    "ach.3.title": "Innovation Challenge", "ach.3.sub": "Үздік инновациялық жоба · 2024",    "ach.3.tag": "Сыйлық",
  },
  ru: {
    "nav.team": "Команда", "nav.robot": "Робот", "nav.auto": "Авто",
    "nav.portfolio": "Портфолио", "nav.season": "Сезон", "nav.achievements": "Достижения",
    "hero.tag": "First Tech Challenge · Мангистау",
    "sec.robot.eye": "Наш Робот", "sec.robot.title": "Robot Stage",
    "sec.robot.desc": "Кастомный FTC-робот команды AlemX #33655. 3D-модель появится здесь совсем скоро.",
    "sec.team.eye": "Команда", "sec.team.title": "Наша команда",
    "sec.team.desc": "10 участников — инженеры, программисты, дизайнеры и SMM.",
    "sec.auto.eye": "Autonomous", "sec.auto.title": "Pedro Pathing",
    "sec.auto.desc": "Официальный open-source визуализатор маршрута — поле 6×6, координаты в дюймах.",
    "sec.portfolio.eye": "Портфолио", "sec.portfolio.title": "Engineering Portfolio",
    "sec.portfolio.desc": "Инженерское и основное портфолио команды AlemX #33655.",
    "sec.timeline.eye": "Сезон 2024–25", "sec.timeline.title": "Дорожная карта",
    "sec.timeline.desc": "Хронология сезона FTC DECODE — от кикоффа до победы.",
    "sec.extras.eye": "Достижения", "sec.extras.title": "Достижения",
    "sec.extras.desc": "Ключевые факты и достижения команды AlemX на сезон 2024–25.",
    "stats.members": "Участников", "stats.hours": "Часов работы",
    "stats.paths": "Auto маршрута", "stats.months": "Месяцев сезона",
    "btn.pause": "Пауза", "btn.play": "Старт", "btn.restart": "Рестарт", "btn.open": "Открыть",
    "pedro.sub": "FTC DECODE 2025–26 · Demo Auto Path",
    "footer.tag": "FTC Robotics Team · Мангистау",
    "footer.copy": "© 2025 AlemX #33655. Все права защищены.",
    "bp.soon": "Model · Скоро",

    // Роли команды
    "role.mentor":       "Ментор",
    "role.captain":      "Капитан · Инженер",
    "role.engineer":     "Инженер",
    "role.main_coder":   "Главный Разработчик",
    "role.junior_coder": "Младший Разработчик",
    "role.designer":     "Дизайнер",
    "role.auto_coder":   "Авто Разработчик",
    "role.smm":          "SMM",

    // Timeline
    "tl.0.date": "Сентябрь 2024", "tl.0.phase": "Старт Сезона",        "tl.0.desc": "Сезон FTC DECODE 2025–26 объявлен. Команда укомплектована — 10 человек.",
    "tl.1.date": "Октябрь 2024",  "tl.1.phase": "Фаза Сборки",         "tl.1.desc": "Mecanum привод, 4 мотора REV, intake + outtake. 200+ часов работы.",
    "tl.2.date": "Ноябрь 2024",   "tl.2.phase": "FTC Qualifier",        "tl.2.desc": "IntoTheDeep Qualifier · 3-е место. Первые официальные соревнования.",
    "tl.3.date": "Январь 2025",   "tl.3.phase": "Региональный Чемпион","tl.3.desc": "Региональный чемпионат · 1-е место + Engineering Award.",
    "tl.4.date": "Март 2025",     "tl.4.phase": "Награда за Инновации", "tl.4.desc": "Лучший инновационный проект · Сезон 2024–25 завершён.",

    // Достижения
    "ach.0.title": "Региональный Чемпионат", "ach.0.sub": "1-е место · FTC Мангистау 2024",   "ach.0.tag": "Чемпионат",
    "ach.1.title": "Engineering Award",      "ach.1.sub": "Инженерный диплом · 2024",          "ach.1.tag": "Диплом",
    "ach.2.title": "FTC Qualifier",          "ach.2.sub": "Квалификация FTC · IntoTheDeep",    "ach.2.tag": "Сертификат",
    "ach.3.title": "Innovation Challenge",   "ach.3.sub": "Лучший инновационный проект · 2024","ach.3.tag": "Награда",
  },
  en: {
    "nav.team": "Team", "nav.robot": "Robot", "nav.auto": "Auto",
    "nav.portfolio": "Portfolio", "nav.season": "Season", "nav.achievements": "Awards",
    "hero.tag": "First Tech Challenge · Mangistau",
    "sec.robot.eye": "Our Robot", "sec.robot.title": "Robot Stage",
    "sec.robot.desc": "AlemX #33655's custom FTC robot. A full 3D model is coming soon.",
    "sec.team.eye": "Team", "sec.team.title": "Our Team",
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
    "footer.tag": "FTC Robotics Team · Mangistau",
    "footer.copy": "© 2025 AlemX #33655. All rights reserved.",
    "bp.soon": "Model · Soon",

    // Team roles
    "role.mentor":       "Mentor",
    "role.captain":      "Captain · Engineer",
    "role.engineer":     "Engineer",
    "role.main_coder":   "Main Coder",
    "role.junior_coder": "Junior Coder",
    "role.designer":     "Designer",
    "role.auto_coder":   "Auto Coder",
    "role.smm":          "SMM",

    // Timeline
    "tl.0.date": "September 2024", "tl.0.phase": "Season Kickoff",     "tl.0.desc": "FTC DECODE 2025–26 season announced. Team assembled with 10 members.",
    "tl.1.date": "October 2024",   "tl.1.phase": "Build Phase",        "tl.1.desc": "Mecanum drive, 4 REV motors, intake + outtake. 200+ hours of work.",
    "tl.2.date": "November 2024",  "tl.2.phase": "FTC Qualifier",      "tl.2.desc": "IntoTheDeep Qualifier · 3rd place. First official competition.",
    "tl.3.date": "January 2025",   "tl.3.phase": "Regional Champion",  "tl.3.desc": "Regional Championship · 1st place + Engineering Award.",
    "tl.4.date": "March 2025",     "tl.4.phase": "Innovation Award",   "tl.4.desc": "Best Innovation Project · 2024–25 season completed.",

    // Achievements
    "ach.0.title": "Regional Championship", "ach.0.sub": "1st place · FTC Mangistau 2024",   "ach.0.tag": "Championship",
    "ach.1.title": "Engineering Award",     "ach.1.sub": "Engineering diploma · 2024",         "ach.1.tag": "Diploma",
    "ach.2.title": "FTC Qualifier",         "ach.2.sub": "FTC Qualification · IntoTheDeep",    "ach.2.tag": "Certificate",
    "ach.3.title": "Innovation Challenge",  "ach.3.sub": "Best Innovation Project · 2024",     "ach.3.tag": "Award",
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
