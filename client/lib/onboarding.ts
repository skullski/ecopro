export type OnboardingStepId =
  | 'store_settings_opened'
  | 'store_branding_saved'
  | 'templates_opened'
  | 'template_switched'
  | 'product_created'
  | 'store_link_copied';

export type OnboardingProgress = {
  dismissed: boolean;
  firstSeenAt: string;
  completed: Record<OnboardingStepId, boolean>;
};

const STORAGE_KEY = 'ecopro_onboarding_v1';

const defaultProgress = (): OnboardingProgress => ({
  dismissed: false,
  firstSeenAt: new Date().toISOString(),
  completed: {
    store_settings_opened: false,
    store_branding_saved: false,
    templates_opened: false,
    template_switched: false,
    product_created: false,
    store_link_copied: false,
  },
});

export function getOnboardingProgress(): OnboardingProgress {
  if (typeof window === 'undefined') return defaultProgress();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<OnboardingProgress>;

    const base = defaultProgress();
    return {
      dismissed: Boolean(parsed.dismissed),
      firstSeenAt: typeof parsed.firstSeenAt === 'string' ? parsed.firstSeenAt : base.firstSeenAt,
      completed: {
        ...base.completed,
        ...(parsed.completed && typeof parsed.completed === 'object' ? (parsed.completed as any) : {}),
      },
    };
  } catch {
    return defaultProgress();
  }
}

export function setOnboardingProgress(next: OnboardingProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function markOnboardingStepComplete(step: OnboardingStepId) {
  const current = getOnboardingProgress();
  if (current.completed[step]) return;
  setOnboardingProgress({
    ...current,
    completed: {
      ...current.completed,
      [step]: true,
    },
  });
}

export function dismissOnboarding() {
  const current = getOnboardingProgress();
  if (current.dismissed) return;
  setOnboardingProgress({
    ...current,
    dismissed: true,
  });
}

export function resetOnboarding() {
  setOnboardingProgress(defaultProgress());
}
