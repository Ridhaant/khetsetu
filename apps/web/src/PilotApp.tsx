import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Apple,
  Carrot,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  FileText,
  Globe,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Sprout,
  Store,
  Truck,
  Wheat,
  X,
} from 'lucide-react';
import { INDIAN_PIN_PATTERN, hasIndianPinFormat } from './domain.mjs';
import { pilotCopy, type Copy, type Language } from './pilotCopy';
import {
  PRODUCE_GROUPS,
  SEASONS,
  catalogSummaryCounts,
  filterProduceCatalog,
  produceCatalog,
} from './produceCatalog.mjs';
import {
  createReceiptCredentials,
  detectBackendMode,
  fetchAdminRequests,
  fetchAdminSession,
  fetchReceipt,
  getSavedReceipts,
  isLocalPreviewHost,
  mutateAdminRequest,
  persistReceipt,
  setStaticOpsUnlocked,
  submitPilotRequest,
  withdrawPilotReceipt,
  type BackendMode,
  type Kind,
  type Quote,
  type ReceiptKey,
  type RecordRow,
  type Status,
} from './pilotClient';
import { buildEmailInquiryUrl, buildWhatsappInquiryUrl, indiaToday } from './pilotStore.mjs';

type FormState = {
  name: string;
  phone: string;
  businessName: string;
  businessType: string;
  pin: string;
  produce: string;
  quantity: string;
  unit: string;
  grade: string;
  neededBy: string;
  frequency: string;
  notes: string;
  website: string;
  consent: boolean;
};

type ProducePrefill = {
  id: string;
  label: string;
  produce: string;
  unit: string;
  quantity: string;
};

type SubmittedSummary = ReceiptKey & {
  kind: Kind;
  produce: string;
  quantity: string;
  unit: string;
  grade: string;
  pin: string;
  neededBy: string;
  name: string;
  phone: string;
};

const ALL_STATUSES: Status[] = [
  'new',
  'reviewing',
  'quoted',
  'confirmed',
  'fulfilled',
  'cancelled',
];

const formatInr = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(paise / 100);

const formatDate = (value: string | number, lang: Language) =>
  new Date(value).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

function Notice({
  children,
  danger = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`notice ${danger ? 'danger' : ''}`} role={danger ? 'alert' : 'status'}>
      {danger ? <AlertCircle size={19} /> : <CheckCircle2 size={19} />}
      <div>{children}</div>
    </div>
  );
}

function Brand({ tagline }: { tagline: string }) {
  return (
    <a className="brand" href="#home" aria-label="KhetSetu home">
      <span className="brand-mark">
        <Sprout size={26} />
      </span>
      <span>
        Khet<span>Setu</span>
        <small>{tagline}</small>
      </span>
    </a>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="select-wrap">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
      <ChevronDown size={16} />
    </div>
  );
}

