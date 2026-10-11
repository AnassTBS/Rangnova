import React from "react";
import { useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import {
  Reveal,
  PageHero,
  RingnovaStar,
  Eyebrow,
} from "../sharedComponents";

const PhoneInputField = React.lazy(() =>
  import("../PhoneInputField").then((module) => ({ default: module.PhoneInputField })),
);

/* ─── Constants ─────────────────────────────────────────────────────── */

const CONTACT_FIELD_MAX_LENGTHS = {
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 40,
  jobFunction: 120,
  company: 150,
  industry: 120,
  country: 120,
  service: 120,
  source: 160,
  message: 4000,
};
const CONTACT_REQUEST_TIMEOUT_MS = 15_000;
const CONTACT_FIELD_LENGTH_ERROR = "Please shorten any fields that exceed their character limits.";

const serviceOptions = [
  "Customer support",
  "Inbound & outbound calls",
  "Lead generation",
  "Appointment setting",
  "Telemarketing",
];

/* ─── ContactForm ────────────────────────────────────────────────────── */

function ContactForm() {
  const { t } = useI18n();
  const activeRequestRef = React.useRef(null);
  const isMountedRef = React.useRef(false);
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobFunction: "",
    company: "",
    industry: "",
    country: "",
    service: "",
    source: "",
    message: "",
    consent: false,
    website: "",
  });

  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (activeRequestRef.current) {
        window.clearTimeout(activeRequestRef.current.timeoutId);
        activeRequestRef.current.controller.abort();
        activeRequestRef.current = null;
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = "Please enter your first name.";
    if (!formData.lastName.trim()) errs.lastName = "Please enter your last name.";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = "Please enter a valid work email address.";
    }
    if (!formData.consent) errs.consent = "Please agree to submit your inquiry to Rangnova.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const oversizedField = Object.entries(CONTACT_FIELD_MAX_LENGTHS).find(
      ([field, maxLength]) => (formData[field] || "").trim().length > maxLength,
    );
    if (oversizedField) {
      const [field] = oversizedField;
      setErrors({});
      setSubmitError(CONTACT_FIELD_LENGTH_ERROR);
      document.getElementsByName(field)[0]?.focus();
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setSubmitError("");
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      const el = document.getElementsByName(firstKey)[0];
      if (el) el.focus();
      return;
    }

    if (activeRequestRef.current) return;
    const controller = new AbortController();
    let timeoutId;
    let handleAbort;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = window.setTimeout(() => {
        controller.abort();
        reject(new Error("Contact request timed out."));
      }, CONTACT_REQUEST_TIMEOUT_MS);
    });
    const abortPromise = new Promise((_, reject) => {
      handleAbort = () => reject(new Error("Contact request aborted."));
      controller.signal.addEventListener("abort", handleAbort, { once: true });
    });
    activeRequestRef.current = { controller, timeoutId };
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const requestPromise = (async () => {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        return { response, result };
      })();
      const { response, result } = await Promise.race([
        requestPromise,
        timeoutPromise,
        abortPromise,
      ]);

      if (!response.ok || result.success !== true) {
        const errorMessage = import.meta.env.DEV && typeof result.error === "string"
          ? result.error
          : "We couldn’t send your inquiry right now. Please try again.";
        if (isMountedRef.current) setSubmitError(t(errorMessage));
        return;
      }

      if (isMountedRef.current) {
        setSubmitted(true);
        setSubmitError("");
      }
    } catch {
      if (isMountedRef.current) {
        setSubmitError("We couldn’t send your inquiry right now. Please try again.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      controller.signal.removeEventListener("abort", handleAbort);
      if (activeRequestRef.current?.controller === controller) {
        activeRequestRef.current = null;
      }
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobFunction: "",
      company: "",
      industry: "",
      country: "",
      service: "",
      source: "",
      message: "",
      consent: false,
      website: "",
    });
    setErrors({});
    setSubmitError("");
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="form-success-card" role="status">
        <div className="form-success-star">
          <RingnovaStar size={36} />
        </div>
        <h3>{t("Your inquiry has been sent")}</h3>
        <p className="form-success-lead">
          {t("Thanks,")} <strong>{formData.firstName}</strong>. {t("Your inquiry has been submitted successfully and our team will be in touch soon.")}
        </p>
        <button type="button" className="button button-outline form-reset-btn" onClick={handleReset}>
          {t("Edit details")}
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-honeypot" aria-hidden="true" inert="">
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>
      {/* ── Section 1: Personal Information ── */}
      <fieldset className="form-section-group">
        <legend className="form-section-header">
          <span className="form-section-badge">01</span>
          <span className="form-section-title">{t("Personal Information")}</span>
        </legend>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="firstName">
              {t("First Name")} <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder={t("e.g. Sarah")}
              value={formData.firstName}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
            {errors.firstName && <span className="field-error" id="firstName-error">{t(errors.firstName)}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="lastName">
              {t("Last Name")} <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder={t("e.g. Dubois")}
              value={formData.lastName}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
            />
            {errors.lastName && <span className="field-error" id="lastName-error">{t(errors.lastName)}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="email">
              {t("Work Email")} <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              placeholder="sarah.dubois@company.com"
              value={formData.email}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <span className="field-error" id="email-error">{t(errors.email)}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="phone">{t("Phone Number")}</label>
            <React.Suspense
              fallback={
                <div className="phone-input-group">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    dir="ltr"
                    autoComplete="tel-national"
                    placeholder="1 23 45 67 89"
                    value={formData.phone}
                    onChange={handleChange}
                    className="phone-number-input"
                  />
                </div>
              }
            >
              <PhoneInputField
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
                placeholder="1 23 45 67 89"
                autoComplete="tel-national"
              />
            </React.Suspense>
          </div>
        </div>
      </fieldset>

      {/* ── Section 2: Professional Information ── */}
      <fieldset className="form-section-group">
        <legend className="form-section-header">
          <span className="form-section-badge">02</span>
          <span className="form-section-title">{t("Professional Information")}</span>
        </legend>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="jobFunction">{t("Job Function")}</label>
            <select id="jobFunction" name="jobFunction" value={formData.jobFunction} onChange={handleChange}>
              <option value="">{t("Select your role (optional)")}</option>
              <option value="Executive (CEO, Founder, MD)">{t("Executive (CEO, Founder, MD)")}</option>
              <option value="Customer Experience & Support Leader">{t("Customer Experience & Support Leader")}</option>
              <option value="Sales & Business Development">{t("Sales & Business Development")}</option>
              <option value="Operations & Delivery">{t("Operations & Delivery")}</option>
              <option value="Marketing & Digital">{t("Marketing & Digital")}</option>
              <option value="Other role">{t("Other role")}</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="company">{t("Company")}</label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder={t("Your company name")}
              value={formData.company}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="industry">{t("Industry")}</label>
            <select id="industry" name="industry" value={formData.industry} onChange={handleChange}>
              <option value="">{t("Select your industry (optional)")}</option>
              <option value="E-commerce & Retail">{t("E-commerce & Retail")}</option>
              <option value="Software & SaaS">{t("Software & SaaS")}</option>
              <option value="Professional Services & Agencies">{t("Professional Services & Agencies")}</option>
              <option value="Banking, Finance & FinTech">{t("Banking, Finance & FinTech")}</option>
              <option value="Healthcare & Wellness">{t("Healthcare & Wellness")}</option>
              <option value="Logistics & Transportation">{t("Logistics & Transportation")}</option>
              <option value="Telecommunications & Media">{t("Telecommunications & Media")}</option>
              <option value="Other industry">{t("Other industry")}</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="country">{t("Country")}</label>
            <select id="country" name="country" value={formData.country} onChange={handleChange}>
              <option value="">{t("Select your country (optional)")}</option>
              <option value="United Kingdom">{t("United Kingdom")}</option>
              <option value="France">{t("France")}</option>
              <option value="Germany">{t("Germany")}</option>
              <option value="Belgium">{t("Belgium")}</option>
              <option value="Switzerland">{t("Switzerland")}</option>
              <option value="Netherlands">{t("Netherlands")}</option>
              <option value="Spain">{t("Spain")}</option>
              <option value="Italy">{t("Italy")}</option>
              <option value="Morocco">{t("Morocco")}</option>
              <option value="Luxembourg">{t("Luxembourg")}</option>
              <option value="Other European country">{t("Other European country")}</option>
              <option value="International">{t("International")}</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── Section 3: Your Project ── */}
      <fieldset className="form-section-group">
        <legend className="form-section-header">
          <span className="form-section-badge">03</span>
          <span className="form-section-title">{t("Your Project")}</span>
        </legend>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="service">{t("What service are you interested in?")}</label>
            <select id="service" name="service" value={formData.service} onChange={handleChange}>
              <option value="">{t("Select a service (optional)")}</option>
              {serviceOptions.map((s) => (
                <option key={s} value={s}>{t(s)}</option>
              ))}
              <option value="Full support / Multi-service">{t("Full support / Multi-service")}</option>
              <option value="Other need">{t("Other need")}</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="source">{t("How did you hear about us?")}</label>
            <select id="source" name="source" value={formData.source} onChange={handleChange}>
              <option value="">{t("Select an option (optional)")}</option>
              <option value="Search Engine (Google...)">{t("Search Engine (Google...)")}</option>
              <option value="LinkedIn / Social Media">{t("LinkedIn / Social Media")}</option>
              <option value="Referral / Professional Network">{t("Referral / Professional Network")}</option>
              <option value="Event / Conference">{t("Event / Conference")}</option>
              <option value="Press or Media">{t("Press or Media")}</option>
              <option value="Other">{t("Other")}</option>
            </select>
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="message">{t("Briefly describe the challenge you want Rangnova to help you with...")}</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            placeholder={t("Tell us about your needs, current communication channels (calls, chat, email), expected volumes, or key goals...")}
            value={formData.message}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      {/* ── Consent ── */}
      <div className="form-consent-wrap">
        <div className="consent-label">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            className="consent-checkbox"
            checked={formData.consent}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <span>
            <label htmlFor="consent">
              {t("I agree that the details I provided will be sent to Rangnova so the team can respond to my inquiry. See the")}
            </label>{" "}
            <Link to="/privacy">{t("Privacy Policy")}</Link>.             <span className="required-star" aria-hidden="true">*</span>
          </span>
        </div>
        {errors.consent && <span className="field-error" id="consent-error">{t(errors.consent)}</span>}
      </div>

      {/* ── CTA Submit Button ── */}
      <div className="form-actions">
        <button
          className="button button-primary form-submit-btn"
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? t("Sending...") : t("SEND EMAIL")}
          <RingnovaStar size={16} className="btn-star-icon" />
        </button>
        {isSubmitting && (
          <span className="contact-form-status-live" role="status" aria-live="polite">
            {t("Sending...")}
          </span>
        )}
        {submitError && (
          <p className="field-error" role="alert">
            {t(submitError)}
          </p>
        )}
        <p className="form-privacy-note">
          {t("Selecting Send Email sends your inquiry directly to ringnovasales@gmail.com. Our team will review it and get back to you.")}
        </p>
      </div>
    </form>
  );
}

