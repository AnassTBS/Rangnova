import React from "react";
import { useI18n } from "../i18n";
import {
  Reveal,
  PageHero,
  CTASection,
  ServiceIllustration,
  ArrowLink,
  ButtonLink,
  Eyebrow,
} from "../sharedComponents";

function ValuesGrid() {
  const { t } = useI18n();
  const values = [
    { num: "01", title: "Reliability", body: "Show up with care, follow through, and make dependable communication part of the experience.", illustration: "reliability" },
    { num: "02", title: "Responsiveness", body: "Stay attentive to your needs and keep communication open as your business evolves.", illustration: "responsiveness" },
    { num: "03", title: "Flexibility", body: "Build an approach around your priorities, not a pre-set package that doesn't fit.", illustration: "flexibility" },
    { num: "04", title: "Connection", body: "Support conversations in English, French, and Arabic for customers across Europe.", illustration: "connection" },
  ];

  return (
    <div className="values-grid">
      {values.map((v) => (
        <article key={v.num}>
          <div className="values-card-top">
            <span className="values-card-art"><ServiceIllustration type={v.illustration} /></span>
            <span className="values-card-number">{v.num}</span>
          </div>
          <div className="values-card-copy"><h3>{t(v.title)}</h3><p>{t(v.body)}</p></div>
        </article>
      ))}
    </div>
  );
}

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHero
        eyebrow={t("ABOUT RANGNOVA")}
        title={<>{t("Better business starts")}<br />{t("with ")}<em>{t("being there.")}</em></>}
        description={t("We believe the conversations around your business deserve the same care and attention you put into building it.")}
        graphicClass="about-hero-photo-wrap"
        graphic={<img className="about-hero-photo" src="/images/about-hero.webp" alt={t("A customer-support headset and workstation ready for a conversation")} loading="eager" fetchpriority="high" width={1152} height={768} />}
      />
      <section className="about-story section-pad">
        <Reveal className="container about-story-grid">
          <div>
            <Eyebrow>{t("OUR POINT OF VIEW")}</Eyebrow>
            <h2>{t("Every interaction is a chance to ")}<em>{t("show you care.")}</em></h2>
          </div>
          <div className="about-story-copy">
            <p>{t("Rangnova is a Morocco-based team helping growing businesses across Europe stay close to their customers and prospects. We bring a considered, human approach to customer support and business communication.")}</p>
            <p>{t("We know no two businesses work the same way. That's why we start by listening—then shape a flexible way of working around your needs, your customers, and the conversations that matter to you.")}</p>
            <ArrowLink to="/contact">{t("Start a conversation")}</ArrowLink>
          </div>
        </Reveal>
      </section>
      <section className="values-section">
        <Reveal className="container">
          <div className="values-heading">
            <Eyebrow>{t("WHAT YOU CAN EXPECT")}</Eyebrow>
            <h2>{t("A good partner makes")}<br /><em>{t("things feel simpler.")}</em></h2>
          </div>
          <ValuesGrid />
        </Reveal>
      </section>
      <section className="about-team-section">
        <Reveal className="container about-team-grid">
          <div className="team-art">
            <img src="/images/about-team.webp" alt={t("Three colleagues collaborating in a bright workspace")} loading="lazy" width={1029} height={768} />
          </div>
          <div>
            <Eyebrow>{t("A TEAM THAT STARTS BY LISTENING")}</Eyebrow>
            <h2>{t("Thoughtful people.")}<br /><em>{t("Work that fits.")}</em></h2>
            <p>{t("Based in Morocco and working with businesses across Europe, our team brings a personal, multilingual approach to every partnership. We learn what matters to your business before shaping how we can help.")}</p>
            <p>{t("From onboarding onward, we keep communication clear, responsive, and tailored to your needs.")}</p>
            <ButtonLink to="/contact" variant="outline">{t("Meet your next partner")}</ButtonLink>
          </div>
        </Reveal>
      </section>
      <CTASection />
    </>
  );
}
