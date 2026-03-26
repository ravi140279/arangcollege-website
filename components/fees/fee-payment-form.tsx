"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import type { FeeCatalog } from "@/lib/fees/config";

type Props = {
  feeCatalog: FeeCatalog;
  classOptions: string[];
  genderOptions: string[];
  casteOptions: string[];
  studentTypeOptions: string[];
  semesterYearOptions: string[];
  currency: string;
  paytmCheckoutJsUrl: string;
  gatewayReady: boolean;
};

declare global {
  interface Window {
    Paytm?: {
      CheckoutJS?: {
        init: (config: unknown) => Promise<void>;
        invoke: () => void;
      };
    };
  }
}

type FeeType = "term" | "examination";

export function FeePaymentForm({
  feeCatalog,
  classOptions,
  genderOptions,
  casteOptions,
  studentTypeOptions,
  semesterYearOptions,
  currency,
  paytmCheckoutJsUrl,
  gatewayReady,
}: Props) {
  const [selectedFee, setSelectedFee] = useState<FeeType>("term");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scriptLoaded = useRef(false);

  const selectedDetails = feeCatalog[selectedFee];

  // Load Paytm CheckoutJS
  useEffect(() => {
    if (!gatewayReady || scriptLoaded.current) return;
    const script = document.createElement("script");
    script.src = paytmCheckoutJsUrl;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
    scriptLoaded.current = true;
  }, [gatewayReady, paytmCheckoutJsUrl]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const response = await fetch("/api/fees/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        order_id?: string;
        txn_token?: string;
        amount?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create payment order.");
      }

      if (!window.Paytm?.CheckoutJS) {
        throw new Error(
          "Paytm CheckoutJS failed to load. Verify MID and environment settings."
        );
      }

      const paytmConfig = {
        root: "",
        flow: "DEFAULT",
        data: {
          orderId: data.order_id,
          token: data.txn_token,
          tokenType: "TXN_TOKEN",
          amount: data.amount,
        },
        handler: {
          notifyMerchant: (eventName: string) => {
            if (eventName === "APP_CLOSED") {
              setSubmitting(false);
            }
          },
        },
      };

      await window.Paytm.CheckoutJS.init(paytmConfig);
      window.Paytm.CheckoutJS.invoke();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero / summary panel */}
      <div className="grid gap-6 rounded-2xl border border-primary-900/10 bg-white/80 p-6 shadow-lg backdrop-blur sm:grid-cols-2 lg:grid-cols-5">
        {/* Left — info */}
        <div className="lg:col-span-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-800">
            Digital Fee Collection
          </p>
          <h1 className="mt-2 font-serif text-3xl font-black leading-tight text-primary-950 sm:text-4xl">
            Pay College Fees
          </h1>
          <p className="mt-3 max-w-prose text-base leading-7 text-slate-600">
            Select the fee category, review the payable amount, and complete
            payment securely through Paytm. Settlements are routed by Paytm to
            the college bank account.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-primary-900/10 bg-primary-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-800">
                Gateway status
              </p>
              <p className="mt-1 font-bold text-primary-950">
                {gatewayReady ? "Configured" : "Pending setup"}
              </p>
            </div>
            <div className="rounded-xl border border-primary-900/10 bg-primary-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-800">
                Currency
              </p>
              <p className="mt-1 font-bold text-primary-950">{currency}</p>
            </div>
          </div>
        </div>

        {/* Right — selected fee summary */}
        <div className="flex flex-col justify-between rounded-xl border border-primary-900/10 bg-primary-900 p-5 text-white lg:col-span-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-200">
              Selected Fee
            </p>
            <p className="mt-1 text-lg font-bold">{selectedDetails.label}</p>
            <p className="mt-1 text-sm text-primary-200">
              {selectedDetails.description}
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-accent-400 px-4 py-2 text-slate-900">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Amount
            </span>
            <span className="text-lg font-black">
              {currency} {selectedDetails.amount_rupees.toLocaleString("en-IN")}
            </span>
          </div>
          <Link
            href="/fees/payments"
            className="mt-4 text-sm font-semibold text-primary-200 underline-offset-2 hover:underline"
          >
            View collected payments →
          </Link>
        </div>
      </div>

      {/* Payment form */}
      <div className="rounded-2xl border border-primary-900/10 bg-white/90 p-6 shadow-lg backdrop-blur sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-800">
          Student Payment Form
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-primary-950">
          Pay term or examination fees
        </h2>

        {!gatewayReady && (
          <div className="mt-4 rounded-xl border border-accent-400/40 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-900">
            Add your Paytm MID and merchant key in the{" "}
            <code className="font-mono text-xs">.env.local</code> file before
            taking live payments.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-5 sm:grid-cols-2"
        >
          {/* Fee type radio cards */}
          <fieldset className="sm:col-span-2">
            <legend className="mb-3 text-sm font-bold text-slate-700">
              Fee Type
            </legend>
            <div className="flex flex-wrap gap-3">
              {(["term", "examination"] as FeeType[]).map((type) => (
                <label
                  key={type}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    selectedFee === type
                      ? "border-primary-800 bg-primary-50 ring-1 ring-primary-800"
                      : "border-slate-200 bg-white hover:border-primary-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="fee_type"
                    value={type}
                    checked={selectedFee === type}
                    onChange={() => setSelectedFee(type)}
                    className="accent-primary-800"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">
                      {feeCatalog[type].label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {currency}{" "}
                      {feeCatalog[type].amount_rupees.toLocaleString("en-IN")}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Student ID */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="student_id"
              className="text-sm font-bold text-slate-700"
            >
              Student ID
            </label>
            <input
              id="student_id"
              name="student_id"
              type="text"
              placeholder="2026BSC001"
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            />
          </div>

          {/* Student Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="student_name"
              className="text-sm font-bold text-slate-700"
            >
              Student Name
            </label>
            <input
              id="student_name"
              name="student_name"
              type="text"
              placeholder="Student full name"
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            />
          </div>

          {/* Father's Name */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label
              htmlFor="father_name"
              className="text-sm font-bold text-slate-700"
            >
              Father&apos;s Name
            </label>
            <input
              id="father_name"
              name="father_name"
              type="text"
              placeholder="Father's full name"
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="gender"
              className="text-sm font-bold text-slate-700"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              required
              defaultValue=""
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            >
              <option value="" disabled>
                Select gender
              </option>
              {genderOptions.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>

          {/* Caste */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="caste"
              className="text-sm font-bold text-slate-700"
            >
              Caste
            </label>
            <select
              id="caste"
              name="caste"
              required
              defaultValue=""
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            >
              <option value="" disabled>
                Select caste
              </option>
              {casteOptions.map((caste) => (
                <option key={caste} value={caste}>
                  {caste}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="class_name"
              className="text-sm font-bold text-slate-700"
            >
              Class
            </label>
            <select
              id="class_name"
              name="class_name"
              required
              defaultValue=""
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            >
              <option value="" disabled>
                Select class
              </option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Student Type */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="student_type"
              className="text-sm font-bold text-slate-700"
            >
              Student Type
            </label>
            <select
              id="student_type"
              name="student_type"
              required
              defaultValue=""
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            >
              <option value="" disabled>
                Select student type
              </option>
              {studentTypeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Semester / Year */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="semester_year"
              className="text-sm font-bold text-slate-700"
            >
              Semester / Year
            </label>
            <select
              id="semester_year"
              name="semester_year"
              required
              defaultValue=""
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            >
              <option value="" disabled>
                Select semester or year
              </option>
              {semesterYearOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-bold text-slate-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="student@college.edu"
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="phone"
              className="text-sm font-bold text-slate-700"
            >
              Mobile Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="10-digit mobile number"
              inputMode="numeric"
              pattern="[0-9]{10}"
              minLength={10}
              maxLength={10}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:px-10"
            >
              {submitting ? "Creating order…" : "Proceed to Pay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
