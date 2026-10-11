import React from "react";
import { useI18n } from "../i18n";
import {
  Reveal,
  PageHero,
  CTASection,
  ServiceIllustration,
  RingnovaStar,
  ButtonLink,
  ArrowLink,
  Eyebrow,
} from "../sharedComponents";

/* ─── ServiceRows ────────────────────────────────────────────────────── */

function ServiceRows({ services: list }) {
  const { t } = useI18n();
  // Import Icon locally — sharedComponents re-exports it
  return (
    <div className="service-list">
      {list.map((service) => (
        <article className="service-row" key={service.number}>
          <span className="service-row-number">{service.number}</span>
          <span className="service-row-icon"><ServiceIllustration type={service.icon} /></span>
          <div><h3>{t(service.title)}</h3><p>{t(service.description)}</p></div>
          <ArrowUpIcon className="service-row-arrow" />
        </article>
      ))}
    </div>
  );
}

function ArrowUpIcon({ className = "" }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
      className={className}
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

/* ─── ServiceHeroVideo ───────────────────────────────────────────────── */

function ServiceHeroVideo() {
  const { t } = useI18n();
  const dialogRef = React.useRef(null);
  const modalVideoRef = React.useRef(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isModalMuted, setIsModalMuted] = React.useState(false);
  const [isModalPlaying, setIsModalPlaying] = React.useState(false);

  const resetModalVideo = (video) => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    video.removeAttribute("src");
    video.load();
  };

  React.useEffect(() => {
    if (!isModalOpen) return undefined;
    const dialog = dialogRef.current;
    const video = modalVideoRef.current;
    if (!dialog || !video) {
      console.warn("Unable to open the Services introduction video.");
      setIsModalOpen(false);
      return undefined;
    }

    if (!dialog.open) dialog.showModal();
    video.currentTime = 0;
    video.muted = false;
    setIsModalMuted(false);
    video.play().catch((error) => {
      if (error.name !== "AbortError") {
        console.warn("Unable to play the Meet Nova video.", error);
      }
    });
    return () => {
      if (dialog.open) {
        resetModalVideo(video);
        dialog.close();
      }
    };
  }, [isModalOpen]);

  const handleOpenVideo = () => setIsModalOpen(true);
  const handleCloseVideo = () => {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;

    const video = modalVideoRef.current;
    resetModalVideo(video);
    setIsModalPlaying(false);
    setIsModalMuted(true);
    setIsModalOpen(false);
    dialog.close();
  };
  const handleToggleMute = () => {
    const video = modalVideoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsModalMuted(video.muted);
  };
  const handleToggleModalPlayback = () => {
    const video = modalVideoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play().catch((error) => {
        if (error.name !== "AbortError") console.warn("Unable to resume the Meet Nova video.", error);
      });
    } else {
      video.pause();
    }
  };

  return (
    <div className="service-hero-video-stage" data-playing="false">
      <img
        className="service-hero-video-poster"
        src="/images/services-video-poster.webp"
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchpriority="high"
        width={1920}
        height={1080}
      />
      <div className="service-hero-video-brand" aria-hidden="true">
        <svg className="service-hero-video-orbit" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 98 20 A 48 48 0 0 1 97 84" />
          <circle cx="98" cy="20" r="1.35" />
        </svg>
        <RingnovaStar className="service-hero-video-star" size={9} color="var(--green)" />
        <span>MEET NOVA</span>
      </div>
      <button
        className="service-hero-video-open"
        type="button"
        aria-label={t("Open Meet Nova video with sound")}
        onClick={handleOpenVideo}
      >
        <span className="service-hero-video-open-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M8 5.75v12.5L18 12 8 5.75Z" fill="currentColor" />
          </svg>
        </span>
      </button>
      <dialog
        ref={dialogRef}
        className="service-hero-video-dialog"
        aria-label={t("Meet Nova video")}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            handleCloseVideo();
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          handleCloseVideo();
        }}
        onClose={() => {
          setIsModalPlaying(false);
          setIsModalMuted(true);
          setIsModalOpen(false);
        }}
      >
        <div className="service-hero-video-dialog-header">
          <button className="service-hero-video-dialog-close" type="button" aria-label={t("Close video")} onClick={handleCloseVideo}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className="service-hero-video-dialog-sound"
            type="button"
            aria-label={t(isModalMuted ? "Unmute video" : "Mute video")}
            aria-pressed={!isModalMuted}
            onClick={handleToggleMute}
          >
            {isModalMuted ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m17 9 5 6m0-6-5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M16 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
        {isModalOpen && (
          <video
            ref={modalVideoRef}
            className="service-hero-video-dialog-player"
            src="/videos/meet-nova.mp4"
            aria-label={t(isModalPlaying ? "Pause video" : "Play video")}
            playsInline
            preload="none"
            tabIndex={0}
            onClick={handleToggleModalPlayback}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                handleToggleModalPlayback();
              }
            }}
            onPlay={() => setIsModalPlaying(true)}
            onPause={() => setIsModalPlaying(false)}
            onEnded={() => setIsModalPlaying(false)}
          />
        )}
      </dialog>
    </div>
  );
}

/* ─── ServicePage ────────────────────────────────────────────────────── */

const services = [
  { number: "01", title: "Customer support", description: "Thoughtful, responsive customer care that helps every interaction feel like a good one.", icon: "chat" },
  { number: "02", title: "Inbound & outbound calls", description: "A dependable extension of your team for the conversations your business needs to have.", icon: "phone" },
  { number: "03", title: "Lead generation", description: "Build meaningful connections with prospects and give your pipeline room to grow.", icon: "spark" },
  { number: "04", title: "Appointment setting", description: "Make it easier for the right people to get a conversation on the calendar.", icon: "calendar" },
  { number: "05", title: "Telemarketing", description: "Personal, professional outreach shaped around your audience and business goals.", icon: "wave" },
];

export default function ServicePage() {
  const { t } = useI18n();
  return (
    <>
      <PageHero
        eyebrow={t("OUR SERVICES")}
        title={<>{t("The right support.")}<br /><em>{t("When it matters.")}</em></>}
        description={t("Flexible customer communication for the moments that move your business forward. Start with what you need; we'll shape the rest together.")}
        graphicClass="service-photo-wrap"
        heroClass="service-page-hero"
        graphic={<ServiceHeroVideo />}
      />
      <section className="service-detail-section section-pad">
        <Reveal className="container">
          <div className="service-page-intro">
            <Eyebrow>{t("HOW WE CAN HELP")}</Eyebrow>
            <h2>{t("One thoughtful team.")}<br /><em>{t("More ways to connect.")}</em></h2>
          </div>
          <ServiceRows services={services} />
          <div className="service-note">
            <span className="service-note-star"><RingnovaStar size={24} /></span>
            <p>{t("Not sure what fits? That's what the first conversation is for. We'll listen, learn about your business, and explore what could work.")}</p>
            <ButtonLink to="/contact" variant="outline">{t("Let's figure it out")}</ButtonLink>
          </div>
        </Reveal>
      </section>
      <section className="service-languages">
        <Reveal className="container service-languages-inner">
          <div>
            <Eyebrow>{t("YOUR CUSTOMERS, YOUR LANGUAGES")}</Eyebrow>
            <h2>{t("Connected across")}<br /><em>{t("every conversation.")}</em></h2>
          </div>
          <p>{t("Our Morocco-based team supports European businesses in English, French, and Arabic. We'll discuss your customers, communication needs, and a suitable approach together.")}</p>
        </Reveal>
      </section>
      <CTASection />
    </>
  );
}
