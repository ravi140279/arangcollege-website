import type { Metadata } from "next";
import Link from "next/link";
import { fetchPaymentByOrderId } from "@/lib/fees/db";
import { getCollegeConfig } from "@/lib/fees/config";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Payment Successful",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams;

  if (!orderId) notFound();

  const payment = fetchPaymentByOrderId(orderId);
  if (!payment) notFound();

  const { accountLabel } = getCollegeConfig();

  const details: [string, string][] = [
    ["Student ID", payment.student_id],
    ["Student Name", payment.student_name],
    ["Father's Name", payment.father_name],
    ["Class", payment.class_name],
    ["Student Type", payment.student_type],
    ["Semester / Year", payment.semester_year],
    ["Fee Type", payment.fee_label],
    [
      "Amount",
      `${payment.currency} ${payment.amount_rupees.toLocaleString("en-IN")}`,
    ],
    ["Paytm Order ID", payment.order_id],
    ["Paytm Transaction ID", payment.payment_id],
  ];

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-primary-800/20 bg-white/90 p-8 shadow-lg backdrop-blur">
          {/* Success badge */}
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-900 text-white">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-800">
              Payment Successful
            </p>
          </div>

          <h1 className="font-serif text-3xl font-black text-primary-950">
            {payment.fee_label} received
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your payment has been captured successfully through Paytm and will
            settle to the college account configured as{" "}
            <strong>{accountLabel}</strong>.
          </p>

          {/* Details grid */}
          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-primary-900/8 bg-primary-50/50 px-4 py-3"
              >
                <dt className="text-xs font-bold uppercase tracking-wide text-primary-800">
                  {label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/fees"
              className="rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white hover:bg-primary-800"
            >
              New payment
            </Link>
            <Link
              href="/fees/payments"
              className="rounded-xl border border-primary-800 px-6 py-3 text-sm font-semibold text-primary-800 hover:bg-primary-50"
            >
              View payment register
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
