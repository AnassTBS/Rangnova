import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./styles.css";
import { LANGUAGES, pageMetadata } from "./translations";
import { LanguageProvider, useI18n } from "./i18n";
import { careersContacts, jobs, proposedCareersContent, verifiedCareersContent } from "./careersData";
import { RouteLoadingFallback, RouteErrorBoundary } from "./sharedComponents";

/* â”€â”€â”€ Lazy page chunks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const LazyHome = React.lazy(() => import("./pages/Home"));
const LazyServicePage = React.lazy(() => import("./pages/ServicePage"));
const LazyAboutPage = React.lazy(() => import("./pages/AboutPage"));
const LazyContactPage = React.lazy(() => import("./pages/ContactPage"));
const LazyPrivacyPage = React.lazy(() => import("./pages/PrivacyPage"));
const LazyCareersPage = React.lazy(() =>
  import("./pages/CareersPage").then((m) => ({ default: m.CareersPage })),
);
const LazyCareersJobDetailPage = React.lazy(() =>
  import("./pages/CareersPage").then((m) => ({ default: m.CareersJobDetailPage })),
);
const LazyNotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));

const PhoneInputField = React.lazy(() =>
  import("./PhoneInputField").then((module) => ({ default: module.PhoneInputField })),
);

/* â”€â”€â”€ Animation primitives & Brand Star â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const EASE = [0.2, 0.7, 0.2, 1];
const VP = { once: true, margin: "0px 0px -60px 0px" };

function RingnovaStar({ size = 20, className = "", style = {}, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={`ringnova-star ${className}`}
      style={style}
      aria-hidden="true"
    >
      <path d="M12 1.5C12 7.298 16.702 12 22.5 12C16.702 12 12 16.702 12 22.5C12 16.702 7.298 12 1.5 12C7.298 12 12 7.298 12 1.5Z" />
    </svg>
  );
}

function useCompactMotion() {
  const [isCompact, setIsCompact] = React.useState(
    () => window.matchMedia("(max-width: 700px)").matches,
  );

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const update = () => setIsCompact(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isCompact;
}

function Reveal({ children, as = "div", className = "", style, delay = 0 }) {
  const reduced = useReducedMotion();
  const compact = useCompactMotion();
  const Tag = motion[as] || motion.div;

  if (reduced) {
    const StaticTag = as;
    return <StaticTag className={className} style={style}>{children}</StaticTag>;
  }

  return (
    <Tag
      className={className}
      style={style}
      initial={{ opacity: 0, y: compact ? 9 : 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VP}
      transition={{ duration: compact ? 0.42 : 0.52, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

function HeroEntrance({ children, as = "div", className = "", style }) {
  const reduced = useReducedMotion();
  const compact = useCompactMotion();
  const Tag = motion[as] || motion.div;

  if (reduced) {
    const StaticTag = as;
    return <StaticTag className={className} style={style}>{children}</StaticTag>;
  }

  return (
    <Tag
      className={className}
      style={style}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: compact ? 9 : 14 }}
      transition={{ duration: compact ? 0.42 : 0.58, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/* â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const services = [
  {
    number: "01",
    title: "Customer support",
    description:
      "Thoughtful, responsive customer care that helps every interaction feel like a good one.",
    icon: "chat",
  },
  {
    number: "02",
    title: "Inbound & outbound calls",
    description:
      "A dependable extension of your team for the conversations your business needs to have.",
    icon: "phone",
  },
  {
    number: "03",
    title: "Lead generation",
    description:
      "Build meaningful connections with prospects and give your pipeline room to grow.",
    icon: "spark",
  },
  {
    number: "04",
    title: "Appointment setting",
    description:
      "Make it easier for the right people to get a conversation on the calendar.",
    icon: "calendar",
  },
  {
    number: "05",
    title: "Telemarketing",
    description:
      "Personal, professional outreach shaped around your audience and business goals.",
    icon: "wave",
  },
];

const serviceOptions = services.map(({ title }) => title);

/* â”€â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function Icon({ name, size = 22, className = "" }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className,
  };

  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    arrowUp: <path d="M7 17 17 7M7 7h10v10" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function ServiceIllustration({ type }) {
  const common = {
    className: "service-illustration-art",
    viewBox: "0 0 64 64",
    fill: "none",
    "aria-hidden": true,
  };

  const scenes = {
    chat: (
      <>
        <circle cx="32" cy="32" r="29" fill="#EAF2E8" />
        <path d="M13 20.5A13.5 13.5 0 0 1 26.5 7h15A13.5 13.5 0 0 1 55 20.5v5A13.5 13.5 0 0 1 41.5 39H29l-9 6v-8.2A13.4 13.4 0 0 1 13 25.5v-5Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 23h.1M32 23h.1M40 23h.1" stroke="#164F43" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M37 43.5A9.5 9.5 0 0 1 46.5 34h4A9.5 9.5 0 0 1 60 43.5v1A9.5 9.5 0 0 1 50.5 54H45l-6 4v-6a9.4 9.4 0 0 1-2-7.5Z" fill="#D9EEE2" stroke="#164F43" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="m49 39 .9 2.2 2.1.8-2.1.8L49 46l-.9-2.2-2.1-.8 2.1-.8L49 39Z" fill="#A5C96A" />
      </>
    ),
    phone: (
      <>
        <circle cx="32" cy="32" r="29" fill="#F2F0E4" />
        <path d="M17 25a15 15 0 0 1 30 0" stroke="#164F43" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 24h5v15h-5a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4ZM48 24h-5v15h5a4 4 0 0 0 4-4v-7a4 4 0 0 0-4-4Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" strokeLinejoin="round" />
        <path d="M45 40a11 11 0 0 1-11 10h-3" stroke="#164F43" strokeWidth="2" strokeLinecap="round" />
        <rect x="26" y="47" width="8" height="6" rx="3" fill="#D4EF72" />
        <path d="M22 17a12 12 0 0 1 20 0" stroke="#A5C96A" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    spark: (
      <>
        <circle cx="32" cy="32" r="29" fill="#EAF2E8" />
        <circle cx="27" cy="23" r="8" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" />
        <path d="M12 51a15 15 0 0 1 30 0v3H12v-3Z" fill="#D9EEE2" stroke="#164F43" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="48" cy="20" r="9" fill="#D4EF72" />
        <path d="M48 15v10M43 20h10M47 19h2v2h-2z" stroke="#164F43" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m46 37 2 2 4-5" stroke="#164F43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    calendar: (
      <>
        <circle cx="32" cy="32" r="29" fill="#F2F0E4" />
        <rect x="14" y="14" width="36" height="38" rx="6" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" />
        <path d="M23 11v9M41 11v9M14 25h36" stroke="#164F43" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M23 33h5v5h-5z" fill="#D9EEE2" />
        <path d="m34 35 3 3 6-7" stroke="#164F43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 43h5" stroke="#A5C96A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="49" cy="47" r="8" fill="#D4EF72" />
        <path d="m46 47 2 2 4-4" stroke="#164F43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    wave: (
      <>
        <circle cx="32" cy="32" r="29" fill="#EAF2E8" />
        <path d="M18 23a19 19 0 0 1 28 0M23 29a12 12 0 0 1 18 0" stroke="#A5C96A" strokeWidth="2" strokeLinecap="round" />
        <path d="m23 34 7-4 5 5 7-4" stroke="#164F43" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 42.5V40a14 14 0 0 1 28 0v2.5" stroke="#164F43" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="15" y="40" width="7" height="12" rx="3.5" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" />
        <rect x="42" y="40" width="7" height="12" rx="3.5" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" />
        <path d="M42 52a10 10 0 0 1-10 8h-2" stroke="#164F43" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    languages: (
      <>
        <circle cx="32" cy="32" r="29" fill="#EAF2E8" />
        <path d="M15 18.5A8.5 8.5 0 0 1 23.5 10h15a8.5 8.5 0 0 1 0 17h-7l-6 4v-5A8.5 8.5 0 0 1 15 18.5Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" strokeLinejoin="round" />
        <path d="M26 18.5h.1M31 18.5h.1M36 18.5h.1" stroke="#164F43" strokeWidth="3" strokeLinecap="round" />
        <path d="M31 39.5A8.5 8.5 0 0 1 39.5 31h7a8.5 8.5 0 0 1 0 17h-4l-6 4v-5.5a8.5 8.5 0 0 1-5.5-7Z" fill="#D9EEE2" stroke="#164F43" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="40" cy="39.5" r="1" fill="#A5C96A" />
        <circle cx="44" cy="39.5" r="1" fill="#A5C96A" />
      </>
    ),
    trust: (
      <>
        <circle cx="32" cy="32" r="29" fill="#EAF2E8" />
        <path d="m32 11 17 6v13c0 11-7.2 19.1-17 23-9.8-3.9-17-12-17-23V17l17-6Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="m23.5 31.5 5.5 5.5 11.5-12" stroke="#164F43" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="48" cy="17" r="7" fill="#D4EF72" />
        <path d="m48 13 .9 2.1 2.1.9-2.1.9L48 20l-.9-2.1-2.1-.9 2.1-.9L48 13Z" fill="#164F43" />
      </>
    ),
    reliability: (
      <>
        <circle cx="32" cy="32" r="29" fill="#EAF2E8" />
        <path d="m32 11 17 6v13c0 11-7.2 19.1-17 23-9.8-3.9-17-12-17-23V17l17-6Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="m23.5 31.5 5.5 5.5 11.5-12" stroke="#164F43" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="48" cy="17" r="7" fill="#D4EF72" />
      </>
    ),
    responsiveness: (
      <>
        <circle cx="32" cy="32" r="29" fill="#EAF2E8" />
        <path d="M12 20.5A12.5 12.5 0 0 1 24.5 8h17A12.5 12.5 0 0 1 54 20.5v3A12.5 12.5 0 0 1 41.5 36H28l-9 6v-8.1A12.4 12.4 0 0 1 12 23.5v-3Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 22h.1M32 22h.1M40 22h.1" stroke="#164F43" strokeWidth="3.5" strokeLinecap="round" />
        <path d="m47 42 1.3 3.2 3.2 1.3-3.2 1.3L47 51l-1.3-3.2-3.2-1.3 3.2-1.3L47 42Z" fill="#A5C96A" />
      </>
    ),
    flexibility: (
      <>
        <circle cx="32" cy="32" r="29" fill="#F2F0E4" />
        <rect x="14" y="15" width="36" height="34" rx="7" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" />
        <path d="M22 25h20M22 39h20" stroke="#A5C96A" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="29" cy="25" r="4" fill="#D4EF72" stroke="#164F43" strokeWidth="2" />
        <circle cx="37" cy="39" r="4" fill="#D9EEE2" stroke="#164F43" strokeWidth="2" />
        <path d="m47 13 .9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" fill="#164F43" />
      </>
    ),
    connection: (
      <>
        <circle cx="32" cy="32" r="29" fill="#EAF2E8" />
        <path d="M9 21.5A10.5 10.5 0 0 1 19.5 11h16A10.5 10.5 0 0 1 46 21.5v2A10.5 10.5 0 0 1 35.5 34H23l-8 5v-7.2A10.4 10.4 0 0 1 9 23.5v-2Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 45a8 8 0 0 1 8-8h12a8 8 0 0 1 0 16h-8l-6 4v-6a8 8 0 0 1-6-6Z" fill="#D9EEE2" stroke="#164F43" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="20" cy="22" r="1.5" fill="#A5C96A" />
        <circle cx="27" cy="22" r="1.5" fill="#A5C96A" />
        <circle cx="34" cy="22" r="1.5" fill="#A5C96A" />
      </>
    ),
    location: (
      <>
        <circle cx="32" cy="32" r="29" fill="#F2F0E4" />
        <path d="M32 53s16-15.1 16-29a16 16 0 1 0-32 0c0 13.9 16 29 16 29Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="32" cy="24" r="7" fill="#D9EEE2" stroke="#164F43" strokeWidth="2" />
        <path d="m32 19 1.2 3h3l-2.4 1.7.9 3-2.7-1.8-2.7 1.8.9-3-2.4-1.7h3L32 19Z" fill="#A5C96A" />
      </>
    ),
    europe: (
      <>
        <circle cx="32" cy="32" r="29" fill="#EAF2E8" />
        <circle cx="31" cy="31" r="18" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" />
        <path d="M13 31h36M31 13a29 29 0 0 1 0 36M31 13a29 29 0 0 0 0 36" stroke="#A5C96A" strokeWidth="1.7" />
        <path d="M45 39a8 8 0 0 1 8 8c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 8-8Z" fill="#D4EF72" stroke="#164F43" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="45" cy="47" r="2.3" fill="#164F43" />
      </>
    ),
  };

  return <svg {...common}>{scenes[type]}</svg>;
}

function CareerAreaIcon({ type }) {
  const line = { fill: "none", stroke: "#164F43", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const scenes = {
    "customer-experience": (
      <>
        <path d="M8 10a6 6 0 0 1 6-6h9a6 6 0 0 1 6 6v3a6 6 0 0 1-6 6h-7l-5 3v-5a6 6 0 0 1-3-5Z" {...line} />
        <path d="M13 10h.1m5 0h.1m5 0h.1" {...line} strokeWidth="2.8" />
        <path d="M22 22h5m-2.5-2.5V25" {...line} stroke="#90B85C" />
      </>
    ),
    sales: (
      <>
        <path d="M7 26h26" {...line} />
        <path d="M10 23v-6h5v6m4 0V12h5v11m4 0V7h5v16" fill="#D9EEE2" stroke="#164F43" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="m9 13 7-4 5 1 8-6m-1 0h3v3" {...line} stroke="#90B85C" />
      </>
    ),
    telemarketing: (
      <>
        <path d="M8 19v-3a12 12 0 0 1 24 0v3" {...line} />
        <path d="M9 16h4v9h-3a3 3 0 0 1-3-3v-3a3 3 0 0 1 2-3Zm22 0h-4v9h3a3 3 0 0 0 3-3v-3a3 3 0 0 0-2-3Z" fill="#D9EEE2" stroke="#164F43" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M27 25a7 7 0 0 1-7 6h-2" {...line} />
        <rect x="16" y="29" width="5" height="3" rx="1.5" fill="#D4EF72" stroke="#164F43" strokeWidth="1.4" />
      </>
    ),
    "lead-generation": (
      <>
        <path d="M7 8h26l-10 11v7l-6 4V19L7 8Z" fill="#D9EEE2" stroke="#164F43" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M27 25v5m-2.5-2.5h5m-1-15 .8 1.8 1.7.7-1.7.7-.8 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" {...line} stroke="#90B85C" />
      </>
    ),
    "appointment-setting": (
      <>
        <rect x="7" y="9" width="26" height="23" rx="4" fill="#FFFEFA" stroke="#164F43" strokeWidth="1.8" />
        <path d="M13 6v6m14-6v6M7 16h26" {...line} />
        <path d="m14 23 3 3 6-6" {...line} stroke="#90B85C" strokeWidth="2.2" />
      </>
    ),
    operations: (
      <>
        <circle cx="20" cy="20" r="11" fill="#D9EEE2" stroke="#164F43" strokeWidth="1.8" />
        <circle cx="20" cy="20" r="4" fill="#FFFEFA" stroke="#164F43" strokeWidth="1.7" />
        <path d="M20 6v4m0 20v4M6 20h4m20 0h4M10 10l3 3m14 14 3 3m0-20-3 3m-14 14-3 3" {...line} />
        <path d="m18 20 1.5 1.5L23 18" {...line} stroke="#90B85C" />
      </>
    ),
    "back-office": (
      <>
        <path d="M7 12h11l3 3h12v14H7V12Z" fill="#D9EEE2" stroke="#164F43" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M10 9h10l3 3m-9 8h13m-13 4h9" {...line} />
        <path d="M25 18h5" {...line} stroke="#90B85C" />
      </>
    ),
    "corporate-support": (
      <>
        <path d="M7 14 20 6l13 8M10 14v16m7-16v16m6-16v16m7-16v16M7 30h26" {...line} />
        <path d="M5 33h30" {...line} stroke="#90B85C" strokeWidth="2.2" />
        <circle cx="20" cy="11" r="1.4" fill="#D4EF72" />
      </>
    ),
  };

  return (
    <svg className="careers-area-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#EDF3E7" />
      {scenes[type]}
    </svg>
  );
}

function CareerQualityIcon({ type }) {
  const line = { fill: "none", stroke: "#164F43", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const scenes = {
    communication: (
      <>
        <path d="M8 12.5A8.5 8.5 0 0 1 16.5 4h8A8.5 8.5 0 0 1 33 12.5v2a8.5 8.5 0 0 1-8.5 8.5h-7l-6 4v-6.1A8.4 8.4 0 0 1 8 14.5v-2Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M15 13h.1m5 0h.1m5 0h.1" stroke="#164F43" strokeWidth="3" strokeLinecap="round" />
        <path d="m28 26 1.1 2.5 2.5 1.1-2.5 1.1L28 33l-1.1-2.3-2.5-1.1 2.5-1.1L28 26Z" fill="#A5C96A" />
      </>
    ),
    "customer-mindset": (
      <>
        <path d="M20 29S7 21.2 7 12.5a6.4 6.4 0 0 1 11.6-3.8A6.4 6.4 0 0 1 30 12.5C30 21.2 20 29 20 29Z" fill="#D9EEE2" stroke="#164F43" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="m17 17 2.2 2.2 4.8-5" {...line} strokeWidth="2" />
        <circle cx="30" cy="9" r="5" fill="#D4EF72" />
        <path d="m30 6.5.7 1.7 1.8.7-1.8.7-.7 1.9-.7-1.9-1.8-.7 1.8-.7.7-1.7Z" fill="#164F43" />
      </>
    ),
    reliability: (
      <>
        <path d="m20 7 12 4v8c0 7-5 12-12 15-7-3-12-8-12-15v-8l12-4Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" strokeLinejoin="round" />
        <path d="m13.5 19.5 4.2 4.2 9-10" {...line} strokeWidth="2.7" />
        <circle cx="31" cy="10" r="5" fill="#D4EF72" />
      </>
    ),
    curiosity: (
      <>
        <circle cx="17" cy="17" r="10" fill="#FFFEFA" stroke="#164F43" strokeWidth="2" />
        <path d="m24.5 24.5 7 7" {...line} strokeWidth="3" />
        <path d="M17 11v7m-3.5-3.5h7" {...line} stroke="#A5C96A" strokeWidth="2" />
        <circle cx="29" cy="9" r="4" fill="#D4EF72" />
      </>
    ),
    teamwork: (
      <>
        <circle cx="20" cy="13" r="5" fill="#FFFEFA" stroke="#164F43" strokeWidth="1.8" />
        <circle cx="9.5" cy="16" r="4" fill="#D9EEE2" stroke="#164F43" strokeWidth="1.7" />
        <circle cx="30.5" cy="16" r="4" fill="#D9EEE2" stroke="#164F43" strokeWidth="1.7" />
        <path d="M10 31a10 10 0 0 1 20 0v2H10v-2Z" fill="#D9EEE2" stroke="#164F43" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M4.5 30a6 6 0 0 1 6-6m25 6a6 6 0 0 0-6-6" {...line} />
        <path d="M18 24h4" {...line} stroke="#A5C96A" strokeWidth="2.4" />
      </>
    ),
    adaptability: (
      <>
        <path d="M29 13a11 11 0 0 0-18-3l-3 3m0 0V8m0 5h5M11 27a11 11 0 0 0 18 3l3-3m0 0v5m0-5h-5" {...line} strokeWidth="2.2" />
        <circle cx="20" cy="20" r="5" fill="#FFFEFA" stroke="#164F43" strokeWidth="1.7" />
        <path d="m20 16 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" fill="#A5C96A" />
      </>
    ),
    learning: (
      <>
        <path d="M20 12c-4-3-8-4-13-3v20c5-1 9 0 13 3 4-3 8-4 13-3V9c-5-1-9 0-13 3Z" fill="#FFFEFA" stroke="#164F43" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M20 12v20m-9-15 5 1m-5 4 5 1m8-6 5-1m-5 5 5-1" {...line} stroke="#A5C96A" strokeWidth="1.7" />
      </>
    ),
  };

  return (
    <svg className="careers-quality-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#EAF2E8" />
      {scenes[type]}
    </svg>
  );
}

function WhatsAppLogo({ size = 21 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.888-9.884 2.64.001 5.12 1.03 6.988 2.899a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.438 9.883-9.886 9.883m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 0 5.495 0 12.05a11.98 11.98 0 0 0 1.634 6.034L.001 24l6.056-1.589a12.05 12.05 0 0 0 5.99 1.526h.005c6.554 0 12.05-5.495 12.05-12.05a11.98 11.98 0 0 0-3.638-8.399Z" />
    </svg>
  );
}

/* â”€â”€â”€ Shared UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function Brand({ light = false }) {
  const { t } = useI18n();
  return (
    <SmartNavLink
      to="/"
      className={`brand${light ? " brand-light" : ""}`}
      aria-label={t("Rangnova home")}
    >
      <span className="brand-mark-wrap">
        <img
          className="brand-mark"
          src={light ? "/rangnova-mark-light.webp" : "/rangnova-mark.webp"}
          alt=""
          width={32}
          height={32}
        />
        <RingnovaStar size={12} className="brand-star-flare" />
      </span>
      <span className="brand-wordmark" aria-hidden="true">
        <span>rang</span><span className="brand-wordmark-accent">nova</span>
      </span>
    </SmartNavLink>
  );
}

function ArrowLink({ to, children, light = false, className = "" }) {
  return (
    <Link className={`arrow-link${light ? " arrow-link-light" : ""} ${className}`} to={to}>
      {children}
      <Icon name="arrow" size={17} />
    </Link>
  );
}

/* SmartNavLink â€” navigates normally to other pages;
   when already on the target page, smoothly scrolls to top instead.
   Accepts all standard Link props (className, aria-label, etc). */
