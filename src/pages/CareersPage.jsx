import React from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "../i18n";
import {
  Reveal,
  HeroEntrance,
  PageHero,
  RingnovaStar,
  ServiceIllustration,
  CareerAreaIcon,
  CareerQualityIcon,
  ArrowLink,
  Eyebrow,
} from "../sharedComponents";
import { careersContacts, jobs, proposedCareersContent, verifiedCareersContent } from "../careersData";

/* ─── Icon helper (arrow variants) ──────────────────────────────────── */

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
  };
  return <svg {...common}>{paths[name]}</svg>;
}

/* ─── CareersHero ────────────────────────────────────────────────────── */

function CareersHero() {
  const { t } = useI18n();
  return (
    <HeroEntrance as="section" className="careers-hero">
      <div className="container careers-hero-inner">
        <div className="careers-hero-copy">
          <Eyebrow>{t("careers.hero.eyebrow")}</Eyebrow>
          <h1>{t("careers.hero.headline")}</h1>
          <p>{t("careers.hero.body")}</p>
          <div className="careers-hero-actions">
            <a className="button button-primary" href="#careers-positions">
              {t("careers.hero.positions")}<Icon name="arrow" size={17} />
            </a>
            <a className="arrow-link" href="#careers-recruitment">
              {t("careers.hero.future")}<Icon name="arrow" size={17} />
            </a>
          </div>
        </div>
        <div className="careers-hero-art">
          <img
            className="careers-hero-photo"
            src="/images/about-team.webp"
            alt={t("Three colleagues collaborating in a bright workspace")}
            loading="eager"
            fetchpriority="high"
            width={1029}
            height={768}
          />
          <div className="careers-hero-photo-shade" aria-hidden="true" />
          <div className="careers-hero-photo-stamp" aria-hidden="true">
            <RingnovaStar size={22} />
            <span>RANGNOVA</span>
          </div>
          <span className="careers-hero-art-caption">{t("careers.hero.artCaption")}</span>
        </div>
      </div>
      <div className="careers-hero-edge" />
    </HeroEntrance>
  );
}

/* ─── Section components ─────────────────────────────────────────────── */

