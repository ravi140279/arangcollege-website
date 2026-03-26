import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  CLASS_OPTIONS,
  STUDENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  CASTE_OPTIONS,
  SEMESTER_YEAR_OPTIONS,
  getFeeCatalog,
  getPaytmConfig,
  getPaytmHost,
  isPaytmReady,
} from "@/lib/fees/config";
import { buildPaytmRequestHeaders } from "@/lib/fees/paytm";
import { upsertPendingOrder } from "@/lib/fees/db";

function generateOrderId(): string {
  const ts = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `FEE${ts}${rand}`;
}

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const requiredFields = [
    "student_id",
    "student_name",
    "father_name",
    "gender",
    "caste",
    "class_name",
    "student_type",
    "semester_year",
    "email",
    "phone",
    "fee_type",
  ];

  const missing = requiredFields.filter(
    (f) => !String(payload[f] ?? "").trim()
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const gender = String(payload.gender).trim();
  if (!(GENDER_OPTIONS as readonly string[]).includes(gender)) {
    return NextResponse.json(
      { error: "Invalid gender selected." },
      { status: 400 }
    );
  }

  const caste = String(payload.caste).trim();
  if (!(CASTE_OPTIONS as readonly string[]).includes(caste)) {
    return NextResponse.json(
      { error: "Invalid caste selected." },
      { status: 400 }
    );
  }

  const className = String(payload.class_name).trim();
  if (!(CLASS_OPTIONS as readonly string[]).includes(className)) {
    return NextResponse.json(
      { error: "Invalid class selected." },
      { status: 400 }
    );
  }

  const studentType = String(payload.student_type).trim();
  if (!(STUDENT_TYPE_OPTIONS as readonly string[]).includes(studentType)) {
    return NextResponse.json(
      { error: "Invalid student type selected." },
      { status: 400 }
    );
  }

  const semesterYear = String(payload.semester_year).trim();
  if (!(SEMESTER_YEAR_OPTIONS as readonly string[]).includes(semesterYear)) {
    return NextResponse.json(
      { error: "Invalid semester or year selected." },
      { status: 400 }
    );
  }

  const phone = String(payload.phone).trim();
  if (!/^\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: "Mobile number must be exactly 10 digits." },
      { status: 400 }
    );
  }

  const feeType = String(payload.fee_type).trim().toLowerCase();
  const feeCatalog = getFeeCatalog();
  const feeDetails = feeCatalog[feeType as keyof typeof feeCatalog];
  if (!feeDetails) {
    return NextResponse.json(
      { error: "Invalid fee type selected." },
      { status: 400 }
    );
  }

  if (!isPaytmReady()) {
    return NextResponse.json(
      { error: "Paytm credentials are not configured." },
      { status: 500 }
    );
  }

  const currency = process.env.CURRENCY ?? "INR";
  const amountRupees = feeDetails.amount_rupees;
  const orderId = generateOrderId();
  const paytmConfig = getPaytmConfig();

  // Build an absolute callback URL
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const callbackUrl = `${baseUrl}/api/fees/payment/callback`;

  const pendingOrder = {
    order_id: orderId,
    student_id: String(payload.student_id).trim(),
    student_name: String(payload.student_name).trim(),
    father_name: String(payload.father_name).trim(),
    gender,
    caste,
    class_name: className,
    student_type: studentType,
    semester_year: semesterYear,
    email: String(payload.email).trim(),
    phone,
    fee_type: feeType,
    fee_label: feeDetails.label,
    amount_rupees: amountRupees,
    currency,
    created_at: new Date().toISOString(),
  };

  upsertPendingOrder(pendingOrder);

  const body = {
    requestType: "Payment",
    mid: paytmConfig.mid,
    websiteName: paytmConfig.website,
    orderId,
    callbackUrl,
    txnAmount: { value: amountRupees.toFixed(2), currency },
    userInfo: {
      custId: pendingOrder.student_id,
      firstName: pendingOrder.student_name,
      mobile: pendingOrder.phone,
      email: pendingOrder.email,
    },
  };

  let paytmResponse: Record<string, unknown>;
  try {
    const paytmHost = getPaytmHost();
    const res = await fetch(
      `${paytmHost}/theia/api/v1/initiateTransaction?mid=${paytmConfig.mid}&orderId=${orderId}`,
      {
        method: "POST",
        headers: buildPaytmRequestHeaders(body, paytmConfig.merchantKey),
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      throw new Error(`Paytm returned HTTP ${res.status}`);
    }
    paytmResponse = (await res.json()) as Record<string, unknown>;
  } catch (err) {
    return NextResponse.json(
      { error: `Unable to initiate Paytm transaction: ${(err as Error).message}` },
      { status: 500 }
    );
  }

  const responseBody = (paytmResponse.body ?? {}) as Record<string, unknown>;
  const resultInfo = (responseBody.resultInfo ?? {}) as Record<string, unknown>;
  const txnToken = responseBody.txnToken as string | undefined;

  if (resultInfo.resultStatus !== "S" || !txnToken) {
    return NextResponse.json(
      {
        error:
          (resultInfo.resultMsg as string) ??
          "Paytm transaction initiation failed.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    order_id: orderId,
    amount: amountRupees.toFixed(2),
    amount_rupees: amountRupees,
    currency,
    description: feeDetails.description,
    fee_label: feeDetails.label,
    txn_token: txnToken,
    mid: paytmConfig.mid,
  });
}