function SmartNavLink({ to, onClick, children, className = "", ...rest }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMainNavLink = className.split(" ").includes("main-nav-link");
  const isActive = to === "/"
    ? location.pathname === "/"
    : location.pathname === to || (to === "/careers" && location.pathname.startsWith("/careers/"));

  const handleClick = (e) => {
    const isExternal = typeof to === "string" && (/^[a-z][a-z\d+.-]*:/i.test(to) || to.startsWith("//"));
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      rest.target ||
      e.currentTarget.target ||
      e.currentTarget.hasAttribute("download") ||
      isExternal
    ) return;

    e.preventDefault();
    if (onClick) onClick();
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(to);
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`${className}${isMainNavLink && isActive ? " is-active" : ""}`}
      aria-current={isMainNavLink && isActive ? "page" : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { language, setLanguage, t } = useI18n();
  const menuToggleRef = React.useRef(null);
  const closeMenu = () => setMenuOpen(false);

  React.useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 12);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  React.useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !event.target.closest?.(".language-switcher")) {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const handleLanguageSelect = () => {
    closeMenu();
    if (window.matchMedia("(max-width: 700px)").matches) {
      menuToggleRef.current?.focus();
    }
  };

  return (
    <header className={`site-header${scrolled ? " header-scrolled" : ""}`}>
      <div className={`container header-inner${menuOpen ? " header-menu-open" : ""}`}>
        <Brand />
        <button
          className="menu-toggle"
          type="button"
          ref={menuToggleRef}
          aria-label={t(menuOpen ? "Close navigation menu" : "Open navigation menu")}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
        <div className="header-actions">
          <nav className="main-nav" id="primary-navigation" aria-label={t("Main navigation")}>
            <SmartNavLink className="main-nav-link" to="/" onClick={closeMenu}>{t("Home")}</SmartNavLink>
            <SmartNavLink className="main-nav-link" to="/services" onClick={closeMenu}>{t("Services")}</SmartNavLink>
            <SmartNavLink className="main-nav-link" to="/about" onClick={closeMenu}>{t("About us")}</SmartNavLink>
            <SmartNavLink className="main-nav-link" to="/careers" onClick={closeMenu}>{t("Careers")}</SmartNavLink>
            <SmartNavLink className="main-nav-link" to="/contact" onClick={closeMenu}>{t("Contact")}</SmartNavLink>
          </nav>
          <div className="header-tools">
            <LanguageSwitcher onSelect={handleLanguageSelect} />
            <SmartNavLink className="nav-cta" to="/contact" onClick={closeMenu}>
              {t("Let's talk")} <Icon name="arrowUp" size={15} />
            </SmartNavLink>
          </div>
        </div>
      </div>
    </header>
  );
}