function WhyRingnovaSection() {
  const { t } = useI18n();
  const illustrations = ["location", "europe", "languages"];
  return (
    <section className="careers-why section-pad">
      <Reveal className="container careers-why-grid">
        <div className="careers-why-heading">
          <Eyebrow>{t("careers.why.eyebrow")}</Eyebrow>
          <h2>{t("careers.why.title")}</h2>
        </div>
        <div className="careers-why-copy">
          <p>{t("careers.why.body")}</p>
          <ul className="careers-facts">
            {verifiedCareersContent.employerFacts.map((fact, index) => (
              <li key={fact.id}>
                <span className="careers-fact-art" aria-hidden="true">
                  <ServiceIllustration type={illustrations[index]} />
                </span>
                <strong>{t(fact.textKey)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

function CareerAreasSection() {
  const { t } = useI18n();
  return (
    <section className="careers-areas section-pad">
      <Reveal className="container">
        <div className="careers-section-intro careers-areas-intro">
          <div>
            <Eyebrow>{t("careers.areas.eyebrow")}</Eyebrow>
            <h2>{t("careers.areas.title")}</h2>
          </div>
          <p>{t("careers.areas.body")}</p>
        </div>
        <ul className="careers-area-list">
          {verifiedCareersContent.careerAreas.map((area) => (
            <li key={area.id}>
              <CareerAreaIcon type={area.id} />
              <strong>{t(area.textKey)}</strong>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

function CareersOpenPositions() {
  const { t, language } = useI18n();
  const publishedJobs = React.useMemo(
    () => jobs.filter((job) => job.status === "published"),
    [],
  );
  const [filters, setFilters] = React.useState({
    keyword: "",
    locationKey: "",
    departmentKey: "",
    languageKey: "",
    employmentTypeKey: "",
  });

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };
  const resetFilters = () => {
    setFilters({
      keyword: "",
      locationKey: "",
      departmentKey: "",
      languageKey: "",
      employmentTypeKey: "",
    });
  };
  const optionsFor = (key) => [...new Set(
    publishedJobs.flatMap((job) => (key === "languageKeys" ? (job[key] || []) : [job[key]]).filter(Boolean)),
  )];

  const filteredJobs = React.useMemo(() => {
    const normalizedKeyword = filters.keyword.trim().toLocaleLowerCase(language);
    return publishedJobs.filter((job) => {
      const text = [
        job.titleKey,
        job.overviewKey,
        job.departmentKey,
        job.locationKey,
        job.employmentTypeKey,
        ...(job.languageKeys || []),
      ].filter(Boolean).map((key) => t(key).toLocaleLowerCase(language)).join(" ");
      return (!normalizedKeyword || text.includes(normalizedKeyword))
        && (!filters.locationKey || job.locationKey === filters.locationKey)
        && (!filters.departmentKey || job.departmentKey === filters.departmentKey)
        && (!filters.languageKey || (job.languageKeys || []).includes(filters.languageKey))
        && (!filters.employmentTypeKey || job.employmentTypeKey === filters.employmentTypeKey);
    });
  }, [filters, language, publishedJobs, t]);

  return (
    <section className="careers-positions section-pad" id="careers-positions" aria-labelledby="careers-positions-title">
      <Reveal className="container">
        <div className="careers-positions-heading">
          <div>
            <Eyebrow>{t("careers.positions.eyebrow")}</Eyebrow>
            <h2 id="careers-positions-title">{t("careers.positions.title")}</h2>
          </div>
          {publishedJobs.length > 0 && (
            <p className="careers-positions-count" aria-live="polite">{filteredJobs.length}</p>
          )}
        </div>
        {publishedJobs.length === 0 ? (
          <div className="careers-empty-state">
            <span className="careers-empty-star" aria-hidden="true"><RingnovaStar size={23} /></span>
            <div>
              <p>{t("careers.positions.empty")}</p>
              <a className="arrow-link" href="#careers-recruitment">
                {t("careers.positions.join")}<Icon name="arrow" size={17} />
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="careers-job-filters" role="search" aria-label={t("careers.positions.title")}>
              <div className="form-field careers-job-search">
                <label htmlFor="careers-keyword">{t("careers.positions.keyword")}</label>
                <input
                  id="careers-keyword"
                  type="search"
                  placeholder={t("careers.positions.keywordPlaceholder")}
                  value={filters.keyword}
                  onChange={(event) => updateFilter("keyword", event.target.value)}
                />
              </div>
              {[
                ["locationKey", "locationKey", "careers.positions.location"],
                ["departmentKey", "departmentKey", "careers.positions.department"],
                ["languageKey", "languageKeys", "careers.positions.language"],
                ["employmentTypeKey", "employmentTypeKey", "careers.positions.employmentType"],
              ].map(([filterName, dataKey, labelKey]) => (
                <div className="form-field" key={filterName}>
                  <label htmlFor={`careers-${filterName}`}>{t(labelKey)}</label>
                  <select
                    id={`careers-${filterName}`}
                    value={filters[filterName]}
                    onChange={(event) => updateFilter(filterName, event.target.value)}
                  >
                    <option value="">{t("careers.positions.any")}</option>
                    {optionsFor(dataKey).map((key) => (
                      <option key={key} value={key}>{t(key)}</option>
                    ))}
                  </select>
                </div>
              ))}
              <button className="careers-reset-filters" type="button" onClick={resetFilters}>
                {t("careers.positions.reset")}
              </button>
            </div>
            {filteredJobs.length === 0 ? (
              <p className="careers-job-no-match" role="status">{t("careers.positions.noMatch")}</p>
            ) : (
              <div className="careers-job-list">
                {filteredJobs.map((job) => (
                  <article className="careers-job-card" key={job.slug}>
                    <div>
                      <h3><Link to={`/careers/${job.slug}`}>{t(job.titleKey)}</Link></h3>
                      <p>{t(job.overviewKey)}</p>
                      <ul className="careers-job-metadata">
                        {[
                          ["locationKey", "careers.positions.location"],
                          ["departmentKey", "careers.positions.department"],
                          ["employmentTypeKey", "careers.positions.employmentType"],
                        ].filter(([key]) => job[key]).map(([key, label]) => (
                          <li key={key}><span>{t(label)}:</span> {t(job[key])}</li>
                        ))}
                        {(job.languageKeys || []).length > 0 && (
                          <li key="languages"><span>{t("careers.positions.language")}:</span> {job.languageKeys.map((key) => t(key)).join(", ")}</li>
                        )}
                      </ul>
                    </div>
                    <Link className="arrow-link" to={`/careers/${job.slug}`}>
                      {t("careers.positions.viewRole")}<Icon name="arrow" size={17} />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </Reveal>
    </section>
  );
}

function CandidateQualitiesSection() {
  const { t } = useI18n();
  return (
    <section className="careers-qualities section-pad">
      <Reveal className="container careers-qualities-inner">
        <div className="careers-qualities-heading">
          <Eyebrow>{t("careers.qualities.eyebrow")}</Eyebrow>
          <h2>{t("careers.qualities.title")}</h2>
          <p>{t("careers.qualities.body")}</p>
        </div>
        <ul className="careers-quality-list">
          {verifiedCareersContent.candidateQualities.map((quality) => (
            <li key={quality.id}>
              <CareerQualityIcon type={quality.id} />
              {t(quality.textKey)}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

function GrowthSection() {
  const { t } = useI18n();
  return (
    <section className="careers-growth section-pad">
      <Reveal className="container careers-growth-inner">
        <Eyebrow light>{t("careers.growth.eyebrow")}</Eyebrow>
        <h2>{t("careers.growth.title")}</h2>
        <p>{t("careers.growth.body")}</p>
      </Reveal>
    </section>
  );
}

function LifeAtRingnovaSection() {
  const { t } = useI18n();
  return (
    <section className="careers-life section-pad">
      <Reveal className="container careers-life-inner">
        <div className="careers-life-copy">
          <Eyebrow>{t("careers.life.eyebrow")}</Eyebrow>
          <h2>{t("careers.life.title")}</h2>
          <p>{t("careers.life.body")}</p>
        </div>
        <div className="careers-life-art">
          <div className="careers-life-photo-frame">
            <img
              className="careers-life-photo"
              src="/images/home-team-portrait.webp"
              alt={t("A customer-support professional in a calm, bright workspace")}
              loading="lazy"
              width={1024}
              height={1024}
            />
          </div>
          <div className="careers-life-photo-accent" aria-hidden="true" />
          <div className="careers-life-art-note">
            <RingnovaStar size={27} />
            <span>{t("careers.life.visual")}</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function HiringProcessSection() {
  const { t } = useI18n();
  return (
    <section className="careers-hiring section-pad">
      <Reveal className="container">
        <div className="careers-hiring-heading">
          <div>
            <Eyebrow>{t("careers.hiring.eyebrow")}</Eyebrow>
            <h2>{t("careers.hiring.title")}</h2>
          </div>
          <p>{t("careers.hiring.note")}</p>
        </div>
        <ol className="careers-hiring-steps">
          {proposedCareersContent.recruitmentSteps.map((step, index) => (
            <li key={step.id}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{t(step.textKey)}</strong>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}

function RecruitmentCTASection() {
  const { t } = useI18n();
  const applicationHref = `mailto:${careersContacts.applicationEmail}?subject=${encodeURIComponent("Spontaneous Application – Rangnova")}`;
  return (
    <section className="careers-recruitment section-pad" id="careers-recruitment" aria-labelledby="careers-recruitment-title">
      <Reveal className="container careers-recruitment-panel">
        <div className="careers-recruitment-mark" aria-hidden="true"><RingnovaStar size={36} /></div>
        <div className="careers-recruitment-copy">
          <Eyebrow light>{t("careers.recruitment.eyebrow")}</Eyebrow>
          <h2 id="careers-recruitment-title">{t("careers.recruitment.title")}</h2>
          <p>{t("careers.recruitment.body")}</p>
          <ol className="careers-application-steps">
            {["open", "cv", "letter", "send"].map((step) => (
              <li key={step}>{t(`careers.recruitment.step.${step}`)}</li>
            ))}
          </ol>
          <a className="button button-outline careers-recruitment-link" href={applicationHref} target="_blank" rel="noopener noreferrer">
            {t("careers.recruitment.sendApplication")}<Icon name="arrow" size={17} />
          </a>
          <p className="careers-recruitment-email">
            {t("careers.recruitment.emailFallback")}{" "}
            <a href={applicationHref} target="_blank" rel="noopener noreferrer">{careersContacts.applicationEmail}</a>
          </p>
        </div>
        <div className="careers-recruitment-decoration" aria-hidden="true"><span /><span /><span /></div>
      </Reveal>
    </section>
  );
}

function CareersFAQ() {
  const { t } = useI18n();
  const [openId, setOpenId] = React.useState(null);
  return (
    <section className="careers-faq-section section-pad">
      <Reveal className="container careers-faq-inner">
        <div className="careers-faq-heading">
          <Eyebrow>{t("careers.faq.eyebrow")}</Eyebrow>
          <h2>{t("careers.faq.title")}</h2>
        </div>
        <div className="careers-faq-list">
          {verifiedCareersContent.faq.map((item, index) => {
            const isOpen = openId === item.id;
            const answerId = `careers-faq-answer-${item.id}`;
            return (
              <div className={`careers-faq-item${isOpen ? " is-open" : ""}`} key={item.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                >
                  <span className="careers-faq-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span>{t(item.questionKey)}</span>
                  <span className="careers-faq-toggle" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
                <div className="careers-faq-answer" id={answerId} hidden={!isOpen}>
                  <p>{t(item.answerKey)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

function RecruitmentSafetySection() {
  const { t } = useI18n();
  return (
    <section className="careers-safety">
      <div className="container careers-safety-inner">
        <span className="careers-safety-icon decorative-illustration" aria-hidden="true"><ServiceIllustration type="trust" /></span>
        <div>
          <h2>{t("careers.safety.title")}</h2>
          <p>{t("careers.safety.body")}</p>
        </div>
      </div>
    </section>
  );
}

function CareersFinalCTA() {
  const { t } = useI18n();
  return (
    <section className="careers-final section-pad">
      <Reveal className="container careers-final-inner">
        <div>
          <Eyebrow light>{t("careers.final.eyebrow")}</Eyebrow>
          <h2>{t("careers.final.title")}</h2>
        </div>
        <div className="careers-final-actions">
          <a className="button button-primary" href="#careers-positions">
            {t("careers.final.positions")}<Icon name="arrow" size={17} />
          </a>
          <a className="button button-outline" href="#careers-recruitment">
            {t("careers.final.future")}<Icon name="arrow" size={17} />
          </a>
        </div>
      </Reveal>
    </section>
  );
}

/* ─── NotFoundPage (used by CareersJobDetailPage when job not found) ── */

import { BrandOrbit, ButtonLink } from "../sharedComponents";

function NotFoundFallback() {
  const { t } = useI18n();
  return (
    <>
      <PageHero
        eyebrow={t("PAGE NOT FOUND")}
        title={<>{t("This page went")}<br /><em>{t("off script.")}</em></>}
        description={t("The page may have moved, or the address may be incorrect.")}
        graphic={<BrandOrbit />}
      />
      <section className="privacy-section section-pad">
        <Reveal className="container privacy-content">
          <h2>{t("Let's get you back on track.")}</h2>
          <p>{t("Try the homepage or use the navigation to find what you need.")}</p>
          <ButtonLink to="/">{t("Back to home")}</ButtonLink>
        </Reveal>
      </section>
    </>
  );
}

/* ─── CareersPage ────────────────────────────────────────────────────── */

export function CareersPage() {
  return (
    <div className="careers-page">
      <CareersHero />
      <WhyRingnovaSection />
      <CareerAreasSection />
      <CareersOpenPositions />
      <CandidateQualitiesSection />
      <GrowthSection />
      <LifeAtRingnovaSection />
      <HiringProcessSection />
      <RecruitmentCTASection />
      <CareersFAQ />
      <RecruitmentSafetySection />
      <CareersFinalCTA />
    </div>
  );
}

/* ─── CareersJobDetailPage ───────────────────────────────────────────── */

export function CareersJobDetailPage() {
  const { jobSlug } = useParams();
  const { t } = useI18n();
  const job = jobs.find((item) => item.slug === jobSlug && item.status === "published");
  if (!job) return <NotFoundFallback />;

  const detailSections = [
    ["overviewKey", "careers.job.overview", job.overviewKey ? [job.overviewKey] : []],
    ["responsibilities", "careers.job.responsibilities", job.responsibilities || []],
    ["requirements", "careers.job.requirements", job.requirements || []],
    ["benefitKeys", "careers.job.benefits", job.benefitKeys || []],
    ["recruitmentProcessKeys", "careers.job.process", job.recruitmentProcessKeys || []],
  ].filter(([, , content]) => content.length > 0);

  const applicationHref = `mailto:${careersContacts.applicationEmail}?subject=${encodeURIComponent(`${t("careers.job.emailSubjectPrefix")}: ${t(job.titleKey)}`)}&body=${encodeURIComponent(`${t("careers.job.emailGreeting")}\n\n${t("careers.job.emailBodyIntro")} ${t(job.titleKey)}.\n\n${t("careers.job.emailBodyOutro")}`)}`;

  return (
    <>
      <PageHero
        eyebrow={t("careers.positions.eyebrow")}
        title={t(job.titleKey)}
        description={t(job.overviewKey)}
      />
      <section className="careers-job-detail section-pad">
        <div className="container">
          <ul className="careers-job-metadata careers-job-detail-metadata">
            {[
              ["locationKey", "careers.positions.location"],
              ["departmentKey", "careers.positions.department"],
              ["employmentTypeKey", "careers.positions.employmentType"],
            ].filter(([key]) => job[key]).map(([key, label]) => (
              <li key={key}><span>{t(label)}:</span> {t(job[key])}</li>
            ))}
            {(job.languageKeys || []).length > 0 && (
              <li key="languages"><span>{t("careers.positions.language")}:</span> {job.languageKeys.map((key) => t(key)).join(", ")}</li>
            )}
          </ul>
          {detailSections.map(([key, headingKey, content]) => (
            <section className="careers-job-detail-section" key={key}>
              <h2>{t(headingKey)}</h2>
              {key === "overviewKey" ? (
                <p>{t(content[0])}</p>
              ) : (
                <ul>{content.map((item) => <li key={item}>{t(item)}</li>)}</ul>
              )}
            </section>
          ))}
          <div className="careers-job-apply">
            <div className="careers-job-contact-actions">
              {careersContacts.emailApplicationsEnabled && careersContacts.applicationEmail ? (
                <>
                  <a
                    className="button button-primary"
                    href={applicationHref}
                  >
                    {t("careers.job.applyEmail")}<Icon name="arrow" size={17} />
                  </a>
                  <p className="careers-job-email-note">
                    {t("careers.job.emailInstruction")}{" "}
                    <a href={`mailto:${careersContacts.applicationEmail}`}>{careersContacts.applicationEmail}</a>
                  </p>
                </>
              ) : (
                <p>{t("careers.job.applicationUnavailable")}</p>
              )}
              {careersContacts.whatsappNumber && (
                <a
                  className="arrow-link"
                  href={`https://wa.me/${careersContacts.whatsappNumber}?text=${encodeURIComponent(`${t("careers.job.whatsAppMessage")} ${t(job.titleKey)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("careers.job.askWhatsApp")}<Icon name="arrow" size={17} />
                </a>
              )}
            </div>
            <Link className="arrow-link" to="/careers">{t("Careers")}<Icon name="arrow" size={17} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