/* ─── ContactHeroVideo ───────────────────────────────────────────────── */

function ContactHeroVideo() {
  const videoRef = React.useRef(null);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reducedMotion) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }, [reducedMotion]);

  return (
    <div className="contact-hero-video-wrap" aria-hidden="true">
      <video
        ref={videoRef}
        className="contact-hero-video"
        src="/videos/contact-hero.mp4"
        poster="/images/contact-map-poster.webp"
        muted
        playsInline
        autoPlay={!reducedMotion}
        loop={false}
        preload={reducedMotion ? "none" : "auto"}
        onEnded={(event) => event.currentTarget.pause()}
      />
      <div className="contact-hero-scrim" />
    </div>
  );
}

/* ─── ContactPage ────────────────────────────────────────────────────── */

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHero
        eyebrow={t("CONTACT")}
        title={<>{t("contactHeroFirst")}<br /><em>{t("contactHeroEmphasis")}</em></>}
        description={t("Looking for a more thoughtful way to support your customers or grow your outreach? We'd love to hear what you have in mind.")}
        heroClass="contact-page-hero"
        background={<ContactHeroVideo />}
      />
      <section className="contact-section section-pad">
        <Reveal className="container contact-grid">
          <div className="contact-aside">
            <div className="contact-aside-copy">
              <Eyebrow>{t("START WITH A HELLO")}</Eyebrow>
              <h2>{t("A good fit starts with a ")}<em>{t("good conversation.")}</em></h2>
              <p>{t("Share a little about your business and what you're looking for. We'll use it to understand what matters to you and explore next steps together.")}</p>
              <span className="contact-aside-foot">{t("No pressure. Just a conversation.")}</span>
            </div>
            <div className="contact-aside-right">
              <div className="contact-facts">
                <div className="contact-lang-panel contact-fact-card">
                  <div className="contact-lang-flags">
                    <span className="contact-lang-flag-wrap">
                      <img src="/images/morocco.webp" alt={t("Morocco flag")} className="contact-lang-flag-img" width={44} height={44} />
                    </span>
                    <span className="contact-lang-flag-wrap">
                      <img src="/images/flag-eu.svg" alt={t("European Union flag")} className="contact-lang-flag-img" width={44} height={44} />
                    </span>
                  </div>
                  <div className="contact-lang-info">
                    <strong>{t("Based in Morocco")}</strong>
                    <small>{t("Working with businesses across Europe")}</small>
                  </div>
                </div>
                <div className="contact-lang-panel contact-fact-card">
                  <div className="contact-lang-flags">
                    <span className="contact-lang-flag-wrap">
                      <img src="/images/icon-listen.webp" alt={t("Here to listen")} className="contact-lang-flag-img" width={44} height={44} />
                    </span>
                  </div>
                  <div className="contact-lang-info">
                    <strong>{t("Here to listen")}</strong>
                    <small>{t("Onboarding shaped around your needs")}</small>
                  </div>
                </div>
                <div className="contact-lang-panel contact-fact-card">
                  <div className="contact-lang-flags">
                    <span className="contact-lang-flag-wrap">
                      <img src="/images/flag-en.svg" alt={t("English flag")} className="contact-lang-flag-img" width={44} height={44} />
                    </span>
                    <span className="contact-lang-flag-wrap">
                      <img src="/images/flag-fr.svg" alt={t("French flag")} className="contact-lang-flag-img" width={44} height={44} />
                    </span>
                    <span className="contact-lang-flag-wrap">
                      <img src="/images/flag-sa.svg" alt={t("Saudi Arabia flag")} className="contact-lang-flag-img" width={44} height={44} />
                    </span>
                  </div>
                  <div className="contact-lang-info">
                    <strong>{t("Speak your language")}</strong>
                    <small>{t("English, French, and Arabic support")}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="contact-form-wrap">
            <div className="form-heading">
              <span><RingnovaStar size={13} className="form-heading-star" /> {t("GET IN TOUCH")}</span>
              <strong>{t("Tell us about your needs")}</strong>
            </div>
            <ContactForm />
          </div>
        </Reveal>
      </section>
    </>
  );
}