function FlagIcon({ code }) {
  const flagMap = {
    en: "/images/flag-en-navbar.svg",
    fr: "/images/flag-fr.svg",
    es: "/images/flag-es.svg",
    de: "/images/flag-de.svg",
    ar: "/images/flag-sa.svg",
  };

  const src = flagMap[code] || "/images/flag-en.svg";

  return <img src={src} alt="" className="language-flag" aria-hidden="true" width={20} height={14} />;
}

function LanguageSwitcher({ onSelect }) {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const activeIndex = LANGUAGES.findIndex(({ code }) => code === language);

  React.useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        const options = [...(rootRef.current?.querySelectorAll(".language-option") || [])];
        const focusedIndex = options.indexOf(document.activeElement);
        const currentIndex = focusedIndex < 0 ? activeIndex : focusedIndex;
        const next = event.key === "Home"
          ? 0
          : event.key === "End"
            ? LANGUAGES.length - 1
            : (currentIndex + (event.key === "ArrowDown" ? 1 : LANGUAGES.length - 1)) % LANGUAGES.length;
        options[next]?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, isOpen]);

  return (
    <div className="language-switcher" ref={rootRef}>
      <button
        className="language-switcher-trigger"
        type="button"
        ref={triggerRef}
        aria-label={`${t("Language")}: ${language.toUpperCase()}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? "language-switcher-menu" : undefined}
        onClick={() => {
          const nextIsOpen = !isOpen;
          setIsOpen(nextIsOpen);
          if (nextIsOpen) {
            requestAnimationFrame(() => {
              rootRef.current?.querySelector('[aria-checked="true"]')?.focus();
            });
          }
        }}
      >
        <FlagIcon code={language} />
        <svg className={`language-chevron${isOpen ? " is-open" : ""}`} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="m2 4.5 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="language-switcher-menu" id="language-switcher-menu" role="menu" aria-label={t("Language")}>
          {LANGUAGES.map(({ code, name }) => (
            <button
              className={`language-option${code === language ? " is-active" : ""}`}
              type="button"
              role="menuitemradio"
              aria-label={name}
              aria-checked={code === language}
              key={code}
              onClick={() => {
                setLanguage(code);
                setIsOpen(false);
                triggerRef.current?.focus();
                onSelect();
              }}
            >
              <FlagIcon code={code} />
              <span>{code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand-block">
            <Brand light />
            <p>{t("Good conversations make")}<br />{t("business better.")}</p>
          </div>
          <div className="footer-nav-group">
            <p className="footer-label">{t("Explore")}</p>
            <Link to="/services">{t("Our services")}</Link>
            <Link to="/about">{t("About Rangnova")}</Link>
            <Link to="/careers">{t("Careers")}</Link>
            <Link to="/contact">{t("Get in touch")}</Link>
          </div>
          <div className="footer-nav-group">
            <p className="footer-label">{t("Let's connect")}</p>
            <span>{t("Serving businesses across Europe")}</span>
            <span>{t("Team based in Morocco")}</span>
            <span>{t("English · Français · العربية")}</span>
          </div>
          <a className="footer-top" href="#top" aria-label={t("Back to top")}>
            <Icon name="arrowUp" />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Rangnova. {t("All rights reserved.")}</span>
          <Link to="/privacy">{t("Privacy policy")}</Link>
          <span>{t("Made for better conversations.")}</span>
        </div>
      </div>
    </footer>
  );
}


function Eyebrow({ children, light = false }) {
  return (
    <p className={`eyebrow${light ? " eyebrow-light" : ""}`}>
      <span className="eyebrow-star-wrap">
        <RingnovaStar size={11} className="eyebrow-star" />
      </span>
      {children}
    </p>
  );
}

function ButtonLink({ to, children, variant = "primary" }) {
  return (
    <Link className={`button button-${variant}`} to={to}>
      {children}<Icon name="arrow" size={17} />
    </Link>
  );
}

/* â”€â”€â”€ App with Smooth Page Transitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function AnimatedRoutes() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const { language, t } = useI18n();

  React.useEffect(() => {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    const jobSlug = path.startsWith("/careers/") ? path.slice("/careers/".length) : "";
    const job = jobSlug ? jobs.find((item) => item.slug === jobSlug && item.status === "published") : null;
    const metadata = pageMetadata[language]?.[path]
      || pageMetadata.en[path]
      || (job ? [t(job.titleKey), t(job.overviewKey)] : undefined);
    const description = document.querySelector('meta[name="description"]');
    let robots = document.querySelector('meta[name="robots"]');

    // Set title and description
    document.title = metadata?.[0] || t("PAGE NOT FOUND") + " | Rangnova";
    if (description) {
      description.content = metadata?.[1] || t("The page may have moved, or the address may be incorrect.");
    }

    // Set Open Graph meta tags
    const setOrCreateMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    const OG_LOCALES = {
      en: "en_US",
      fr: "fr_FR",
      es: "es_ES",
      de: "de_DE",
      ar: "ar_AR",
    };
    setOrCreateMeta("og:locale", OG_LOCALES[language] || "en_US", true);

    let canonicalLink = document.querySelector('link[rel="canonical"]');

    if (metadata) {
      const title = metadata[0];
      const desc = metadata[1];
      const pageUrl = `https://www.rangnova.com${path === "/" ? "/" : path}`;

      setOrCreateMeta("og:title", title, true);
      setOrCreateMeta("og:description", desc, true);
      setOrCreateMeta("og:type", "website", true);
      setOrCreateMeta("og:url", pageUrl, true);
      setOrCreateMeta("og:image", "https://www.rangnova.com/rangnova-mark.webp", true);
      setOrCreateMeta("twitter:title", title);
      setOrCreateMeta("twitter:description", desc);
      setOrCreateMeta("twitter:card", "summary_large_image");
      setOrCreateMeta("twitter:image", "https://www.rangnova.com/rangnova-mark.webp");

      // Set canonical URL
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = pageUrl;
    } else {
      // Remove canonical tag on 404 to avoid indexing errors
      if (canonicalLink) {
        canonicalLink.remove();
      }
      const notFoundTitle = `${t("PAGE NOT FOUND")} | Rangnova`;
      const notFoundDesc = t("The page may have moved, or the address may be incorrect.");
      setOrCreateMeta("og:title", notFoundTitle, true);
      setOrCreateMeta("og:description", notFoundDesc, true);
      setOrCreateMeta("twitter:title", notFoundTitle);
      setOrCreateMeta("twitter:description", notFoundDesc);
    }

    // Handle robots meta tag for non-indexed pages
    if (!metadata && !robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    if (robots) {
      if (metadata) robots.remove();
      else robots.content = "noindex, follow";
    }
  }, [location.pathname, language, t]);

  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={location.pathname === "/"}>
      <motion.div
        key={location.pathname}
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="route-transition-wrap"
      >
        <RouteErrorBoundary>
          <React.Suspense fallback={<RouteLoadingFallback />}>
            <Routes location={location}>
              <Route path="/" element={<LazyHome />} />
              <Route path="/services" element={<LazyServicePage />} />
              <Route path="/about" element={<LazyAboutPage />} />
              <Route path="/contact" element={<LazyContactPage />} />
              <Route path="/privacy" element={<LazyPrivacyPage />} />
              <Route path="/careers" element={<LazyCareersPage />} />
              <Route path="/careers/:jobSlug" element={<LazyCareersJobDetailPage />} />
              <Route path="*" element={<LazyNotFoundPage />} />
            </Routes>
          </React.Suspense>
        </RouteErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
}

