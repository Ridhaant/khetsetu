export type Language = 'en' | 'hi';

export type Copy = {
  skipToContent: string;
  topBannerText: string;
  topBannerBadge: string;
  brandTagline: string;
  navBuy: string;
  navSell: string;
  navHowItWorks: string;
  navSupport: string;
  trackRequest: string;
  getQuote: string;
  langButton: string;
  langAriaLabel: string;
  openMenu: string;
  closeMenu: string;
  offlineBanner: string;
  staticBanner: string;
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  heroBuyerCta: string;
  heroFarmerCta: string;
  heroNote: string;
  heroVisualAria: string;
  heroVisualTop: string;
  cropAlt: string;
  orbitFarm: string;
  orbitBusiness: string;
  heroVisualLabel: string;
  heroVisualRegion: string;
  principlesAria: string;
  principles: [string, string][];
  audienceEyebrow: string;
  audienceTitleLine1: string;
  audienceTitleLine2: string;
  audienceLead: string;
  buyerEyebrow: string;
  buyerTitle: string;
  buyerBody: string;
  buyerBullets: string[];
  buyerCta: string;
  farmerEyebrow: string;
  farmerTitle: string;
  farmerBody: string;
  farmerBullets: string[];
  farmerCta: string;
  howEyebrow: string;
  howTitleLine1: string;
  howTitleLine2: string;
  howLead: string;
  howSteps: [string, string][];
  intakeEyebrow: string;
  intakeTitle: string;
  intakeBody: string;
  intakePinTitle: string;
  intakePinBody: string;
  preferPhone: string;
  intakeDisclaimer: string;
  successEyebrow: string;
  successTitle: string;
  successBody: string;
  referenceLabel: string;
  successHintBrowser: string;
  successHintStatic: string;
  sendViaWhatsapp: string;
  sendViaEmail: string;
  trackThisRequest: string;
  submitAnother: string;
  tabBuy: string;
  tabSell: string;
  formHeadingBuyer: string;
  formHeadingFarmer: string;
  requiredHint: string;
  labelName: string;
  placeholderName: string;
  labelPhone: string;
  placeholderPhone: string;
  labelOrgFarmer: string;
  labelOrgBuyer: string;
  placeholderOrgFarmer: string;
  placeholderOrgBuyer: string;
  labelTypeFarmer: string;
  labelTypeBuyer: string;
  labelPinBuyer: string;
  labelPinFarmer: string;
  placeholderPin: string;
  pinHelpBuyer: string;
  pinHelpFarmer: string;
  labelProduce: string;
  placeholderProduce: string;
  labelQuantity: string;
  placeholderQuantity: string;
  labelUnit: string;
  labelGrade: string;
  labelNeededBy: string;
  labelAvailableFrom: string;
  labelFrequency: string;
  labelNotes: string;
  placeholderNotes: string;
  honeypotLabel: string;
  consentPrefix: string;
  consentPrivacyLink: string;
  submitting: string;
  submitBuyer: string;
  submitFarmer: string;
  formSecurityNote: string;
  invalidPinError: string;
  offlineSubmitError: string;
  retrySuffix: string;
  farmerTypes: Record<'farmer' | 'fpo' | 'other', string>;
  buyerTypes: Record<'retailer' | 'wholesaler' | 'restaurant' | 'caterer' | 'other', string>;
  units: Record<'kg' | 'quintal' | 'tonne' | 'crate' | 'box', string>;
  grades: Record<'A' | 'B' | 'mixed', string>;
  frequencies: Record<'once' | 'daily' | 'weekly', string>;
  statuses: Record<string, string>;
  faqEyebrow: string;
  faqTitle: string;
  faqLead: string;
  faqs: [string, string][];
  supportEyebrow: string;
  supportTitle: string;
  supportBody: string;
  whatsappCta: string;
  footerTagline: string;
  footerTrack: string;
  footerPrivacy: string;
  footerTerms: string;
  footerOperations: string;
  footerRights: string;
  trackEyebrow: string;
  trackTitle: string;
  trackLead: string;
  newRequest: string;
  trackEmptyTitle: string;
  trackEmptyBody: string;
  startRequest: string;
  callSupport: string;
  savedListAria: string;
  viewPrivateStatus: string;
  loadingRequest: string;
  gradeLabel: string;
  pinPrefix: string;
  submittedPrefix: string;
  latestUpdateTitle: string;
  defaultUpdateText: string;
  quotesSectionTitle: string;
  noQuotesYet: string;
  quoteDisclaimer: string;
  refreshStatus: string;
  contactSupport: string;
  withdrawButton: string;
  withdrawConfirmTitle: string;
  withdrawConfirmBody: string;
  withdrawConfirmAction: string;
  withdrawCancelAction: string;
  whatsappHelpPrefix: string;
  quoteTotalSuffix: string;
  quoteValidThrough: string;
  quoteProduce: string;
  quoteDelivery: string;
  quotePacking: string;
  quoteFees: string;
  quoteEffectiveCost: string;
  quoteAgreedBadge: string;
  quoteLowestBadge: string;
  quoteExpiredBadge: string;
  quoteSelectedButton: string;
  quoteSelectButton: string;
  opsEyebrow: string;
  opsTitle: string;
  opsLead: string;
  opsRefresh: string;
  opsCheckingAccess: string;
  opsAccessRequiredTitle: string;
  opsLocalAuthBody: string;
  opsLocalAuthCta: string;
  opsStaticAuthBody: string;
  opsStaticAuthCta: string;
  opsWorkerAuthBody: string;
  opsBackHome: string;
  opsSignOut: string;
  opsStatsNew: string;
  opsStatsBuyers: string;
  opsStatsFarmers: string;
  opsStatsFulfilled: string;
  opsSearchAria: string;
  opsSearchPlaceholder: string;
  opsFilterLabel: string;
  opsAllStatuses: string;
  opsExportRows: (n: number) => string;
  opsLimitNote: string;
  opsEmptyListTitle: string;
  opsEmptyListBody: string;
  opsSelectPromptTitle: string;
  opsSelectPromptBody: string;
  opsBuyingTag: string;
  opsSupplyTag: string;
  opsBuyingFull: string;
  opsSupplyFull: string;
  opsContactRemoved: string;
  opsCustomerNotes: string;
  opsSupplierQuotes: string;
  opsCloseForm: string;
  opsAddQuote: string;
  opsQuoteRuleNote: string;
  opsNoQuotes: string;
  opsQuoteFormTitle: string;
  opsSupplierName: string;
  opsQuoteUnitPrice: string;
  opsQuoteDelivery: string;
  opsQuotePacking: string;
  opsQuoteFees: string;
  opsQuoteValidUntil: string;
  opsQuoteNotes: string;
  opsQuotedTotal: string;
  opsSaveQuote: string;
  opsProgressTitle: string;
  opsStatusLabel: string;
  opsCustomerUpdateLabel: string;
  opsCustomerUpdatePlaceholder: string;
  opsInternalNotesLabel: string;
  opsInternalNotesPlaceholder: string;
  opsSaving: string;
  opsSaveProgress: string;
  opsSavedNotice: string;
  opsConflictHint: string;
  policyEyebrow: string;
  policyCloseAria: string;
  policyDone: string;
  privacyTitle: string;
  privacySections: { heading?: string; body: string }[];
  termsTitle: string;
  termsSections: { heading?: string; body: string }[];
};