export default function PilotApp() {
  const [route, setRoute] = useState(location.hash.replace('#', '') || 'home');
  const [kind, setKind] = useState<Kind>('buyer');
  const [lang, setLang] = useState<Language>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [policy, setPolicy] = useState<'privacy' | 'terms' | null>(() => {
    if (location.pathname.endsWith('/privacy')) return 'privacy';
    if (location.pathname.endsWith('/terms')) return 'terms';
    return null;
  });
  const [online, setOnline] = useState(navigator.onLine);
  const [backendMode, setBackendMode] = useState<BackendMode>('api');
  const [receipts, setReceipts] = useState<ReceiptKey[]>(getSavedReceipts);
  const [prefill, setPrefill] = useState<ProducePrefill | null>(null);

  const t = pilotCopy[lang];

  useEffect(() => {
    void detectBackendMode().then(setBackendMode);
  }, []);

  useEffect(() => {
    const onHash = () => {
      const next = location.hash.replace('#', '') || 'home';
      if (next === 'privacy') {
        setPolicy('privacy');
        return;
      }
      if (next === 'terms') {
        setPolicy('terms');
        return;
      }
      setRoute(next);
      setMenuOpen(false);
    };
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener('hashchange', onHash);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (['home', 'catalogue', 'request', 'support', 'how-it-works', 'faq'].includes(route)) {
      document.getElementById(route)?.scrollIntoView({ block: 'start' });
    } else if (['operations', 'track'].includes(route)) {
      window.scrollTo({ top: 0 });
    }
  }, [route]);

  function openRequestForm(nextKind: Kind, chosen?: ProducePrefill) {
    if (chosen) setPrefill(chosen);
    setKind(nextKind);
    location.hash = 'request';
    setTimeout(() => {
      document.getElementById('request')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  }

  function saveReceipt(row: ReceiptKey) {
    setReceipts((current) => persistReceipt(row, current));
  }

  function closePolicy() {
    setPolicy(null);
    if (location.hash === '#privacy' || location.hash === '#terms') {
      history.replaceState({}, '', `${location.pathname}#home`);
    } else if (location.pathname.endsWith('/privacy') || location.pathname.endsWith('/terms')) {
      history.replaceState({}, '', `/${location.hash}`);
    }
  }

  const principleIcons = [Scale, ShieldCheck, Truck];
  const stepIcons = [ClipboardList, Scale, Truck];

  return (
    <div className="pilot-app">
      <a href="#main" className="skip-link">
        {t.skipToContent}
      </a>

      <div className="pilot-strip">
        <MapPin size={14} />
        <span>{t.topBannerText}</span>
        <strong>{t.topBannerBadge}</strong>
      </div>

      {backendMode === 'static' && (
        <div className="static-strip" role="note">
          <span>{t.staticBanner}</span>
        </div>
      )}

      <header className="header">
        <div className="shell header-inner">
          <Brand tagline={t.brandTagline} />

          <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Main navigation">
            <button type="button" onClick={() => openRequestForm('buyer')}>
              {t.navBuy}
            </button>
            <button type="button" onClick={() => openRequestForm('farmer')}>
              {t.navSell}
            </button>
            <a href="#catalogue" onClick={() => setMenuOpen(false)}>
              {t.navCatalogue}
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              {t.navHowItWorks}
            </a>
            <a href="#support" onClick={() => setMenuOpen(false)}>
              {t.navSupport}
            </a>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="lang-button"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              aria-label={t.langAriaLabel}
            >
              <Globe size={17} />
              {t.langButton}
            </button>
            <a className="text-link tracking-nav" href="#track">
              {t.trackRequest}
            </a>
            <button
              type="button"
              className="button primary header-cta"
              onClick={() => openRequestForm('buyer')}
            >
              {t.getQuote}
            </button>
            <button
              type="button"
              className="mobile-menu icon-button"
              aria-label={menuOpen ? t.closeMenu : t.openMenu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {!online && (
        <div className="offline" role="status">
          {t.offlineBanner}
        </div>
      )}

      <main id="main">
        {route === 'operations' ? (
          <Operations t={t} lang={lang} backendMode={backendMode} />
        ) : route === 'track' ? (
          <Tracking receipts={receipts} t={t} lang={lang} />
        ) : (
          <>
            <section className="hero shell" id="home">
              <div className="hero-copy">
                <span className="eyebrow">
                  <span className="tiny-leaf">
                    <Leaf size={14} />
                  </span>
                  {t.heroEyebrow}
                </span>
                <h1>
                  {t.heroTitleLine1}
                  <br />
                  <em>{t.heroTitleLine2}</em>
                </h1>
                <p className="hero-description">{t.heroDescription}</p>
                <div className="hero-buttons">
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => openRequestForm('buyer')}
                  >
                    {t.heroBuyerCta}
                  </button>
                  <button
                    type="button"
                    className="button outline"
                    onClick={() => openRequestForm('farmer')}
                  >
                    {t.heroFarmerCta}
                  </button>
                </div>
                <div className="hero-note">
                  <Check size={16} />
                  <span>{t.heroNote}</span>
                </div>
              </div>

              <div className="hero-visual" aria-label={t.heroVisualAria}>
                <div className="visual-top">
                  <span>{t.heroVisualTop}</span>
                  <Sprout size={25} />
                </div>
                <div className="crop-art">
                  <img src="./produce.svg" alt={t.cropAlt} />
                  <span className="crop-orbit orbit-one">
                    <Leaf size={20} /> {t.orbitFarm}
                  </span>
                  <span className="crop-orbit orbit-two">
                    <Store size={20} /> {t.orbitBusiness}
                  </span>
                </div>
                <div className="visual-bottom">
                  <div>
                    <small>{t.heroVisualLabel}</small>
                    <strong>{t.heroVisualRegion}</strong>
                  </div>
                  <span className="location-seal">
                    <MapPin size={22} />
                  </span>
                </div>
              </div>
            </section>

            <section className="principles shell" aria-label={t.principlesAria}>
              {t.principles.map(([title, subtitle], idx) => {
                const Icon = principleIcons[idx]!;
                return (
                  <div key={title}>
                    <Icon />
                    <span>
                      <strong>{title}</strong>
                      <small>{subtitle}</small>
                    </span>
                  </div>
                );
              })}
            </section>

            <section className="section shell audience-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">{t.audienceEyebrow}</span>
                  <h2>
                    {t.audienceTitleLine1}
                    <br />
                    {t.audienceTitleLine2}
                  </h2>
                </div>
                <p>{t.audienceLead}</p>
              </div>

              <div className="audience-grid">
                <article className="audience-card buyer-card">
                  <span className="card-icon">
                    <Store />
                  </span>
                  <span className="eyebrow">{t.buyerEyebrow}</span>
                  <h3>{t.buyerTitle}</h3>
                  <p>{t.buyerBody}</p>
                  <ul>
                    {t.buyerBullets.map((item) => (
                      <li key={item}>
                        <Check />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => openRequestForm('buyer')}
                  >
                    {t.buyerCta}
                  </button>
                </article>

                <article className="audience-card farmer-card">
                  <span className="card-icon">
                    <Sprout />
                  </span>
                  <span className="eyebrow">{t.farmerEyebrow}</span>
                  <h3>{t.farmerTitle}</h3>
                  <p>{t.farmerBody}</p>
                  <ul>
                    {t.farmerBullets.map((item) => (
                      <li key={item}>
                        <Check />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="button outline"
                    onClick={() => openRequestForm('farmer')}
                  >
                    {t.farmerCta}
                  </button>
                </article>
              </div>
            </section>

            <section className="how-section" id="how-it-works">
              <div className="shell section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">{t.howEyebrow}</span>
                    <h2>
                      {t.howTitleLine1}
                      <br />
                      {t.howTitleLine2}
                    </h2>
                  </div>
                  <p>{t.howLead}</p>
                </div>

                <div className="steps">
                  {t.howSteps.map(([title, description], idx) => {
                    const Icon = stepIcons[idx]!;
                    return (
                      <article key={title}>
                        <span className="step-icon">
                          <Icon />
                        </span>
                        <h3>{title}</h3>
                        <p>{description}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            <ProduceCatalogue
              t={t}
              lang={lang}
              onSelect={(nextKind, item) => openRequestForm(nextKind, item)}
            />

            <section className="section shell intake-section" id="request">
              <div className="intake-intro">
                <span className="eyebrow">{t.intakeEyebrow}</span>
                <h2>{t.intakeTitle}</h2>
                <p>{t.intakeBody}</p>

                <div className="pilot-area">
                  <MapPin />
                  <div>
                    <strong>{t.intakePinTitle}</strong>
                    <p>{t.intakePinBody}</p>
                  </div>
                </div>

                <div className="contact-mini">
                  <span>{t.preferPhone}</span>
                  <a href="tel:+917021610641">
                    <Phone size={17} />
                    +91 70216 10641
                  </a>
                  <a href="mailto:redantthakur@gmail.com">
                    <Mail size={17} />
                    redantthakur@gmail.com
                  </a>
                </div>

                <p className="quiet-note">{t.intakeDisclaimer}</p>
              </div>

              <Intake
                kind={kind}
                setKind={setKind}
                t={t}
                backendMode={backendMode}
                saveReceipt={saveReceipt}
                showPrivacy={() => setPolicy('privacy')}
                prefill={prefill}
                clearPrefill={() => setPrefill(null)}
              />
            </section>

            <section className="faq-section shell section" id="faq">
              <div>
                <span className="eyebrow">{t.faqEyebrow}</span>
                <h2>{t.faqTitle}</h2>
                <p className="muted">{t.faqLead}</p>
              </div>
              <div className="faq-list">
                {t.faqs.map(([question, answer]) => (
                  <details key={question}>
                    <summary>
                      <span>{question}</span>
                      <Plus size={19} />
                    </summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="support-band" id="support">
              <div className="shell">
                <div>
                  <span className="eyebrow">{t.supportEyebrow}</span>
                  <h2>{t.supportTitle}</h2>
                  <p>{t.supportBody}</p>
                </div>
                <div className="support-links">
                  <a
                    className="button light"
                    href="https://wa.me/917021610641"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Phone size={18} />
                    {t.whatsappCta}
                  </a>
                  <a href="mailto:redantthakur@gmail.com">redantthakur@gmail.com</a>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="footer shell">
        <div>
          <Brand tagline={t.brandTagline} />
          <p>{t.footerTagline}</p>
        </div>

        <div className="footer-links">
          <a href="#track">{t.footerTrack}</a>
          <a
            href="#privacy"
            onClick={(e) => {
              e.preventDefault();
              setPolicy('privacy');
            }}
          >
            {t.footerPrivacy}
          </a>
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              setPolicy('terms');
            }}
          >
            {t.footerTerms}
          </a>
          <a href="#operations">
            <LockKeyhole size={14} />
            {t.footerOperations}
          </a>
        </div>

        <small>
          © {new Date().getFullYear()} {t.footerRights}
        </small>
      </footer>

      {policy && <PolicyModal kind={policy} t={t} close={closePolicy} />}
    </div>
  );
}

function Intake({
  kind,
  setKind,
  t,
  backendMode,
  saveReceipt,
  showPrivacy,
  prefill,
  clearPrefill,
}: {
  kind: Kind;
  setKind: (kind: Kind) => void;
  t: Copy;
  backendMode: BackendMode;
  saveReceipt: (key: ReceiptKey) => void;
  showPrivacy: () => void;
  prefill: ProducePrefill | null;
  clearPrefill: () => void;
}) {
  const emptyForm = (nextKind: Kind): FormState => ({
    name: '',
    phone: '',
    businessName: '',
    businessType: nextKind === 'farmer' ? 'farmer' : 'retailer',
    pin: '',
    produce: '',
    quantity: '',
    unit: 'kg',
    grade: 'A',
    neededBy: '',
    frequency: 'once',
    notes: '',
    website: '',
    consent: false,
  });

  const [form, setForm] = useState<FormState>(() => emptyForm(kind));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<SubmittedSummary | null>(null);
  const attempt = useRef<{ key: string; secret: string; body: Record<string, unknown> } | null>(
    null,
  );
  const kindRef = useRef(kind);

  useEffect(() => {
    if (kindRef.current !== kind) {
      kindRef.current = kind;
      setForm((prev) => ({
        ...emptyForm(kind),
        ...(prefill
          ? {
              produce: prefill.produce,
              unit: prefill.unit,
              quantity: prefill.quantity,
            }
          : prev.produce
            ? { produce: prev.produce, unit: prev.unit, quantity: prev.quantity }
            : {}),
      }));
      setError('');
      setSuccess(null);
      attempt.current = null;
    }
  }, [kind, prefill]);

  useEffect(() => {
    if (!prefill) return;
    setForm((prev) => ({
      ...prev,
      produce: prefill.produce,
      unit: prefill.unit,
      quantity: prev.quantity || prefill.quantity,
    }));
    setSuccess(null);
    setError('');
    attempt.current = null;
  }, [prefill]);

  function updateField<K extends keyof FormState>(name: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    attempt.current = null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');

    if (!hasIndianPinFormat(form.pin)) {
      setError(t.invalidPinError);
      return;
    }
    if (!navigator.onLine) {
      setError(t.offlineSubmitError);
      return;
    }

    const domDate = String(new window.FormData(event.currentTarget).get('neededBy') ?? '');
    const neededBy = form.neededBy || domDate;

    if (!attempt.current || attempt.current.body.neededBy !== neededBy) {
      const creds = createReceiptCredentials();
      attempt.current = {
        key: creds.idempotencyKey,
        secret: creds.receiptSecret,
        body: {
          ...form,
          neededBy,
          kind,
          quantity: Number(form.quantity),
          receiptSecret: creds.receiptSecret,
        },
      };
    }

    const current = attempt.current;
    setBusy(true);
    try {
      const saved = await submitPilotRequest(current.body, current.key);
      const receipt: ReceiptKey = {
        id: saved.id,
        reference: saved.reference,
        secret: current.secret,
      };
      saveReceipt(receipt);
      setSuccess({
        ...receipt,
        kind,
        produce: form.produce,
        quantity: form.quantity,
        unit: form.unit,
        grade: form.grade,
        pin: form.pin,
        neededBy,
        name: form.name,
        phone: form.phone,
      });
      setForm(emptyForm(kind));
      attempt.current = null;
    } catch (err) {
      setError(`${(err as Error).message} ${t.retrySuffix}`);
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="intake-card success-card">
        <span className="success-icon">
          <CheckCircle2 size={36} />
        </span>
        <span className="eyebrow">{t.successEyebrow}</span>
        <h3>{t.successTitle}</h3>
        <p>{t.successBody}</p>
        <div className="reference-box">
          <small>{t.referenceLabel}</small>
          <strong>{success.reference}</strong>
        </div>
        <p className="muted">
          {backendMode === 'static' ? t.successHintStatic : t.successHintBrowser}
        </p>

        {backendMode === 'static' && (
          <div className="success-actions">
            <a
              className="button whatsapp full"
              href={buildWhatsappInquiryUrl(success)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              {t.sendViaWhatsapp}
            </a>
            <a className="button outline full" href={buildEmailInquiryUrl(success)}>
              <Mail size={18} />
              {t.sendViaEmail}
            </a>
          </div>
        )}

        <a className="button primary full" href="#track">
          {t.trackThisRequest}
        </a>
        <button
          type="button"
          className="button outline full"
          onClick={() => setSuccess(null)}
        >
          {t.submitAnother}
        </button>
      </div>
    );
  }

  return (
    <div className="intake-card">
      <div className="kind-tabs" role="tablist" aria-label="Request type">
        <button
          type="button"
          role="tab"
          aria-selected={kind === 'buyer'}
          onClick={() => setKind('buyer')}
          className={kind === 'buyer' ? 'active' : ''}
        >
          <Store size={19} />
          {t.tabBuy}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={kind === 'farmer'}
          onClick={() => setKind('farmer')}
          className={kind === 'farmer' ? 'active' : ''}
        >
          <Sprout size={19} />
          {t.tabSell}
        </button>
      </div>

      <div className="form-heading">
        <h3>{kind === 'buyer' ? t.formHeadingBuyer : t.formHeadingFarmer}</h3>
        <p>{t.requiredHint}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={busy}>
          <div className="form-grid">
            <label>
              {t.labelName} *
              <input
                required
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder={t.placeholderName}
              />
            </label>

            <label>
              {t.labelPhone} *
              <div className="phone-input">
                <span>+91</span>
                <input
                  required
                  name="phone"
                  type="tel"
                  autoComplete="tel-national"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                  placeholder={t.placeholderPhone}
                />
              </div>
            </label>
          </div>

          <div className="form-grid">
            <label>
              {kind === 'farmer' ? t.labelOrgFarmer : t.labelOrgBuyer}
              <input
                maxLength={120}
                autoComplete="organization"
                value={form.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                placeholder={
                  kind === 'farmer' ? t.placeholderOrgFarmer : t.placeholderOrgBuyer
                }
              />
            </label>

            <label>
              {kind === 'farmer' ? t.labelTypeFarmer : t.labelTypeBuyer} *
              <Select
                value={form.businessType}
                onChange={(v) => updateField('businessType', v)}
              >
                {kind === 'farmer'
                  ? (['farmer', 'fpo', 'other'] as const).map((key) => (
                      <option key={key} value={key}>
                        {t.farmerTypes[key]}
                      </option>
                    ))
                  : (['retailer', 'wholesaler', 'restaurant', 'caterer', 'other'] as const).map(
                      (key) => (
                        <option key={key} value={key}>
                          {t.buyerTypes[key]}
                        </option>
                      ),
                    )}
              </Select>
            </label>
          </div>

          <label>
            {kind === 'buyer' ? t.labelPinBuyer : t.labelPinFarmer} *
            <input
              required
              name="pin"
              autoComplete="postal-code"
              inputMode="numeric"
              pattern={INDIAN_PIN_PATTERN}
              maxLength={6}
              value={form.pin}
              onChange={(e) => updateField('pin', e.target.value.replace(/\D/g, ''))}
              placeholder={t.placeholderPin}
              aria-describedby="pin-help"
            />
            <small id="pin-help">
              {kind === 'buyer' ? t.pinHelpBuyer : t.pinHelpFarmer}
            </small>
          </label>

          {prefill && (
            <div className="prefill-pill" role="status">
              <span>{t.catalogueSelectedNotice(prefill.label)}</span>
              <button
                type="button"
                className="inline-link"
                onClick={() => {
                  clearPrefill();
                  updateField('produce', '');
                }}
              >
                {t.catalogueClearSelection}
              </button>
            </div>
          )}

          <label>
            {t.labelProduce} *
            <input
              required
              list="produce-options"
              maxLength={120}
              minLength={2}
              value={form.produce}
              onChange={(e) => updateField('produce', e.target.value)}
              placeholder={t.placeholderProduce}
            />
            <datalist id="produce-options">
              {produceCatalog.map((item) => (
                <option
                  key={item.id}
                  value={`${item.name} — ${item.varieties[0]}`}
                  label={`${item.nameHi} · ${item.category}`}
                />
              ))}
            </datalist>
          </label>

          <div className="form-grid three">
            <label>
              {t.labelQuantity} *
              <input
                required
                type="number"
                min="0.001"
                max="1000000"
                step="0.001"
                inputMode="decimal"
                value={form.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
                placeholder={t.placeholderQuantity}
              />
            </label>

            <label>
              {t.labelUnit} *
              <Select value={form.unit} onChange={(v) => updateField('unit', v)}>
                {(['kg', 'quintal', 'tonne', 'crate', 'box'] as const).map((u) => (
                  <option key={u} value={u}>
                    {t.units[u]}
                  </option>
                ))}
              </Select>
            </label>

            <label>
              {t.labelGrade} *
              <Select value={form.grade} onChange={(v) => updateField('grade', v)}>
                {(['A', 'B', 'mixed'] as const).map((g) => (
                  <option key={g} value={g}>
                    {t.grades[g]}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              {kind === 'buyer' ? t.labelNeededBy : t.labelAvailableFrom} *
              <input
                required
                type="date"
                key={kind}
                name="neededBy"
                min={indiaToday()}
                value={form.neededBy}
                onChange={(e) => updateField('neededBy', e.target.value)}
              />
            </label>

            <label>
              {t.labelFrequency} *
              <Select value={form.frequency} onChange={(v) => updateField('frequency', v)}>
                {(['once', 'daily', 'weekly'] as const).map((freq) => (
                  <option key={freq} value={freq}>
                    {t.frequencies[freq]}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <label>
            {t.labelNotes}
            <textarea
              rows={3}
              maxLength={1000}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder={t.placeholderNotes}
            />
          </label>

          <div className="honey" aria-hidden="true">
            <label>
              {t.honeypotLabel}
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => updateField('website', e.target.value)}
              />
            </label>
          </div>

          <label className="check-label">
            <input
              required
              type="checkbox"
              checked={form.consent}
              onChange={(e) => updateField('consent', e.target.checked)}
            />
            <span>
              {t.consentPrefix}{' '}
              <button type="button" className="inline-link" onClick={showPrivacy}>
                {t.consentPrivacyLink}
              </button>
              .
            </span>
          </label>

          {error && <Notice danger>{error}</Notice>}

          <button type="submit" className="button primary full" disabled={busy}>
            {busy ? (
              <>
                <LoaderCircle size={18} className="spin" />
                {t.submitting}
              </>
            ) : kind === 'buyer' ? (
              t.submitBuyer
            ) : (
              t.submitFarmer
            )}
          </button>

          <p className="form-note">
            <LockKeyhole size={13} />
            <span>{t.formSecurityNote}</span>
          </p>
        </fieldset>
      </form>
    </div>
  );
}

function Tracking({
  receipts,
  t,
  lang,
}: {
  receipts: ReceiptKey[];
  t: Copy;
  lang: Language;
}) {
  const [selected, setSelected] = useState<ReceiptKey | null>(receipts[0] || null);
  const [row, setRow] = useState<RecordRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  async function load(key = selected) {
    if (!key) return;
    setBusy(true);
    setError('');
    try {
      setRow(await fetchReceipt(key));
    } catch (err) {
      setError((err as Error).message);
      setRow(null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!selected && receipts.length > 0) {
      setSelected(receipts[0]!);
    }
  }, [receipts, selected]);

  useEffect(() => {
    void load();
    setConfirmWithdraw(false);
  }, [selected?.id]);

  async function handleWithdraw() {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      await withdrawPilotReceipt(selected);
      setConfirmWithdraw(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="shell section workspace">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">{t.trackEyebrow}</span>
          <h1>{t.trackTitle}</h1>
          <p>{t.trackLead}</p>
        </div>
        <a href="#request" className="button outline">
          {t.newRequest}
        </a>
      </div>

      {!receipts.length ? (
        <div className="empty-state">
          <ClipboardList size={38} />
          <h2>{t.trackEmptyTitle}</h2>
          <p>{t.trackEmptyBody}</p>
          <a className="button primary" href="#request">
            {t.startRequest}
          </a>
          <a href="tel:+917021610641">{t.callSupport}</a>
        </div>
      ) : (
        <div className="workspace-grid">
          <aside className="request-list" aria-label={t.savedListAria}>
            {receipts.map((key) => (
              <button
                type="button"
                className={selected?.id === key.id ? 'selected' : ''}
                key={key.id}
                onClick={() => {
                  setSelected(key);
                  setRow(null);
                }}
              >
                <ClipboardList size={20} />
                <span>
                  <strong>{key.reference}</strong>
                  <small>{t.viewPrivateStatus}</small>
                </span>
              </button>
            ))}
          </aside>

          <div className="detail-card">
            {error && <Notice danger>{error}</Notice>}
            {busy && !row ? (
              <div className="loading">
                <LoaderCircle className="spin" />
                {t.loadingRequest}
              </div>
            ) : row ? (
              <>
                <div className="detail-heading">
                  <div>
                    <span className="eyebrow">{row.reference}</span>
                    <h2>{row.produce}</h2>
                  </div>
                  <span className={`status status-${row.status}`}>
                    {t.statuses[row.status] ?? row.status}
                  </span>
                </div>

                <div className="detail-meta">
                  <span>
                    <Package />
                    {row.quantity} {row.unit} · {t.gradeLabel} {row.grade}
                  </span>
                  <span>
                    <MapPin />
                    {t.pinPrefix} {row.pin}
                  </span>
                  <span>
                    <FileText />
                    {t.submittedPrefix} {formatDate(row.createdAt, lang)}
                  </span>
                </div>

                <div className="customer-update">
                  <h3>{t.latestUpdateTitle}</h3>
                  <p>{row.customerUpdate || t.defaultUpdateText}</p>
                </div>

                <h3>{t.quotesSectionTitle}</h3>
                {row.quotes?.length ? (
                  <QuoteCards quotes={row.quotes} selected={row.selectedQuoteId} t={t} />
                ) : (
                  <p className="muted">{t.noQuotesYet}</p>
                )}

                <p className="quiet-note">{t.quoteDisclaimer}</p>

                <div className="detail-actions">
                  <button
                    type="button"
                    className="button outline"
                    disabled={busy}
                    onClick={() => void load()}
                  >
                    <RefreshCw size={17} />
                    {t.refreshStatus}
                  </button>
                  <a
                    className="button outline"
                    href={`https://wa.me/917021610641?text=${encodeURIComponent(
                      `${t.whatsappHelpPrefix} ${row.reference}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.contactSupport}
                  </a>
                  {row.status !== 'withdrawn' && (
                    <button
                      type="button"
                      className="text-danger"
                      disabled={busy}
                      onClick={() => setConfirmWithdraw(true)}
                    >
                      {t.withdrawButton}
                    </button>
                  )}
                </div>

                {confirmWithdraw && (
                  <div className="confirm-panel" role="alert">
                    <strong>{t.withdrawConfirmTitle}</strong>
                    <p>{t.withdrawConfirmBody}</p>
                    <div>
                      <button
                        type="button"
                        className="button danger-button"
                        disabled={busy}
                        onClick={() => void handleWithdraw()}
                      >
                        {t.withdrawConfirmAction}
                      </button>
                      <button
                        type="button"
                        className="button outline"
                        onClick={() => setConfirmWithdraw(false)}
                      >
                        {t.withdrawCancelAction}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

function QuoteCards({
  quotes,
  selected,
  choose,
  busy = false,
  t,
}: {
  quotes: Quote[];
  selected?: string;
  choose?: (id: string) => void;
  busy?: boolean;
  t: Copy;
}) {
  const comparable = (a: Quote, b: Quote) =>
    a.quantity === b.quantity && a.unit === b.unit && a.grade === b.grade;
  const today = indiaToday();

  return (
    <div className="quote-cards">
      {quotes.map((q) => {
        const active = q.validUntil >= today;
        const peers = quotes.filter((p) => comparable(p, q) && p.validUntil >= today);
        const lowest =
          active &&
          peers.length > 1 &&
          q.totalPaise === Math.min(...peers.map((p) => p.totalPaise));

        return (
          <article
            className={`quote-card ${selected === q.id ? 'chosen' : ''}`}
            key={q.id}
          >
            <div className="quote-title">
              <h4>{q.supplierName}</h4>
              {selected === q.id ? (
                <span className="status status-confirmed">{t.quoteAgreedBadge}</span>
              ) : lowest ? (
                <span className="quote-tag">{t.quoteLowestBadge}</span>
              ) : null}
            </div>

            <p>
              {q.quantity} {q.unit} · {t.gradeLabel} {q.grade} · {t.quoteValidThrough}{' '}
              {q.validUntil}
            </p>

            <strong className="quote-total">
              {formatInr(q.totalPaise)} <small>{t.quoteTotalSuffix}</small>
            </strong>

            <dl>
              <div>
                <dt>{t.quoteProduce}</dt>
                <dd>
                  {formatInr(q.unitPricePaise)} / {q.unit}
                </dd>
              </div>
              <div>
                <dt>{t.quoteDelivery}</dt>
                <dd>{formatInr(q.deliveryPaise)}</dd>
              </div>
              <div>
                <dt>{t.quotePacking}</dt>
                <dd>{formatInr(q.packingPaise)}</dd>
              </div>
              <div>
                <dt>{t.quoteFees}</dt>
                <dd>{formatInr(q.feePaise)}</dd>
              </div>
              <div className="effective">
                <dt>{t.quoteEffectiveCost}</dt>
                <dd>
                  {formatInr(q.totalPaise / q.quantity)} / {q.unit}
                </dd>
              </div>
            </dl>

            {q.notes && <p>{q.notes}</p>}
            {!active && <span className="status status-cancelled">{t.quoteExpiredBadge}</span>}
            {choose && (
              <button
                type="button"
                className="button outline full"
                disabled={busy || !active || Boolean(selected)}
                onClick={() => choose(q.id)}
              >
                {selected === q.id ? t.quoteSelectedButton : t.quoteSelectButton}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Operations({
  t,
  backendMode,
}: {
  t: Copy;
  lang: Language;
  backendMode: BackendMode;
}) {
  const [session, setSession] = useState<{
    authenticated: boolean;
    admin: boolean;
    mode: BackendMode;
  } | null>(null);
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  async function load() {
    setBusy(true);
    setError('');
    try {
      const identity = await fetchAdminSession();
      setSession(identity);
      if (identity.admin) {
        setRows(await fetchAdminRequests());
      } else {
        setRows([]);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, [backendMode]);

  const selectedRow = rows.find((r) => r.id === selectedId);
  const visible = rows.filter(
    (r) =>
      (filter === 'all' || r.status === filter) &&
      `${r.reference} ${r.produce} ${r.name} ${r.businessName} ${r.phone} ${r.pin}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  function exportCsv() {
    const escape = (v: unknown) =>
      `"${String(v ?? '')
        .replace(/^\s*[=+\-@]/, "'")
        .replaceAll('"', '""')}"`;
    const keys: (keyof RecordRow)[] = [
      'reference',
      'kind',
      'name',
      'phone',
      'businessName',
      'produce',
      'quantity',
      'unit',
      'grade',
      'pin',
      'neededBy',
      'frequency',
      'status',
      'createdAt',
    ];
    const csv = [
      keys.join(','),
      ...visible.map((r) => keys.map((k) => escape(r[k])).join(',')),
    ].join('\r\n');
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `KhetSetu-requests-${indiaToday()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const localPreview = isLocalPreviewHost();

  return (
    <section className="shell section workspace">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">
            <LockKeyhole size={14} />
            {t.opsEyebrow}
          </span>
          <h1>{t.opsTitle}</h1>
          <p>{t.opsLead}</p>
        </div>
        <div className="ops-header-actions">
          {session?.admin && backendMode === 'static' && (
            <button
              type="button"
              className="button outline"
              onClick={() => {
                setStaticOpsUnlocked(false);
                void load();
              }}
            >
              {t.opsSignOut}
            </button>
          )}
          {session?.admin && backendMode === 'api' && localPreview && (
            <a className="button outline" href="/__local/signout">
              {t.opsSignOut}
            </a>
          )}
          <button
            type="button"
            className="button outline"
            onClick={() => void load()}
            disabled={busy}
          >
            <RefreshCw size={17} className={busy ? 'spin' : ''} />
            {t.opsRefresh}
          </button>
        </div>
      </div>

      {error && <Notice danger>{error}</Notice>}

      {!session && busy ? (
        <div className="loading">
          <LoaderCircle className="spin" />
          {t.opsCheckingAccess}
        </div>
      ) : !session?.admin ? (
        <div className="empty-state">
          <LockKeyhole size={38} />
          <h2>{t.opsAccessRequiredTitle}</h2>
          {backendMode === 'static' ? (
            <>
              <p>{t.opsStaticAuthBody}</p>
              <button
                type="button"
                className="button primary"
                onClick={() => {
                  setStaticOpsUnlocked(true);
                  void load();
                }}
              >
                {t.opsStaticAuthCta}
              </button>
            </>
          ) : localPreview ? (
            <>
              <p>{t.opsLocalAuthBody}</p>
              <a className="button primary" href="/__local/signin">
                {t.opsLocalAuthCta}
              </a>
            </>
          ) : (
            <p>{t.opsWorkerAuthBody}</p>
          )}
          <a href="#home">{t.opsBackHome}</a>
        </div>
      ) : (
        <>
          <div className="ops-stats">
            <div>
              <strong>{rows.filter((r) => r.status === 'new').length}</strong>
              <span>{t.opsStatsNew}</span>
            </div>
            <div>
              <strong>
                {
                  rows.filter(
                    (r) =>
                      r.kind === 'buyer' &&
                      !['cancelled', 'fulfilled', 'withdrawn', 'expired'].includes(r.status),
                  ).length
                }
              </strong>
              <span>{t.opsStatsBuyers}</span>
            </div>
            <div>
              <strong>
                {
                  rows.filter(
                    (r) =>
                      r.kind === 'farmer' &&
                      !['cancelled', 'fulfilled', 'withdrawn', 'expired'].includes(r.status),
                  ).length
                }
              </strong>
              <span>{t.opsStatsFarmers}</span>
            </div>
            <div>
              <strong>{rows.filter((r) => r.status === 'fulfilled').length}</strong>
              <span>{t.opsStatsFulfilled}</span>
            </div>
          </div>

          <div className="ops-toolbar">
            <label className="search-field">
              <Search size={18} />
              <input
                aria-label={t.opsSearchAria}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.opsSearchPlaceholder}
              />
            </label>

            <label className="filter-label">
              <span>{t.opsFilterLabel}</span>
              <Select value={filter} onChange={setFilter}>
                <option value="all">{t.opsAllStatuses}</option>
                {[...ALL_STATUSES, 'withdrawn', 'expired'].map((s) => (
                  <option key={s} value={s}>
                    {t.statuses[s] ?? s}
                  </option>
                ))}
              </Select>
            </label>

            <button type="button" className="button outline" onClick={exportCsv}>
              <Download size={17} />
              {t.opsExportRows(visible.length)}
            </button>
          </div>

          <p className="quiet-note">{t.opsLimitNote}</p>

          <div className="ops-grid">
            <div className="ops-list">
              {!visible.length ? (
                <div className="empty-state compact">
                  <ClipboardList />
                  <h3>{t.opsEmptyListTitle}</h3>
                  <p>{t.opsEmptyListBody}</p>
                </div>
              ) : (
                visible.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={r.id === selectedId ? 'selected' : ''}
                  >
                    <div className="list-row-top">
                      <span className={`kind-label ${r.kind}`}>
                        {r.kind === 'buyer' ? t.opsBuyingTag : t.opsSupplyTag}
                      </span>
                      <small>{r.reference}</small>
                    </div>
                    <strong>{r.produce}</strong>
                    <span>
                      {r.quantity} {r.unit} · {t.gradeLabel} {r.grade}
                    </span>
                    <div className="list-row-bottom">
                      <span>{r.businessName || r.name || t.opsContactRemoved}</span>
                      <span className={`status status-${r.status}`}>
                        {t.statuses[r.status] ?? r.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div>
              {selectedRow ? (
                <OperationDetail
                  key={`${selectedRow.id}:${selectedRow.version}`}
                  row={selectedRow}
                  refresh={load}
                  t={t}
                />
              ) : (
                <div className="detail-card empty-state">
                  <Leaf size={36} />
                  <h2>{t.opsSelectPromptTitle}</h2>
                  <p>{t.opsSelectPromptBody}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function OperationDetail({
  row,
  refresh,
  t,
}: {
  row: RecordRow;
  refresh: () => Promise<void>;
  t: Copy;
}) {
  const [status, setStatus] = useState<Status>(row.status);
  const [customerUpdate, setCustomerUpdate] = useState(row.customerUpdate || '');
  const [internalNotes, setInternalNotes] = useState(row.internalNotes || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [showQuote, setShowQuote] = useState(false);

  const [quote, setQuote] = useState({
    supplierName: '',
    quantity: String(row.quantity),
    unit: row.unit,
    unitPrice: '',
    delivery: '0',
    packing: '0',
    fee: '0',
    grade: row.grade,
    validUntil: indiaToday(),
    notes: '',
  });

  const terminal = ['fulfilled', 'cancelled', 'withdrawn', 'expired'].includes(row.status);
  const possible: Record<string, Status[]> = {
    new: ['new', 'reviewing', 'cancelled'],
    reviewing: ['reviewing', 'quoted', 'confirmed', 'cancelled'],
    quoted: ['quoted', 'reviewing', 'confirmed', 'cancelled'],
    confirmed: ['confirmed', 'fulfilled', 'cancelled'],
    fulfilled: ['fulfilled'],
    cancelled: ['cancelled'],
    withdrawn: ['withdrawn'],
    expired: ['expired'],
  };

  async function mutate(
    action: 'update' | 'add-quote' | 'select-quote',
    body: Record<string, unknown>,
  ) {
    setBusy(true);
    setError('');
    setSaved('');
    try {
      await mutateAdminRequest(row.id, action, body);
      await refresh();
      setSaved(t.opsSavedNotice);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAddQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const domDate = String(new window.FormData(event.currentTarget).get('validUntil') ?? '');
    const validUntil = quote.validUntil || domDate;

    await mutate('add-quote', {
      version: row.version,
      supplierName: quote.supplierName,
      quantity: Number(quote.quantity),
      unit: quote.unit,
      unitPricePaise: Math.round(Number(quote.unitPrice) * 100),
      deliveryPaise: Math.round(Number(quote.delivery) * 100),
      packingPaise: Math.round(Number(quote.packing) * 100),
      feePaise: Math.round(Number(quote.fee) * 100),
      grade: quote.grade,
      validUntil,
      notes: quote.notes,
    });
  }

  const previewPaise =
    Math.round(Number(quote.quantity || 0) * Number(quote.unitPrice || 0) * 100) +
    Math.round(
      (Number(quote.delivery || 0) + Number(quote.packing || 0) + Number(quote.fee || 0)) *
        100,
    );

  return (
    <article className="detail-card operation-detail">
      <div className="detail-heading">
        <div>
          <span className="eyebrow">
            {row.reference} · {row.kind === 'buyer' ? t.opsBuyingFull : t.opsSupplyFull}
          </span>
          <h2>{row.produce}</h2>
        </div>
        <span className={`status status-${row.status}`}>
          {t.statuses[row.status] ?? row.status}
        </span>
      </div>

      <div className="detail-meta">
        <span>
          <Package />
          {row.quantity} {row.unit} · {t.gradeLabel} {row.grade}
        </span>
        <span>
          <MapPin />
          {t.pinPrefix} {row.pin}
        </span>
        <span>
          <FileText />
          {row.neededBy} · {row.frequency}
        </span>
      </div>

      <div className="contact-card">
        <div>
          <strong>{row.name || t.opsContactRemoved}</strong>
          <span>
            {row.businessName} {row.businessType && `· ${row.businessType}`}
          </span>
        </div>
        {row.phone && (
          <a href={`tel:+91${row.phone}`}>
            <Phone size={17} />
            {row.phone}
          </a>
        )}
      </div>

      {row.notes && (
        <div className="request-notes">
          <h3>{t.opsCustomerNotes}</h3>
          <p>{row.notes}</p>
        </div>
      )}

      <div className="ops-section">
        <div className="ops-section-heading">
          <h3>{t.opsSupplierQuotes}</h3>
          {!terminal && (
            <button
              type="button"
              className="button small outline"
              onClick={() => setShowQuote(!showQuote)}
            >
              <Plus size={16} />
              {showQuote ? t.opsCloseForm : t.opsAddQuote}
            </button>
          )}
        </div>

        <p className="quiet-note">{t.opsQuoteRuleNote}</p>

        {row.quotes?.length ? (
          <QuoteCards
            quotes={row.quotes}
            selected={row.selectedQuoteId}
            choose={
              !terminal && ['reviewing', 'quoted'].includes(row.status)
                ? (id) => void mutate('select-quote', { version: row.version, quoteId: id })
                : undefined
            }
            busy={busy}
            t={t}
          />
        ) : (
          <p className="muted">{t.opsNoQuotes}</p>
        )}

        {showQuote && !terminal && (
          <form className="quote-form" onSubmit={handleAddQuote}>
            <fieldset disabled={busy}>
              <h4>{t.opsQuoteFormTitle}</h4>

              <label>
                {t.opsSupplierName} *
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={quote.supplierName}
                  onChange={(e) => setQuote({ ...quote, supplierName: e.target.value })}
                />
              </label>

              <div className="form-grid three">
                <label>
                  {t.labelQuantity} *
                  <input
                    required
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={quote.quantity}
                    onChange={(e) => setQuote({ ...quote, quantity: e.target.value })}
                  />
                </label>

                <label>
                  {t.labelUnit}
                  <Select value={quote.unit} onChange={(v) => setQuote({ ...quote, unit: v })}>
                    {(['kg', 'quintal', 'tonne', 'crate', 'box'] as const).map((u) => (
                      <option key={u} value={u}>
                        {t.units[u]}
                      </option>
                    ))}
                  </Select>
                </label>

                <label>
                  {t.labelGrade}
                  <Select value={quote.grade} onChange={(v) => setQuote({ ...quote, grade: v })}>
                    {(['A', 'B', 'mixed'] as const).map((g) => (
                      <option key={g} value={g}>
                        {t.grades[g]}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>

              <div className="form-grid">
                <label>
                  {t.opsQuoteUnitPrice} *
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={quote.unitPrice}
                    onChange={(e) => setQuote({ ...quote, unitPrice: e.target.value })}
                  />
                </label>
                <label>
                  {t.opsQuoteDelivery} *
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={quote.delivery}
                    onChange={(e) => setQuote({ ...quote, delivery: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  {t.opsQuotePacking} *
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={quote.packing}
                    onChange={(e) => setQuote({ ...quote, packing: e.target.value })}
                  />
                </label>
                <label>
                  {t.opsQuoteFees} *
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={quote.fee}
                    onChange={(e) => setQuote({ ...quote, fee: e.target.value })}
                  />
                </label>
              </div>

              <label>
                {t.opsQuoteValidUntil} *
                <input
                  required
                  type="date"
                  name="validUntil"
                  min={indiaToday()}
                  value={quote.validUntil}
                  onChange={(e) => setQuote({ ...quote, validUntil: e.target.value })}
                />
              </label>

              <label>
                {t.opsQuoteNotes}
                <textarea
                  maxLength={1000}
                  rows={3}
                  value={quote.notes}
                  onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
                />
              </label>

              <p className="quote-preview">
                {t.opsQuotedTotal}{' '}
                <strong>{formatInr(Number.isFinite(previewPaise) ? previewPaise : 0)}</strong>
              </p>

              <button className="button primary" type="submit" disabled={busy}>
                {t.opsSaveQuote}
              </button>
            </fieldset>
          </form>
        )}
      </div>

      <form
        className="ops-section"
        onSubmit={(e) => {
          e.preventDefault();
          void mutate('update', {
            version: row.version,
            status,
            customerUpdate,
            internalNotes,
          });
        }}
      >
        <fieldset disabled={busy || row.status === 'withdrawn' || row.status === 'expired'}>
          <h3>{t.opsProgressTitle}</h3>

          <label>
            {t.opsStatusLabel}
            <Select value={status} onChange={(v) => setStatus(v as Status)}>
              {(possible[row.status] || [row.status]).map((s) => (
                <option key={s} value={s}>
                  {t.statuses[s] ?? s}
                </option>
              ))}
            </Select>
          </label>

          <label>
            {t.opsCustomerUpdateLabel}
            <textarea
              rows={3}
              maxLength={1000}
              value={customerUpdate}
              onChange={(e) => setCustomerUpdate(e.target.value)}
              placeholder={t.opsCustomerUpdatePlaceholder}
            />
          </label>

          <label>
            {t.opsInternalNotesLabel}
            <textarea
              rows={3}
              maxLength={2000}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder={t.opsInternalNotesPlaceholder}
            />
          </label>

          <button
            className="button primary"
            disabled={busy || row.status === 'withdrawn' || row.status === 'expired'}
            type="submit"
          >
            {busy ? t.opsSaving : t.opsSaveProgress}
          </button>
        </fieldset>
      </form>

      {error && (
        <Notice danger>
          {error} {t.opsConflictHint}
        </Notice>
      )}
      {saved && <Notice>{saved}</Notice>}
    </article>
  );
}

function PolicyModal({
  kind,
  t,
  close,
}: {
  kind: 'privacy' | 'terms';
  t: Copy;
  close: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const priorFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab' && panel.current) {
        const focusables = Array.from(
          panel.current.querySelectorAll<HTMLElement>('button, a[href]'),
        );
        if (e.shiftKey && document.activeElement === focusables[0]) {
          e.preventDefault();
          focusables.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === focusables.at(-1)) {
          e.preventDefault();
          focusables[0]?.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    panel.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      priorFocus?.focus();
    };
  }, [close]);

  const sections = kind === 'privacy' ? t.privacySections : t.termsSections;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="policy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-title"
        tabIndex={-1}
        ref={panel}
      >
        <button
          type="button"
          className="icon-button modal-close"
          onClick={close}
          aria-label={t.policyCloseAria}
        >
          <X />
        </button>
        <span className="eyebrow">{t.policyEyebrow}</span>
        <h2 id="policy-title">{kind === 'privacy' ? t.privacyTitle : t.termsTitle}</h2>

        <div className="policy-copy">
          {sections.map((section, idx) => (
            <React.Fragment key={idx}>
              {section.heading && <h3>{section.heading}</h3>}
              <p>{section.body}</p>
            </React.Fragment>
          ))}
          <p>
            <a href="mailto:redantthakur@gmail.com">redantthakur@gmail.com</a> ·{' '}
            <a href="tel:+917021610641">+91 70216 10641</a>
          </p>
        </div>

        <button type="button" className="button primary" onClick={close}>
          {t.policyDone}
        </button>
      </div>
    </div>
  );
}

function ProduceCatalogue({
  t,
  lang,
  onSelect,
}: {
  t: Copy;
  lang: Language;
  onSelect: (kind: Kind, prefill: ProducePrefill) => void;
}) {
  const [group, setGroup] = useState('all');
  const [season, setSeason] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const summary = catalogSummaryCounts();
  const matches = filterProduceCatalog(produceCatalog, { group, season, search });
  const showingAll = expanded || Boolean(search.trim()) || group !== 'all' || season !== 'all';
  const visible = showingAll ? matches : matches.slice(0, 12);

  const groupCounts: Record<string, number> = {
    all: produceCatalog.length,
    fruits: summary.fruits,
    vegetables: produceCatalog.filter((i) => i.group === 'vegetables').length,
    gourds: produceCatalog.filter((i) => i.group === 'gourds').length,
    leafy: produceCatalog.filter((i) => i.group === 'leafy').length,
    exotic: produceCatalog.filter((i) => i.group === 'exotic').length,
    staples: summary.staples,
  };

  function iconForGroup(itemGroup: string) {
    if (itemGroup === 'fruits') return <Apple size={18} />;
    if (itemGroup === 'staples') return <Wheat size={18} />;
    if (itemGroup === 'leafy') return <Leaf size={18} />;
    return <Carrot size={18} />;
  }

  return (
    <section className="catalogue-section shell section" id="catalogue">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t.catalogueEyebrow}</span>
          <h2>{t.catalogueTitle}</h2>
        </div>
        <p>{t.catalogueLead}</p>
      </div>

      <div className="catalogue-controls">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            aria-label={t.catalogueSearchAria}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.catalogueSearchPlaceholder}
          />
        </label>

        <label className="filter-label season-filter">
          <span>{t.catalogueSeasonAria}</span>
          <Select value={season} onChange={setSeason}>
            {SEASONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {lang === 'hi' ? opt.hi : opt.en}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="group-pills" role="tablist" aria-label="Produce categories">
        {PRODUCE_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={group === g.id}
            className={group === g.id ? 'group-pill active' : 'group-pill'}
            onClick={() => setGroup(g.id)}
          >
            <span>{lang === 'hi' ? g.hi : g.en}</span>
            <small>{groupCounts[g.id] ?? 0}</small>
          </button>
        ))}
      </div>

      {!visible.length ? (
        <div className="empty-state compact">
          <Sprout size={32} />
          <p>{t.catalogueNoMatches}</p>
          <button
            type="button"
            className="button outline small"
            onClick={() => {
              setGroup('all');
              setSeason('all');
              setSearch('');
            }}
          >
            {t.catalogueResetFilters}
          </button>
        </div>
      ) : (
        <>
          <div className="produce-grid">
            {visible.map((item) => {
              const title = lang === 'hi' ? item.nameHi : item.name;
              const altTitle = lang === 'hi' ? item.name : item.nameHi;
              const seasonLabel =
                SEASONS.find((s) => s.id === item.season)?.[lang === 'hi' ? 'hi' : 'en'] ??
                item.season;

              return (
                <article className="produce-card" key={item.id}>
                  <div className="produce-card-top">
                    <span
                      className="produce-badge"
                      style={{
                        backgroundColor: `${item.accent}18`,
                        color: item.accent,
                      }}
                    >
                      {iconForGroup(item.group)}
                    </span>
                    <span className="season-tag">{seasonLabel}</span>
                  </div>

                  <h3>{title}</h3>
                  <small className="produce-alt">{altTitle}</small>

                  <dl className="produce-meta">
                    <div>
                      <dt>{t.catalogueVarietiesLabel}</dt>
                      <dd>{item.varieties.join(' · ')}</dd>
                    </div>
                    <div>
                      <dt>{t.catalogueOriginsLabel}</dt>
                      <dd>{item.origins.join(', ')}</dd>
                    </div>
                  </dl>

                  <p className="produce-moq">
                    {t.catalogueTypicalUnit(item.typicalMoq, t.units[item.unit as keyof typeof t.units] ?? item.unit)}
                  </p>

                  <div className="produce-actions">
                    <button
                      type="button"
                      className="button primary small"
                      onClick={() =>
                        onSelect('buyer', {
                          id: item.id,
                          label: title,
                          produce: `${item.name} — ${item.varieties[0]}`,
                          unit: item.unit,
                          quantity: String(item.typicalMoq),
                        })
                      }
                    >
                      {t.catalogueBuyCta}
                    </button>
                    <button
                      type="button"
                      className="button outline small"
                      onClick={() =>
                        onSelect('farmer', {
                          id: item.id,
                          label: title,
                          produce: `${item.name} — ${item.varieties[0]}`,
                          unit: item.unit,
                          quantity: String(item.typicalMoq),
                        })
                      }
                    >
                      {t.catalogueSellCta}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {!search.trim() && group === 'all' && season === 'all' && matches.length > 12 && (
            <div className="catalogue-more">
              <button
                type="button"
                className="button outline"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? t.catalogueShowFewer : t.catalogueShowAll(matches.length)}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
