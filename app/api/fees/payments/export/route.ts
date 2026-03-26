import { NextResponse } from "next/server";
import { fetchPayments } from "@/lib/fees/db";

function escapeCsvCell(value: string | number): string {
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function GET() {
  const payments = fetchPayments();

  const header = [
    "Date",
    "Student ID",
    "Student Name",
    "Father's Name",
    "Gender",
    "Caste",
    "Class",
    "Student Type",
    "Semester / Year",
    "Email",
    "Phone",
    "Fee Type",
    "Amount",
    "Currency",
    "Order ID",
    "Payment ID",
    "Status",
  ];

  const rows = payments.map((payment) => [
    payment.created_at,
    payment.student_id,
    payment.student_name,
    payment.father_name,
    payment.gender,
    payment.caste,
    payment.class_name,
    payment.student_type,
    payment.semester_year,
    payment.email,
    payment.phone,
    payment.fee_label,
    payment.amount_rupees,
    payment.currency,
    payment.order_id,
    payment.payment_id,
    payment.status,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="fee-payments-register.csv"',
      "Cache-Control": "no-store",
    },
  });
}