export const CLASS_OPTIONS = [
  "B.A.",
  "B.Com.",
  "B.Sc. Biology",
  "B.Sc. Mathematics",
  "M.Com.",
  "M.A. Hindi",
  "M.A. Political Sc.",
  "M.A. Economics",
  "M.Sc. Mathematics",
  "M.Sc. Zoology",
] as const;

export const STUDENT_TYPE_OPTIONS = ["Regular", "Private"] as const;

export const SEMESTER_YEAR_OPTIONS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "First Year",
  "Second Year",
  "Third Year",
] as const;

export type FeeCatalog = {
  term: { label: string; description: string; amount_rupees: number };
  examination: { label: string; description: string; amount_rupees: number };
};

export function getFeeCatalog(): FeeCatalog {
  return {
    term: {
      label: "Term Fees",
      description: "Academic term fee payment",
      amount_rupees: parseInt(process.env.TERM_FEE_AMOUNT ?? "25000", 10),
    },
    examination: {
      label: "Examination Fees",
      description: "Examination registration fee payment",
      amount_rupees: parseInt(process.env.EXAMINATION_FEE_AMOUNT ?? "3500", 10),
    },
  };
}

export function getPaytmConfig() {
  return {
    mid: (process.env.PAYTM_MID ?? "").trim(),
    merchantKey: (process.env.PAYTM_MERCHANT_KEY ?? "").trim(),
    website: (process.env.PAYTM_WEBSITE ?? "WEBSTAGING").trim(),
    channelId: (process.env.PAYTM_CHANNEL_ID ?? "WEB").trim(),
    environment: (process.env.PAYTM_ENV ?? "staging").trim().toLowerCase(),
  };
}

export function isPaytmReady(): boolean {
  const config = getPaytmConfig();
  return !!(config.mid && config.merchantKey);
}

export function getPaytmHost(): string {
  const { environment } = getPaytmConfig();
  return environment === "production"
    ? "https://securegw.paytm.in"
    : "https://securegw-stage.paytm.in";
}

export function getPaytmCheckoutJsUrl(): string {
  const { mid } = getPaytmConfig();
  return `${getPaytmHost()}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
}

export function getCollegeConfig() {
  return {
    collegeName: process.env.COLLEGE_NAME ?? "ABC College",
    accountLabel:
      process.env.COLLEGE_ACCOUNT_LABEL ??
      "State Bank of India Current Account",
    currency: process.env.CURRENCY ?? "INR",
  };
}
