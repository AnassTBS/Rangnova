export const verifiedCareersContent = {
  employerFacts: [
    { id: "morocco-based", textKey: "careers.fact.morocco" },
    { id: "european-businesses", textKey: "careers.fact.europe" },
    { id: "multilingual-work", textKey: "careers.fact.languages" },
  ],
  careerAreas: [
    { id: "customer-experience", textKey: "careers.area.customerExperience" },
    { id: "sales", textKey: "careers.area.sales" },
    { id: "telemarketing", textKey: "careers.area.telemarketing" },
    { id: "lead-generation", textKey: "careers.area.leadGeneration" },
    { id: "appointment-setting", textKey: "careers.area.appointmentSetting" },
    { id: "operations", textKey: "careers.area.operations" },
    { id: "back-office", textKey: "careers.area.backOffice" },
    { id: "corporate-support", textKey: "careers.area.corporateSupport" },
  ],
  candidateQualities: [
    { id: "communication", textKey: "careers.quality.communication" },
    { id: "customer-mindset", textKey: "careers.quality.customerMindset" },
    { id: "reliability", textKey: "careers.quality.reliability" },
    { id: "curiosity", textKey: "careers.quality.curiosity" },
    { id: "teamwork", textKey: "careers.quality.teamwork" },
    { id: "adaptability", textKey: "careers.quality.adaptability" },
    { id: "learning", textKey: "careers.quality.learning" },
  ],
  faq: [
    { id: "experience", questionKey: "careers.faq.experience.q", answerKey: "careers.faq.experience.a" },
    { id: "languages", questionKey: "careers.faq.languages.q", answerKey: "careers.faq.languages.a" },
    { id: "locations", questionKey: "careers.faq.locations.q", answerKey: "careers.faq.locations.a" },
    { id: "remote", questionKey: "careers.faq.remote.q", answerKey: "careers.faq.remote.a" },
    { id: "after-apply", questionKey: "careers.faq.afterApply.q", answerKey: "careers.faq.afterApply.a" },
    { id: "no-vacancy", questionKey: "careers.faq.noVacancy.q", answerKey: "careers.faq.noVacancy.a" },
    { id: "multiple-roles", questionKey: "careers.faq.multipleRoles.q", answerKey: "careers.faq.multipleRoles.a" },
    { id: "timeline", questionKey: "careers.faq.timeline.q", answerKey: "careers.faq.timeline.a" },
  ],
};

export const proposedCareersContent = {
  benefits: [
    { id: "training", textKey: "careers.benefit.training", status: "proposed" },
    { id: "progression", textKey: "careers.benefit.progression", status: "proposed" },
    { id: "language-development", textKey: "careers.benefit.languages", status: "proposed" },
    { id: "bonuses", textKey: "careers.benefit.bonuses", status: "proposed" },
    { id: "flexible-work", textKey: "careers.benefit.flexibility", status: "proposed" },
    { id: "team-activities", textKey: "careers.benefit.teamActivities", status: "proposed" },
  ],
  recruitmentSteps: [
    { id: "apply", textKey: "careers.step.apply", status: "example" },
    { id: "review", textKey: "careers.step.review", status: "example" },
    { id: "screening", textKey: "careers.step.screening", status: "example" },
    { id: "interview", textKey: "careers.step.interview", status: "example" },
    { id: "decision", textKey: "careers.step.decision", status: "example" },
    { id: "onboarding", textKey: "careers.step.onboarding", status: "example" },
  ],
};

export const careersContacts = {
  applicationEmail: "contact@rangnova.com",
  whatsappNumber: "212605560310",
  // Role-specific applications remain closed until Ringnova approves their intake details.
  roleEmailApplicationsEnabled: false,
};

/**
 * Publish only confirmed vacancies. Records support:
 * slug, titleKey, locationKey, employmentTypeKey, languageKeys,
 * departmentKey, overviewKey, responsibilities, requirements,
 * benefitKeys, recruitmentProcessKeys, status, publishedAt, updatedAt.
 */
export const jobs = [];