export const pilotCopy: Record<Language, Copy> = {
  en: {
    skipToContent: 'Skip to content',
    topBannerText: 'Buying & farm supply requests open nationwide',
    topBannerBadge: 'Across India',
    brandTagline: 'FARM TO BUSINESS',
    navBuy: 'Buy produce',
    navSell: 'Sell produce',
    navHowItWorks: 'How it works',
    navSupport: 'Support',
    trackRequest: 'Track request',
    getQuote: 'Get a quote',
    langButton: 'हिंदी',
    langAriaLabel: 'हिंदी में देखें',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    offlineBanner:
      'You are offline. Your form stays open here—reconnect before submitting or refreshing.',
    staticBanner:
      'Preview mode · Requests save in this browser. Use WhatsApp or email on your receipt to reach our team directly.',
    heroEyebrow: 'FARM-DIRECT PRODUCE SOURCING',
    heroTitleLine1: 'Fresh from farms.',
    heroTitleLine2: 'Ready for your business.',
    heroDescription:
      'Tell us what produce you need or what crop you have ready to harvest anywhere in India. Our team checks availability, grade, landed pricing, and transport for your PIN code.',
    heroBuyerCta: 'Post a buying requirement',
    heroFarmerCta: 'List farm supply',
    heroNote: 'No online payment needed. Review a complete quote before you confirm.',
    heroVisualAria: 'Illustration of fresh cabbage, carrot, tomato, and onion',
    heroVisualTop: 'INDIA-WIDE SOURCING DESK',
    cropAlt: 'Illustrated cabbage, carrot, tomato and onion',
    orbitFarm: 'Farm sourced',
    orbitBusiness: 'Business ready',
    heroVisualLabel: 'SOURCING REQUESTS',
    heroVisualRegion: 'Across India',
    principlesAria: 'How we work',
    principles: [
      ['Full landed pricing', 'Produce, packing, transport, and fees shown upfront'],
      ['Grade & quantity locked in', 'Same quality specs across every quote'],
      ['Checked by our team', 'Every enquiry reviewed by a real coordinator'],
    ],
    audienceEyebrow: 'HOW KHETSETU HELPS',
    audienceTitleLine1: 'Fair terms for growers.',
    audienceTitleLine2: 'Clear pricing for buyers.',
    audienceLead:
      'Built for kirana shops, wholesalers, kitchens, and growers who want straight numbers and dependable repeat supply.',
    buyerEyebrow: 'FOR BUYERS',
    buyerTitle: 'Source produce without mandi guesswork.',
    buyerBody:
      'Running a retail store, wholesale counter, restaurant, or catering kitchen? Tell us what you need, how much, and when.',
    buyerBullets: [
      'One-time orders and recurring weekly supply',
      'Side-by-side quotes with packing and transport included',
      'Delivery feasibility checked for your exact PIN code',
    ],
    buyerCta: 'Request produce',
    farmerEyebrow: 'FOR FARMERS & FPOs',
    farmerTitle: 'Reach commercial buyers directly.',
    farmerBody:
      'Share your harvest, available volume, and pickup PIN. We match your produce against active buyer requirements.',
    farmerBullets: [
      'Open to individual farmers, FPOs, and local aggregators',
      'Clear grade, packing, and quantity discussions upfront',
      'Zero obligation until you agree to a confirmed buyer match',
    ],
    farmerCta: 'Share available produce',
    howEyebrow: 'THREE SIMPLE STEPS',
    howTitleLine1: 'From enquiry to handover,',
    howTitleLine2: 'with full clarity.',
    howLead:
      'Our coordinators match buyers and suppliers across India and check transport feasibility before confirming any order.',
    howSteps: [
      [
        'Share what you need',
        'Submit a buying requirement or available harvest. You get a reference ID right away to track progress.',
      ],
      [
        'Compare real quotes',
        'Our team verifies matching supply and shares quotes showing unit price, packing, delivery, and total cost.',
      ],
      [
        'Confirm the handover',
        'Once stock, grade, and transport are agreed, we coordinate pickup or delivery directly with both sides.',
      ],
    ],
    intakeEyebrow: 'SEND AN ENQUIRY',
    intakeTitle: "Tell us what you need or what you're harvesting.",
    intakeBody:
      'Fill in the details below. Our sourcing desk will call or WhatsApp you on the mobile number provided to confirm next steps.',
    intakePinTitle: 'Requests accepted across India',
    intakePinBody:
      'Enter any six-digit Indian PIN code. Our team checks local availability and transport for that route before anything is confirmed.',
    preferPhone: 'Prefer to speak directly?',
    intakeDisclaimer:
      'Submitting this form logs an enquiry—it does not place an automatic order, lock inventory, or charge any money.',
    successEyebrow: 'REQUEST SAVED',
    successTitle: "We've logged your request.",
    successBody:
      'Our operations team will review your requirement and contact you soon. Remember, this is an enquiry, not a confirmed order yet.',
    referenceLabel: 'YOUR REFERENCE ID',
    successHintBrowser:
      'Save this reference ID. Private tracking is stored in this browser; reach out to support if you switch devices.',
    successHintStatic:
      'Your request is saved in this browser preview. Tap below to send the formatted details straight to our team on WhatsApp or email.',
    sendViaWhatsapp: 'Send via WhatsApp',
    sendViaEmail: 'Send via Email',
    trackThisRequest: 'Track this request',
    submitAnother: 'Submit another request',
    tabBuy: 'I want to buy',
    tabSell: 'I have produce',
    formHeadingBuyer: 'What does your business need?',
    formHeadingFarmer: 'What produce do you have available?',
    requiredHint: 'Fields marked * are required.',
    labelName: 'Your name',
    placeholderName: 'Full name',
    labelPhone: 'Mobile number',
    placeholderPhone: '10-digit number',
    labelOrgFarmer: 'Farm / FPO name',
    labelOrgBuyer: 'Business name',
    placeholderOrgFarmer: 'Farm or FPO name (optional)',
    placeholderOrgBuyer: 'Shop or business name (optional)',
    labelTypeFarmer: 'Supplier type',
    labelTypeBuyer: 'Business type',
    labelPinBuyer: 'Delivery PIN code',
    labelPinFarmer: 'Produce pickup PIN code',
    placeholderPin: '6-digit PIN',
    pinHelpBuyer: "We'll check delivery availability and freight for this PIN code.",
    pinHelpFarmer: "We'll check pickup and transport options from this PIN code.",
    labelProduce: 'Produce and variety',
    placeholderProduce: 'e.g. Red onion, Nashik variety',
    labelQuantity: 'Quantity',
    placeholderQuantity: 'e.g. 100',
    labelUnit: 'Unit',
    labelGrade: 'Grade',
    labelNeededBy: 'Needed by',
    labelAvailableFrom: 'Available from',
    labelFrequency: 'Frequency',
    labelNotes: 'Anything else we should know?',
    placeholderNotes: 'Packing, quality, or timing notes… Do not enter bank or card details.',
    honeypotLabel: 'Leave this field empty',
    consentPrefix:
      'I agree that KhetSetu may store this request and contact me about sourcing or supplying produce.',
    consentPrivacyLink: 'Read the privacy notice',
    submitting: 'Sending request…',
    submitBuyer: 'Send buying requirement',
    submitFarmer: 'Share available produce',
    formSecurityNote: 'Your contact details are visible only to our sourcing team.',
    invalidPinError: 'Enter a valid six-digit Indian PIN code starting with 1–9.',
    offlineSubmitError: 'You appear to be offline. Reconnect and submit again—your details are still here.',
    retrySuffix: 'If your connection dropped, you can safely retry without losing changes.',
    farmerTypes: {
      farmer: 'Farmer',
      fpo: 'FPO / farmer collective',
      other: 'Other supplier',
    },
    buyerTypes: {
      retailer: 'Retailer / shop',
      wholesaler: 'Wholesaler',
      restaurant: 'Restaurant',
      caterer: 'Caterer',
      other: 'Other business',
    },
    units: {
      kg: 'kg',
      quintal: 'quintal',
      tonne: 'tonne',
      crate: 'crate',
      box: 'box',
    },
    grades: {
      A: 'Grade A',
      B: 'Grade B',
      mixed: 'Mixed',
    },
    frequencies: {
      once: 'One-time',
      daily: 'Daily',
      weekly: 'Weekly',
    },
    statuses: {
      new: 'Received',
      reviewing: 'Reviewing supply',
      quoted: 'Quote ready',
      confirmed: 'Confirmed',
      fulfilled: 'Completed',
      cancelled: 'Cancelled',
      withdrawn: 'Withdrawn',
      expired: 'Expired',
    },
    faqEyebrow: 'BEFORE YOU SUBMIT',
    faqTitle: 'Common questions.',
    faqLead: 'Plain answers on pricing, coverage, and payments.',
    faqs: [
      [
        'Is KhetSetu an instant online checkout store?',
        'No. KhetSetu currently runs as an assisted sourcing service. You share your requirement or harvest, our team verifies farmer/buyer matches, and pricing and transport are agreed before any order goes ahead.',
      ],
      [
        'Do you guarantee the lowest price in the mandi?',
        'We aim for fair, transparent landed pricing—not bait rates. A low per-kg rate often looks expensive once packing, loading, and transport are added, so our quotes show the full delivered cost side by side.',
      ],
      [
        'Which cities or states can submit requests?',
        'Buyers and farmers anywhere in India can send a request using a six-digit Indian PIN code. Our operations team reviews produce availability and pickup/delivery feasibility for your route before confirming.',
      ],
      [
        'How do payments work?',
        'We do not collect online payments through this form. Before a trade moves forward, our team confirms the contracting seller, payment recipient, invoice details, and delivery schedule with you directly.',
      ],
      [
        'Is there a mobile app available?',
        'An Android and iOS app is under active development, though app-store builds are not published yet. This mobile-friendly site works on any phone browser right now.',
      ],
      [
        'How do I update or withdraw my request?',
        'Open Track request on the same browser you used to submit, or message/call support with your reference ID. You can withdraw a request and erase your contact fields anytime from the tracking view.',
      ],
    ],
    supportEyebrow: 'DIRECT SUPPORT',
    supportTitle: "Let's talk produce.",
    supportBody: 'Questions on rates, grading, bulk loads, or transport routes?',
    whatsappCta: 'WhatsApp our team',
    footerTagline: 'Connecting farms and food businesses across India.',
    footerTrack: 'Track a request',
    footerPrivacy: 'Privacy',
    footerTerms: 'Sourcing terms',
    footerOperations: 'Operations',
    footerRights: 'KhetSetu · Assisted B2B Produce Sourcing.',
    trackEyebrow: 'YOUR PRIVATE REQUESTS',
    trackTitle: 'Track your enquiries.',
    trackLead:
      'Private tracking keys are kept in this browser. Our team confirms final commercial terms with you directly.',
    newRequest: 'New request',
    trackEmptyTitle: 'No saved requests in this browser yet.',
    trackEmptyBody:
      'Submit a requirement or supply listing to receive a reference ID and private tracking link. If you submitted from another device, contact support with your reference.',
    startRequest: 'Start a request',
    callSupport: 'Call +91 70216 10641',
    savedListAria: 'Saved requests',
    viewPrivateStatus: 'View status & quotes',
    loadingRequest: 'Loading request details…',
    gradeLabel: 'Grade',
    pinPrefix: 'PIN',
    submittedPrefix: 'Submitted',
    latestUpdateTitle: 'Update from our team',
    defaultUpdateText:
      'Your request has been logged. Our sourcing team will review availability and call you on the number you shared.',
    quotesSectionTitle: 'Supplier quotes',
    noQuotesYet:
      'No quotes added yet. Availability, packing, and freight are shared once our team completes initial checks.',
    quoteDisclaimer:
      'Quotes depend on validity dates and agreed specifications. Final confirmation is handled directly by our operations desk; no payment is taken here.',
    refreshStatus: 'Refresh status',
    contactSupport: 'Message support',
    withdrawButton: 'Withdraw & erase my details',
    withdrawConfirmTitle: 'Withdraw this request and erase contact details?',
    withdrawConfirmBody:
      'Our team will stop working on this enquiry and clear your contact information. Call support if a dispatch has already been agreed.',
    withdrawConfirmAction: 'Yes, withdraw request',
    withdrawCancelAction: 'Keep request',
    whatsappHelpPrefix: "Hello KhetSetu, I'd like an update on request",
    quoteTotalSuffix: 'total',
    quoteValidThrough: 'Valid through',
    quoteProduce: 'Produce',
    quoteDelivery: 'Delivery',
    quotePacking: 'Packing',
    quoteFees: 'Other fees',
    quoteEffectiveCost: 'Effective cost',
    quoteAgreedBadge: 'Agreed quote',
    quoteLowestBadge: 'Lowest comparable total',
    quoteExpiredBadge: 'Quote expired',
    quoteSelectedButton: 'Selected',
    quoteSelectButton: 'Mark as agreed quote',
    opsEyebrow: 'OPERATIONS DESK',
    opsTitle: 'Manage sourcing requests.',
    opsLead: 'Review incoming enquiries, compare landed supplier quotes, and keep buyers or growers updated.',
    opsRefresh: 'Refresh',
    opsCheckingAccess: 'Checking operator access…',
    opsAccessRequiredTitle: 'Operator access required.',
    opsLocalAuthBody:
      'You are running the local preview server. Use the local QA sign-in link to test the operations desk against your local SQLite database.',
    opsLocalAuthCta: 'Open local QA operations',
    opsStaticAuthBody:
      'This hosted static preview saves requests inside your browser. Open the demo operations desk to inspect requests, enter test quotes, and update statuses locally.',
    opsStaticAuthCta: 'Open demo operations desk',
    opsWorkerAuthBody:
      'Sign in with the authorised KhetSetu operator account on your hosting environment to access customer contact details.',
    opsBackHome: 'Back to KhetSetu',
    opsSignOut: 'Sign out',
    opsStatsNew: 'New requests',
    opsStatsBuyers: 'Active buyer leads',
    opsStatsFarmers: 'Active supply leads',
    opsStatsFulfilled: 'Completed',
    opsSearchAria: 'Search requests',
    opsSearchPlaceholder: 'Search PIN, produce, business, phone, or reference',
    opsFilterLabel: 'Status',
    opsAllStatuses: 'All statuses',
    opsExportRows: (n: number) => `Export ${n} rows`,
    opsLimitNote:
      'Showing up to 500 recent records. CSV exports contain contact numbers—share only with authorised staff.',
    opsEmptyListTitle: 'No matching requests.',
    opsEmptyListBody: 'New submissions will appear here once created.',
    opsSelectPromptTitle: 'Select a request.',
    opsSelectPromptBody: 'Customer details, supplier quotes, and status controls appear here.',
    opsBuyingTag: 'BUYING',
    opsSupplyTag: 'SUPPLY',
    opsBuyingFull: 'BUYING REQUIREMENT',
    opsSupplyFull: 'FARM SUPPLY LEAD',
    opsContactRemoved: 'Contact removed',
    opsCustomerNotes: 'Customer notes',
    opsSupplierQuotes: 'Supplier quotes',
    opsCloseForm: 'Close form',
    opsAddQuote: 'Add quote',
    opsQuoteRuleNote:
      'Quote quantity and unit must match the enquiry. Compare totals only for matching grades, and confirm with the customer before marking a quote agreed.',
    opsNoQuotes: 'No supplier quotes recorded yet.',
    opsQuoteFormTitle: 'Add supplier quote',
    opsSupplierName: 'Supplier name',
    opsQuoteUnitPrice: 'Produce price / unit (₹)',
    opsQuoteDelivery: 'Delivery total (₹)',
    opsQuotePacking: 'Packing total (₹)',
    opsQuoteFees: 'Other fees total (₹)',
    opsQuoteValidUntil: 'Valid through',
    opsQuoteNotes: 'Quote terms / notes',
    opsQuotedTotal: 'Quoted landed total:',
    opsSaveQuote: 'Save quote',
    opsProgressTitle: 'Request progress',
    opsStatusLabel: 'Status',
    opsCustomerUpdateLabel: 'Update visible to customer',
    opsCustomerUpdatePlaceholder: 'What should the customer see in tracking?',
    opsInternalNotesLabel: 'Internal team notes',
    opsInternalNotesPlaceholder: 'Only visible to operations staff',
    opsSaving: 'Saving…',
    opsSaveProgress: 'Save progress',
    opsSavedNotice: 'Saved.',
    opsConflictHint: 'Refresh the list if another session updated this record.',
    policyEyebrow: 'KHETSETU · ASSISTED SOURCING',
    policyCloseAria: 'Close dialog',
    policyDone: 'Got it',
    privacyTitle: 'Your details, handled carefully.',
    privacySections: [
      {
        body: 'When you submit an enquiry, KhetSetu stores your name, mobile number, optional business or farm name, produce details, PIN code, and any notes you include. Please never enter bank, card, UPI PIN, or Aadhaar numbers in the form.',
      },
      {
        heading: 'Why we ask for it',
        body: 'We use these details strictly to review supply or demand, reach out to confirm quantities and logistics, and keep an operational record of your request. Form consent covers coordination for that request—not unrelated promotional blasts.',
      },
      {
        heading: 'Who can view it',
        body: 'Customer contact numbers are restricted to the authorised KhetSetu operations team. Private tracking requires the secret key stored on the browser where you submitted the enquiry.',
      },
      {
        heading: 'Browser storage & devices',
        body: 'This website stores request reference IDs and private tracking keys in your browser so you can revisit your status. If you clear browser storage or switch phones, contact support with your reference ID.',
      },
      {
        heading: 'Retention and deletion',
        body: 'Contact fields on server records older than 90 days are cleared automatically during subsequent checks, and you can withdraw a request anytime from Track request to erase your contact details right away.',
      },
    ],
    termsTitle: 'Before we confirm a trade.',
    termsSections: [
      {
        body: 'Buyers, farmers, and FPOs across India can submit requests here. Our operations desk verifies origin, destination, produce quality, and transport availability before confirming terms.',
      },
      {
        heading: 'A request is not a binding order',
        body: 'Sending a requirement or listing available crop does not guarantee stock, price, delivery slot, or supplier verification. Quotes confirm grade, quantity, unit, packing, transport charges, fees, and expiry.',
      },
      {
        heading: 'Pricing & quality',
        body: 'We do not promise the lowest market rate. Always compare complete landed quotes for identical grades and units. Raise quality or weight questions before dispatch, and contact operations immediately with photos if an issue arises.',
      },
      {
        heading: 'Payments & invoicing',
        body: 'No online payment is collected on this site. Always confirm the contracting seller, payment recipient, invoice format, and cancellation terms with our team prior to paying.',
      },
    ],
  },
  hi: {
    skipToContent: 'मुख्य सामग्री पर जाएँ',
    topBannerText: 'पूरे भारत से खरीद और किसान आपूर्ति अनुरोध खुले हैं',
    topBannerBadge: 'संपूर्ण भारत',
    brandTagline: 'खेत से व्यापार तक',
    navBuy: 'उपज खरीदें',
    navSell: 'उपज बेचें',
    navHowItWorks: 'यह कैसे काम करता है',
    navSupport: 'सहायता',
    trackRequest: 'अनुरोध ट्रैक करें',
    getQuote: 'भाव मँगवाएँ',
    langButton: 'English',
    langAriaLabel: 'Switch to English',
    openMenu: 'मेनू खोलें',
    closeMenu: 'मेनू बंद करें',
    offlineBanner:
      'आप ऑफ़लाइन हैं। आपका फ़ॉर्म यहीं सुरक्षित है—भेजने या रीफ़्रेश करने से पहले इंटरनेट जोड़ें।',
    staticBanner:
      'प्रीव्यू मोड · अनुरोध इसी ब्राउज़र में सहेजे जाते हैं। टीम से सीधे जुड़ने के लिए रसीद पर दिए WhatsApp या ईमेल बटन का उपयोग करें।',
    heroEyebrow: 'खेत से सीधा बाज़ार',
    heroTitleLine1: 'खेत से ताज़ा।',
    heroTitleLine2: 'आपके व्यापार के लिए तैयार।',
    heroDescription:
      'भारत के किसी भी हिस्से से अपनी ज़रूरत या कटाई के लिए तैयार फसल की जानकारी भेजें। हमारी टीम आपके पिन कोड पर उपलब्धता, ग्रेड, कुल भाव और परिवहन की पुष्टि करती है।',
    heroBuyerCta: 'खरीद की ज़रूरत भेजें',
    heroFarmerCta: 'उपलब्ध उपज दर्ज करें',
    heroNote: 'कोई ऑनलाइन भुगतान नहीं। पुष्टि से पहले पूरा भाव साफ-साफ देखें।',
    heroVisualAria: 'ताज़ी पत्तागोभी, गाजर, टमाटर और प्याज़ का चित्र',
    heroVisualTop: 'अखिल भारतीय सोर्सिंग डेस्क',
    cropAlt: 'पत्तागोभी, गाजर, टमाटर और प्याज़ का चित्र',
    orbitFarm: 'सीधे खेत से',
    orbitBusiness: 'व्यापार के लिए तैयार',
    heroVisualLabel: 'खरीद व आपूर्ति अनुरोध',
    heroVisualRegion: 'पूरे भारत में',
    principlesAria: 'हमारी कार्यप्रणाली',
    principles: [
      ['डिलीवरी सहित पूरा भाव', 'उपज, पैकिंग, किराया और शुल्क पहले से स्पष्ट'],
      ['ग्रेड और मात्रा तय', 'हर भाव में एक जैसे गुणवत्ता मानक'],
      ['टीम द्वारा जांच', 'हर अनुरोध की हमारी टीम स्वयं समीक्षा करती है'],
    ],
    audienceEyebrow: 'खेतसेतु कैसे मदद करता है',
    audienceTitleLine1: 'किसान के लिए सही दाम।',
    audienceTitleLine2: 'खरीदार के लिए साफ़ हिसाब।',
    audienceLead:
      'किराना दुकानों, थोक व्यापारियों, रेस्तराँ और किसानों के लिए भरोसेमंद बातचीत, सटीक मात्रा और नियमित सप्लाई।',
    buyerEyebrow: 'खरीदारों के लिए',
    buyerTitle: 'बिना मंडी की भागदौड़ के सीधी खरीद।',
    buyerBody:
      'दुकान, थोक मंडी, रेस्तराँ या कैटरिंग चलाते हैं? बताएँ आपको कौन सी उपज, कितनी मात्रा में और कब चाहिए।',
    buyerBullets: [
      'एक बार के ऑर्डर या नियमित साप्ताहिक सप्लाई',
      'पैकिंग और डिलीवरी खर्च सहित भाव की तुलना',
      'आपके पिन कोड पर परिवहन की उपलब्धता की जांच',
    ],
    buyerCta: 'उपज मँगवाएँ',
    farmerEyebrow: 'किसानों और FPO के लिए',
    farmerTitle: 'व्यावसायिक खरीदारों तक सीधी पहुँच।',
    farmerBody:
      'अपनी फसल, उपलब्ध मात्रा और पिकअप पिन कोड साझा करें। हम आपकी उपज को सक्रिय खरीदारों की मांग से मिलाते हैं।',
    farmerBullets: [
      'किसानों, FPO और स्थानीय उत्पादक समूहों के लिए खुला',
      'ग्रेड, पैकिंग और मात्रा पर पहले से स्पष्ट बातचीत',
      'सहमति बनने तक बिक्री की कोई बाध्यता नहीं',
    ],
    farmerCta: 'उपलब्ध फसल साझा करें',
    howEyebrow: 'तीन आसान कदम',
    howTitleLine1: 'अनुरोध से डिलीवरी तक,',
    howTitleLine2: 'पूरी पारदर्शिता के साथ।',
    howLead:
      'हमारी टीम पूरे भारत में खरीदारों और किसानों को जोड़ती है और पुष्टि से पहले ट्रांसपोर्ट की जांच करती है।',
    howSteps: [
      [
        'अपनी जरूरत बताएँ',
        'खरीद की मांग या उपलब्ध उपज दर्ज करें। आपको तुरंत ट्रैकिंग के लिए एक संदर्भ नंबर मिलता है।',
      ],
      [
        'सही भाव की तुलना करें',
        'हमारी टीम सप्लाई की जांच कर उपज, पैकिंग, डिलीवरी और कुल खर्च सहित कोटेशन साझा करती है।',
      ],
      [
        'हैंडओवर तय करें',
        'स्टॉक, ग्रेड और वाहन तय होने के बाद हमारी टीम दोनों पक्षों के साथ पिकअप या डिलीवरी कराती है।',
      ],
    ],
    intakeEyebrow: 'अनुरोध भेजें',
    intakeTitle: 'बताएँ आपको क्या चाहिए या कौन सी फसल तैयार है।',
    intakeBody:
      'नीचे विवरण भरें। आगे की बातचीत के लिए हमारी टीम आपके दिए गए मोबाइल नंबर पर कॉल या WhatsApp करेगी।',
    intakePinTitle: 'पूरे भारत से अनुरोध स्वीकार',
    intakePinBody:
      'भारत का कोई भी छह अंकों का पिन कोड डालें। ऑर्डर पक्का करने से पहले टीम उस रूट पर उपलब्धता और ट्रांसपोर्ट जांचेगी।',
    preferPhone: 'सीधे बात करना चाहते हैं?',
    intakeDisclaimer:
      'यह फ़ॉर्म केवल अनुरोध दर्ज करता है—इससे कोई स्वचालित ऑर्डर, स्टॉक बुकिंग या पेमेंट नहीं होता।',
    successEyebrow: 'अनुरोध दर्ज हुआ',
    successTitle: 'आपका अनुरोध हमारे पास पहुँच गया है।',
    successBody:
      'हमारी टीम आपकी जानकारी देखकर जल्द संपर्क करेगी। ध्यान दें: यह अभी शुरुआती अनुरोध है, पक्का ऑर्डर नहीं।',
    referenceLabel: 'आपका संदर्भ नंबर',
    successHintBrowser:
      'यह संदर्भ नंबर संभाल कर रखें। प्राइवेट ट्रैकिंग इसी ब्राउज़र में सहेजी गई है; दूसरा फोन उपयोग करने पर सपोर्ट से संपर्क करें।',
    successHintStatic:
      'आपका अनुरोध इस ब्राउज़र प्रीव्यू में सहेजा गया है। हमारी टीम को तुरंत भेजने के लिए नीचे WhatsApp या ईमेल बटन दबाएँ।',
    sendViaWhatsapp: 'WhatsApp पर भेजें',
    sendViaEmail: 'ईमेल से भेजें',
    trackThisRequest: 'यह अनुरोध ट्रैक करें',
    submitAnother: 'नया अनुरोध भेजें',
    tabBuy: 'मुझे खरीदना है',
    tabSell: 'मेरे पास उपज है',
    formHeadingBuyer: 'आपके व्यापार को क्या चाहिए?',
    formHeadingFarmer: 'आपके पास कौन सी उपज उपलब्ध है?',
    requiredHint: '* चिह्नित जानकारी भरना आवश्यक है।',
    labelName: 'आपका नाम',
    placeholderName: 'पूरा नाम',
    labelPhone: 'मोबाइल नंबर',
    placeholderPhone: '10 अंकों का नंबर',
    labelOrgFarmer: 'खेत / FPO का नाम',
    labelOrgBuyer: 'व्यवसाय / दुकान का नाम',
    placeholderOrgFarmer: 'खेत या FPO का नाम (वैकल्पिक)',
    placeholderOrgBuyer: 'दुकान या कंपनी का नाम (वैकल्पिक)',
    labelTypeFarmer: 'आपूर्तिकर्ता प्रकार',
    labelTypeBuyer: 'व्यवसाय प्रकार',
    labelPinBuyer: 'डिलीवरी पिन कोड',
    labelPinFarmer: 'उपज पिकअप पिन कोड',
    placeholderPin: '6 अंकों का पिन',
    pinHelpBuyer: 'हम इस पिन कोड के लिए डिलीवरी और किराये के विकल्प जांचेंगे।',
    pinHelpFarmer: 'हम इस पिन कोड से पिकअप और वाहन की सुविधा जांचेंगे।',
    labelProduce: 'उपज और किस्म',
    placeholderProduce: 'जैसे: लाल प्याज़, नासिक किस्म',
    labelQuantity: 'मात्रा',
    placeholderQuantity: 'जैसे: 100',
    labelUnit: 'इकाई',
    labelGrade: 'ग्रेड',
    labelNeededBy: 'कब तक चाहिए',
    labelAvailableFrom: 'कब से उपलब्ध है',
    labelFrequency: 'आवृत्ति',
    labelNotes: 'कोई अन्य जानकारी?',
    placeholderNotes: 'पैकिंग, गुणवत्ता या समय से जुड़ी बात… कृपया बैंक या कार्ड विवरण न लिखें।',
    honeypotLabel: 'यह स्थान खाली छोड़ें',
    consentPrefix:
      'मैं सहमत हूँ कि खेतसेतु यह अनुरोध सहेजे और उपज खरीद-बिक्री के लिए मुझसे संपर्क करे।',
    consentPrivacyLink: 'गोपनीयता सूचना पढ़ें',
    submitting: 'भेजा जा रहा है…',
    submitBuyer: 'खरीद अनुरोध भेजें',
    submitFarmer: 'उपलब्ध उपज भेजें',
    formSecurityNote: 'आपका संपर्क विवरण केवल हमारी ऑपरेशंस टीम को दिखता है।',
    invalidPinError: '1–9 से शुरू होने वाला छह अंकों का सही भारतीय पिन कोड दर्ज करें।',
    offlineSubmitError: 'इंटरनेट कनेक्शन नहीं है। कृपया दोबारा जुड़कर भेजें—आपका विवरण यहीं है।',
    retrySuffix: 'अगर नेटवर्क टूट गया हो, तो बिना जानकारी बदले फिर कोशिश करें।',
    farmerTypes: {
      farmer: 'किसान',
      fpo: 'FPO / किसान समूह',
      other: 'अन्य आपूर्तिकर्ता',
    },
    buyerTypes: {
      retailer: 'खुदरा दुकान / रिटेलर',
      wholesaler: 'थोक व्यापारी',
      restaurant: 'रेस्तराँ',
      caterer: 'कैटरर',
      other: 'अन्य व्यवसाय',
    },
    units: {
      kg: 'किग्रा (kg)',
      quintal: 'क्विंटल',
      tonne: 'टन',
      crate: 'क्रेट',
      box: 'बॉक्स',
    },
    grades: {
      A: 'ग्रेड A',
      B: 'ग्रेड B',
      mixed: 'मिश्रित (Mixed)',
    },
    frequencies: {
      once: 'एक बार',
      daily: 'रोज़ाना',
      weekly: 'साप्ताहिक',
    },
    statuses: {
      new: 'प्राप्त हुआ',
      reviewing: 'जांच जारी',
      quoted: 'भाव तैयार',
      confirmed: 'पुष्ट हुआ',
      fulfilled: 'पूर्ण हुआ',
      cancelled: 'रद्द',
      withdrawn: 'वापस लिया',
      expired: 'अवधि समाप्त',
    },
    faqEyebrow: 'भेजने से पहले जानें',
    faqTitle: 'अक्सर पूछे जाने वाले सवाल।',
    faqLead: 'भाव, क्षेत्र और भुगतान से जुड़े सीधे जवाब।',
    faqs: [
      [
        'क्या खेतसेतु एक ऑनलाइन शॉपिंग वेबसाइट है?',
        'नहीं। यह सेवा टीम की सहायता से चलती है। आप अपनी ज़रूरत या फसल भेजते हैं, हमारी टीम सही मिलान खोजती है और सहमति के बाद ही सौदा तय होता है।',
      ],
      [
        'क्या यहाँ हमेशा सबसे सस्ता भाव मिलेगा?',
        'हमारा लक्ष्य साफ़ और उचित कुल लागत दिखाना है। कई बार कम प्रति-किलो भाव के बाद पैकिंग और किराया जोड़ने पर कुल खर्च बढ़ जाता है, इसलिए हम पूरा लैंडेड खर्च साथ दिखाते हैं।',
      ],
      [
        'कहाँ से अनुरोध भेजे जा सकते हैं?',
        'खरीदार और किसान भारत में कहीं से भी छह अंकों के पिन कोड के साथ अनुरोध भेज सकते हैं। हमारी टीम उपज की उपलब्धता और ट्रांसपोर्ट की संभावना जांचकर पुष्टि करती है।',
      ],
      [
        'भुगतान कैसे होता है?',
        'इस फ़ॉर्म पर कोई ऑनलाइन पेमेंट नहीं लिया जाता। किसी भी सौदे से पहले हमारी टीम विक्रेता, बिलिंग और भुगतान की शर्तें आपसे सीधे तय करती है।',
      ],
      [
        'क्या मोबाइल ऐप उपलब्ध है?',
        'Android और iOS ऐप तैयार किए जा रहे हैं, अभी ऐप-स्टोर रिलीज़ उपलब्ध नहीं है। आप अभी अपने फ़ोन ब्राउज़र से यह वेबसाइट आसानी से चला सकते हैं।',
      ],
      [
        'अनुरोध बदलने या हटाने के लिए क्या करें?',
        'जिस ब्राउज़र से अनुरोध भेजा है उसी में "अनुरोध ट्रैक करें" खोलें, या संदर्भ नंबर के साथ सपोर्ट से संपर्क करें। आप ट्रैकिंग पेज से कभी भी अपना संपर्क विवरण हटा सकते हैं।',
      ],
    ],
    supportEyebrow: 'सीधी सहायता',
    supportTitle: 'आइए उपज पर बात करें।',
    supportBody: 'भाव, ग्रेडिंग, थोक मात्रा या ट्रांसपोर्ट रूट के बारे में कोई सवाल है?',
    whatsappCta: 'WhatsApp पर बात करें',
    footerTagline: 'पूरे भारत के खेतों और खाद्य व्यवसायों को जोड़ते हुए।',
    footerTrack: 'अनुरोध ट्रैक करें',
    footerPrivacy: 'गोपनीयता',
    footerTerms: 'शर्तें',
    footerOperations: 'ऑपरेशंस',
    footerRights: 'खेतसेतु · असिस्टेड B2B प्रोड्यूस सोर्सिंग।',
    trackEyebrow: 'आपके निजी अनुरोध',
    trackTitle: 'अपने अनुरोधों की स्थिति देखें।',
    trackLead:
      'ट्रैकिंग कुंजी आपके इसी ब्राउज़र में सहेजी जाती है। अंतिम शर्तें हमारी टीम आपसे सीधे तय करती है।',
    newRequest: 'नया अनुरोध',
    trackEmptyTitle: 'इस ब्राउज़र में अभी कोई अनुरोध सहेजा नहीं गया है।',
    trackEmptyBody:
      'संदर्भ नंबर और निजी ट्रैकिंग पाने के लिए अनुरोध भेजें। यदि आपने दूसरे फ़ोन से भेजा था, तो संदर्भ नंबर के साथ सपोर्ट पर कॉल करें।',
    startRequest: 'अनुरोध शुरू करें',
    callSupport: 'कॉल करें +91 70216 10641',
    savedListAria: 'सहेजे गए अनुरोध',
    viewPrivateStatus: 'स्थिति और भाव देखें',
    loadingRequest: 'अनुरोध की जानकारी लोड हो रही है…',
    gradeLabel: 'ग्रेड',
    pinPrefix: 'पिन',
    submittedPrefix: 'भेजा गया',
    latestUpdateTitle: 'हमारी टीम का अपडेट',
    defaultUpdateText:
      'आपका अनुरोध दर्ज हो गया है। हमारी टीम उपलब्धता की जांच कर आपके दिए मोबाइल नंबर पर संपर्क करेगी।',
    quotesSectionTitle: 'आपूर्तिकर्ता के भाव',
    noQuotesYet:
      'अभी कोई भाव दर्ज नहीं हुआ है। शुरुआती जांच के बाद उपज, पैकिंग और किराये का विवरण दिखेगा।',
    quoteDisclaimer:
      'भाव अपनी वैधता और तय गुणवत्ता शर्तों पर निर्भर हैं। पुष्टि हमारी टीम द्वारा की जाती है; यहाँ कोई भुगतान नहीं लिया जाता।',
    refreshStatus: 'स्थिति अपडेट करें',
    contactSupport: 'सपोर्ट से बात करें',
    withdrawButton: 'अनुरोध वापस लें व विवरण हटाएँ',
    withdrawConfirmTitle: 'क्या आप यह अनुरोध वापस लेकर संपर्क विवरण हटाना चाहते हैं?',
    withdrawConfirmBody:
      'हमारी टीम इस पर काम रोक देगी और आपका संपर्क विवरण मिटा देगी। यदि डिलीवरी पहले से तय हो चुकी है, तो कृपया सपोर्ट पर कॉल करें।',
    withdrawConfirmAction: 'हाँ, अनुरोध वापस लें',
    withdrawCancelAction: 'अनुरोध बनाए रखें',
    whatsappHelpPrefix: 'नमस्ते खेतसेतु, मुझे इस अनुरोध पर सहायता चाहिए:',
    quoteTotalSuffix: 'कुल',
    quoteValidThrough: 'मान्य तिथि',
    quoteProduce: 'उपज',
    quoteDelivery: 'डिलीवरी',
    quotePacking: 'पैकिंग',
    quoteFees: 'अन्य शुल्क',
    quoteEffectiveCost: 'प्रभावी दर',
    quoteAgreedBadge: 'सहमति बना भाव',
    quoteLowestBadge: 'सबसे कम तुलनात्मक कुल',
    quoteExpiredBadge: 'भाव समाप्त',
    quoteSelectedButton: 'चयनित',
    quoteSelectButton: 'सहमत भाव के रूप में दर्ज करें',
    opsEyebrow: 'ऑपरेशंस डेस्क',
    opsTitle: 'सोर्सिंग अनुरोध संभालें।',
    opsLead: 'नए अनुरोध जाँचें, कुल लैंडेड भाव की तुलना करें और ग्राहकों को अपडेट दें।',
    opsRefresh: 'रीफ़्रेश',
    opsCheckingAccess: 'ऑपरेटर एक्सेस जांचा जा रहा है…',
    opsAccessRequiredTitle: 'ऑपरेटर लॉगिन आवश्यक है।',
    opsLocalAuthBody:
      'आप लोकल प्रीव्यू सर्वर पर हैं। अपने लोकल SQLite डेटाबेस पर ऑपरेशंस डेस्क जांचने के लिए लोकल QA साइन-इन लिंक खोलें।',
    opsLocalAuthCta: 'लोकल QA ऑपरेशंस खोलें',
    opsStaticAuthBody:
      'यह स्टैटिक प्रीव्यू ब्राउज़र में डेटा सहेजता है। अनुरोध देखने, टेस्ट कोटेशन जोड़ने और स्थिति बदलने के लिए डेमो ऑपरेशंस डेस्क खोलें।',
    opsStaticAuthCta: 'डेमो ऑपरेशंस डेस्क खोलें',
    opsWorkerAuthBody:
      'ग्राहकों का संपर्क विवरण देखने के लिए अधिकृत खेतसेतु ऑपरेटर खाते से साइन इन करें।',
    opsBackHome: 'खेतसेतु होम पर जाएँ',
    opsSignOut: 'साइन आउट',
    opsStatsNew: 'नए अनुरोध',
    opsStatsBuyers: 'सक्रिय खरीद अनुरोध',
    opsStatsFarmers: 'सक्रिय आपूर्ति लीड',
    opsStatsFulfilled: 'पूर्ण हुए',
    opsSearchAria: 'अनुरोध खोजें',
    opsSearchPlaceholder: 'पिन, उपज, व्यवसाय, नंबर या संदर्भ खोजें',
    opsFilterLabel: 'स्थिति',
    opsAllStatuses: 'सभी स्थितियाँ',
    opsExportRows: (n: number) => `${n} पंक्तियाँ CSV में निकालें`,
    opsLimitNote:
      'नवीनतम 500 अनुरोध दिखाए जा रहे हैं। CSV फ़ाइल में फ़ोन नंबर होते हैं—केवल अधिकृत स्टाफ़ के साथ साझा करें।',
    opsEmptyListTitle: 'कोई मेल खाने वाला अनुरोध नहीं मिला।',
    opsEmptyListBody: 'नए अनुरोध दर्ज होने पर यहाँ दिखेंगे।',
    opsSelectPromptTitle: 'कोई अनुरोध चुनें।',
    opsSelectPromptBody: 'ग्राहक विवरण, भाव और प्रगति नियंत्रण यहाँ दिखेंगे।',
    opsBuyingTag: 'खरीद',
    opsSupplyTag: 'आपूर्ति',
    opsBuyingFull: 'खरीद अनुरोध',
    opsSupplyFull: 'किसान आपूर्ति लीड',
    opsContactRemoved: 'संपर्क विवरण हटाया गया',
    opsCustomerNotes: 'ग्राहक के नोट्स',
    opsSupplierQuotes: 'आपूर्तिकर्ता के भाव',
    opsCloseForm: 'फ़ॉर्म बंद करें',
    opsAddQuote: 'भाव जोड़ें',
    opsQuoteRuleNote:
      'मात्रा और इकाई अनुरोध से मेल खानी चाहिए। केवल समान ग्रेड के भावों की तुलना करें और ग्राहक की सहमति के बाद ही भाव पक्का दर्ज करें।',
    opsNoQuotes: 'अभी कोई कोटेशन दर्ज नहीं है।',
    opsQuoteFormTitle: 'नया सप्लायर भाव जोड़ें',
    opsSupplierName: 'आपूर्तिकर्ता का नाम',
    opsQuoteUnitPrice: 'उपज भाव / इकाई (₹)',
    opsQuoteDelivery: 'डिलीवरी कुल (₹)',
    opsQuotePacking: 'पैकिंग कुल (₹)',
    opsQuoteFees: 'अन्य शुल्क कुल (₹)',
    opsQuoteValidUntil: 'मान्य तिथि',
    opsQuoteNotes: 'कोटेशन की शर्तें / नोट्स',
    opsQuotedTotal: 'कुल लैंडेड कीमत:',
    opsSaveQuote: 'भाव सहेजें',
    opsProgressTitle: 'अनुरोध की प्रगति',
    opsStatusLabel: 'स्थिति',
    opsCustomerUpdateLabel: 'ग्राहक को दिखने वाला अपडेट',
    opsCustomerUpdatePlaceholder: 'ट्रैकिंग स्क्रीन पर ग्राहक को क्या दिखना चाहिए?',
    opsInternalNotesLabel: 'आंतरिक टीम नोट्स',
    opsInternalNotesPlaceholder: 'केवल ऑपरेशंस टीम के लिए',
    opsSaving: 'सहेजा जा रहा है…',
    opsSaveProgress: 'प्रगति सहेजें',
    opsSavedNotice: 'सहेजा गया।',
    opsConflictHint: 'यदि किसी अन्य सत्र ने बदलाव किया है, तो सूची रीफ़्रेश करें।',
    policyEyebrow: 'खेतसेतु · असिस्टेड सोर्सिंग',
    policyCloseAria: 'संवाद बंद करें',
    policyDone: 'समझ गया',
    privacyTitle: 'आपकी जानकारी की सुरक्षित देखभाल।',
    privacySections: [
      {
        body: 'अनुरोध भेजने पर खेतसेतु आपका नाम, मोबाइल नंबर, वैकल्पिक व्यवसाय या खेत का नाम, उपज विवरण, पिन कोड और आपके नोट्स सहेजता है। कृपया फ़ॉर्म में बैंक, कार्ड, UPI पिन या आधार जानकारी कभी न डालें।',
      },
      {
        heading: 'हम यह जानकारी क्यों लेते हैं',
        body: 'इसका उपयोग केवल मांग और आपूर्ति की समीक्षा करने, आपसे मात्रा व ट्रांसपोर्ट पर बात करने और अनुरोध का रिकॉर्ड रखने के लिए होता है। सहमति केवल इसी अनुरोध के संपर्क के लिए है—मार्केटिंग संदेशों के लिए नहीं।',
      },
      {
        heading: 'इसे कौन देख सकता है',
        body: 'फ़ोन नंबर और संपर्क विवरण केवल अधिकृत खेतसेतु ऑपरेशंस टीम देख सकती है। निजी ट्रैकिंग उसी ब्राउज़र की सुरक्षित कुंजी से खुलती है जहाँ से अनुरोध भेजा गया था।',
      },
      {
        heading: 'ब्राउज़र स्टोरेज और डिवाइस',
        body: 'यह वेबसाइट संदर्भ नंबर और ट्रैकिंग कुंजी आपके ब्राउज़र में रखती है। यदि आप ब्राउज़र डेटा साफ़ करते हैं या फ़ोन बदलते हैं, तो संदर्भ नंबर के साथ सपोर्ट से संपर्क करें।',
      },
      {
        heading: 'अवधि और डेटा हटाना',
        body: '90 दिनों से पुराने सर्वर रिकॉर्ड का संपर्क विवरण स्वतः साफ़ कर दिया जाता है। आप "अनुरोध ट्रैक करें" से कभी भी अनुरोध वापस लेकर तुरंत संपर्क जानकारी हटा सकते हैं।',
      },
    ],
    termsTitle: 'सौदा तय करने से पहले।',
    termsSections: [
      {
        body: 'भारत भर के खरीदार, किसान और FPO यहाँ अनुरोध भेज सकते हैं। हमारी टीम किसी भी लेनदेन से पहले पिकअप, डिलीवरी स्थान, उपज और वाहन की उपलब्धता की जांच करती है।',
      },
      {
        heading: 'अनुरोध कोई पक्का ऑर्डर नहीं है',
        body: 'फ़ॉर्म भरने से स्टॉक, भाव, डिलीवरी या सप्लायर सत्यापन की स्वतः गारंटी नहीं मिलती। कोटेशन में ग्रेड, मात्रा, इकाई, पैकिंग, किराया, शुल्क और वैधता स्पष्ट होती है।',
      },
      {
        heading: 'भाव और गुणवत्ता',
        body: 'हम सबसे सस्ते बाजार भाव का दावा नहीं करते। समान ग्रेड और इकाई के लिए कुल लैंडेड कीमत की तुलना करें। किसी समस्या पर तुरंत फोटो व विवरण के साथ टीम से संपर्क करें।',
      },
      {
        heading: 'भुगतान और बिलिंग',
        body: 'इस वेबसाइट पर कोई ऑनलाइन भुगतान नहीं लिया जाता। भुगतान करने से पहले हमारी टीम से विक्रेता, बिलिंग विवरण और रद्दीकरण शर्तें अवश्य पक्की करें।',
      },
    ],
  },
};