function AmbientStars() {
  const [particles] = React.useState(() =>
    Array.from({ length: 22 }, (_, index) => {
      const duration = 20 + Math.random() * 26;
      return {
        id: index,
        left: `${Math.random() * 100}%`,
        size: `${2 + Math.random() * 3}px`,
        duration: `${duration}s`,
        delay: `${-Math.random() * duration}s`,
        opacity: 0.28 + Math.random() * 0.35,
        drift: `${Math.random() * 36 - 18}px`,
        rotation: `${Math.random() * 90 - 45}deg`,
        sparkle: Math.random() > 0.55,
      };
    }),
  );

  return (
    <div className="ambient-stars" aria-hidden="true">
      {particles.map((particle) => (
        <span
          className={`ambient-star${particle.sparkle ? " is-sparkle" : ""}`}
          key={particle.id}
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
            "--particle-opacity": particle.opacity,
            "--particle-drift": particle.drift,
            "--particle-rotation": particle.rotation,
          }}
        />
      ))}
    </div>
  );
}

function Layout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const showWhatsAppWidget = pathname === "/contact" || pathname.startsWith("/careers");
  const whatsappContactUrl = `https://wa.me/${careersContacts.whatsappNumber}`;
  return (
    <>
      <AmbientStars />
      <a className="skip-link" href="#main">{t("Skip to content")}</a>
      <div id="top" />
      <Header />
      <main id="main">
        <AnimatedRoutes />
      </main>
      <Footer />
      {showWhatsAppWidget && (
        <a
          className="whatsapp-float"
          href={whatsappContactUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("Chat with us on WhatsApp")}
        >
          <span className="whatsapp-float-icon"><WhatsAppLogo size={22} /></span>
          <span className="whatsapp-float-label" aria-hidden="true">{t("Chat with us on WhatsApp")}</span>
        </a>
      )}
    </>
  );
}

function App() {
  React.useEffect(() => {
    const fontStylesheet = document.getElementById("google-fonts");
    if (!(fontStylesheet instanceof HTMLLinkElement)) {
      throw new Error("Google Fonts preload link was not found.");
    }

    fontStylesheet.rel = "stylesheet";
    fontStylesheet.removeAttribute("as");
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </LanguageProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>,
);
