import React from "react";
import { useI18n } from "../i18n";
import {
  Reveal,
  HeroEntrance,
  services,
  ServiceIllustration,
  Icon,
  RingnovaStar,
  Eyebrow,
  ButtonLink,
  ArrowLink,
} from "../sharedComponents";

/* ─── ServiceCard ──────────────────────────────────────────────────── */

function ServiceCard({ service, compact = false }) {
  const { t } = useI18n();
  return (
    <article className={`service-card${compact ? " service-card-compact" : ""}`}>
      <div className="service-card-top">
        <span className="service-icon"><ServiceIllustration type={service.icon} /></span>
        <span className="service-number">{service.number}</span>
      </div>
      <h3>{t(service.title)}</h3>
      <p>{t(service.description)}</p>
      {!compact && <ArrowLink to="/services">{t("Explore service")}</ArrowLink>}
    </article>
  );
}

/* ─── ServiceGrid ────────────────────────────────────────────────── */

function ServiceGrid({ services: list }) {
  return (
    <div className="service-grid">
      {list.map((service) => (
        <ServiceCard key={service.number} service={service} />
      ))}
    </div>
  );
}

/* ─── HeroStarAura ───────────────────────────────────────────────── */

function HeroStarAura() {
  return (
    <div className="hero-star-aura" aria-hidden="true">
      <div className="hero-star-ring ring-1" />
      <div className="hero-star-ring ring-2" />
      <div className="hero-star-core">
        <RingnovaStar size={24} className="hero-star-pulse" />
      </div>
    </div>
  );
}

/* ─── HeroPhoto ──────────────────────────────────────────────────── */

function HeroPhoto() {
  const { t } = useI18n();
  return (
    <div className="hero-visual">
      <img
        className="hero-image"
        src="/images/home-hero.webp"
        alt={t("A smiling customer-support professional wearing a headset")}
        loading="eager"
        fetchpriority="high"
        width={768}
        height={1299}
      />
    </div>
  );
}

/* ─── LanguageCards ──────────────────────────────────────────────── */

function LanguageCards() {
  const cards = [
    { code: "EN", flag: "/images/flag-en.svg", lang: "English", alt: "English flag", tagline: "Clear, confident conversations" },
    { code: "FR", flag: "/images/flag-fr.svg", lang: "Français", alt: "French flag", tagline: "Une expérience attentionnée" },
    { code: "AR", flag: "/images/flag-sa.svg", lang: "العربية", alt: "Saudi Arabia flag", tagline: "تواصل إنساني ومميز" },
  ];

  return (
    <div className="language-cards">
      {cards.map((c) => (
        <div key={c.code} className="language-card">
          <span className="language-flag-badge">
            <img src={c.flag} alt={c.alt} className="language-flag-img" width={48} height={48} />
          </span>
          <div className="language-card-info">
            <strong>{c.lang}</strong>
            <small>{c.tagline}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Home ───────────────────────────────────────────────────────── */

export default function Home() {
  const { t } = useI18n();
  return (
    <>
      {/* ── Hero ── */}
      <HeroEntrance as="section" className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <HeroStarAura />
            <Eyebrow>{t("YOUR PEOPLE-FIRST CALL CENTER PARTNER")}</Eyebrow>
            <h1>
              {t("Every conversation is a chance to ")}<em>{t("grow.")}</em>
            </h1>
            <p className="hero-description">
              {t("Flexible customer communication for ambitious businesses. We help you show up, follow through, and make every conversation count.")}
            </p>
            <div className="hero-actions">
              <ButtonLink to="/contact">{t("Let's talk about your needs")}</ButtonLink>
              <ArrowLink to="/services">{t("Explore our services")}</ArrowLink>
            </div>
            <div className="hero-proof">
              <span className="proof-avatars" aria-hidden="true">
                <span className="proof-avatar proof-avatar-primary" />
                <span className="proof-avatar proof-avatar-teammate" />
                <span className="proof-avatar proof-avatar-colleague" />
                <i>+</i>
              </span>
              <span>{t("Thoughtful support.")}<br /><strong>{t("Tailored to your team.")}</strong></span>
            </div>
          </div>
          <HeroPhoto />
        </div>
        <div className="container hero-bottom">
          <span>{t("BUILT FOR YOUR NEXT CHAPTER")}</span>
          <div className="industry-list"><span>{t("STARTUPS")}</span><i /><span>{t("E-COMMERCE")}</span><i /><span>SAAS</span><i /><span>{t("AGENCIES")}</span></div>
        </div>
      </HeroEntrance>

      {/* ── Intro ── */}
      <section className="intro-section section-pad">
        <Reveal className="container intro-grid">
          <div>
            <Eyebrow>{t("MORE THAN A VOICE ON THE LINE")}</Eyebrow>
            <h2>{t("Make room for the work ")}<em>{t("only you can do.")}</em></h2>
          </div>
          <div className="intro-text">
            <p>
              {t("Growing a business means showing up for every customer, prospect, and opportunity. Rangnova gives you a responsive team to help make those conversations happen—without losing the personal touch.")}
            </p>
            <ArrowLink to="/about">{t("Get to know Rangnova")}</ArrowLink>
          </div>
        </Reveal>
      </section>

      {/* ── Services ── */}
      <section className="services-section section-pad">
        <Reveal className="container">
          <div className="section-heading">
            <div>
              <Eyebrow>{t("WHAT WE CAN HELP WITH")}</Eyebrow>
              <h2>{t("Good conversations.")}<br /><em>{t("Better business.")}</em></h2>
            </div>
            <div className="section-heading-aside">
              <p>{t("From the first hello to the next appointment, get flexible support built around your priorities.")}</p>
              <ArrowLink to="/services">{t("See all services")}</ArrowLink>
            </div>
          </div>
          <ServiceGrid services={services.slice(0, 4)} />
        </Reveal>
      </section>

      {/* ── Approach ── */}
      <section className="approach-section">
        <Reveal className="container approach-grid">
          <div className="approach-visual">
            <div className="approach-photo">
              <img
                src="/images/home-team-portrait.webp"
                alt={t("A customer-support professional in a calm, bright workspace")}
                loading="lazy"
                width={1024}
                height={1024}
              />
              <div className="photo-label">{t("Made to fit your business")}</div>
            </div>
            <div className="floating-language">
              <span className="decorative-illustration floating-language-art"><ServiceIllustration type="languages" /></span><span><strong>{t("3 languages")}</strong><small>{t("One connected team")}</small></span>
            </div>
          </div>
          <div className="approach-copy">
            <Eyebrow>{t("A FLEXIBLE WAY FORWARD")}</Eyebrow>
            <h2>{t("Your business isn't ")}<em>{t("one-size-fits-all.")}</em></h2>
            <p>{t("So your customer communication shouldn't be either. We take time to understand how you work and shape a support approach around what your business actually needs.")}</p>
            <ul className="check-list">
              <li><span className="decorative-illustration check-list-illustration"><ServiceIllustration type="trust" /></span> {t("Responsive, reliable communication")}</li>
              <li><span className="decorative-illustration check-list-illustration"><ServiceIllustration type="trust" /></span> {t("English, French, and Arabic support")}</li>
              <li><span className="decorative-illustration check-list-illustration"><ServiceIllustration type="trust" /></span> {t("Flexible onboarding, tailored to you")}</li>
            </ul>
            <ButtonLink to="/about" variant="outline">{t("How we work")}</ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* ── Languages ── */}
      <section className="languages-section">
        <Reveal className="container languages-inner">
          <div>
            <Eyebrow light>{t("CONNECTION HAS NO BORDERS")}</Eyebrow>
            <h2>{t("Speak their language.")}<br /><em>{t("Make it personal.")}</em></h2>
          </div>
          <LanguageCards />
        </Reveal>
      </section>

      {/* ── CTA / Closing ── */}
      <section className="closing-section section-pad">
        <Reveal className="container closing-panel">
          <div className="closing-decoration"><span /><span /><span /></div>
          <div className="closing-content">
            <Eyebrow>{t("LET'S START A CONVERSATION")}</Eyebrow>
            <h2>{t("Ready for a little more ")}<em>{t("breathing room?")}</em></h2>
            <p>{t("Tell us what your customers need. We'll talk through an approach that fits your business.")}</p>
            <ButtonLink to="/contact">{t("Book a consultation")}</ButtonLink>
          </div>
          <div className="closing-aside">
            <span className="decorative-illustration closing-aside-art"><ServiceIllustration type="chat" /></span><span>{t("It starts with")}<br /><strong>{t("a hello.")}</strong></span><Icon name="arrowUp" size={19} />
          </div>
        </Reveal>
      </section>
    </>
  );
}
