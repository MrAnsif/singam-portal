// app/api/daily-records/route.ts
// GET /api/daily-records?busId=&from=&to=&status=&page=&limit=
// POST /api/daily-records — create daily record
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DailyRecord, AuditLog } from '@/lib/models';
import { requireAuth, ok, fail } from '@/lib/api-helpers';
import { buildMongoDateFilter } from '@/lib/date-utils';
import { z } from 'zod';

const CreateRecordSchema = z.object({
  date: z.string().min(1),
  busId: z.string().min(1),
  driverId: z.string().optional(),
  attendantId: z.string().optional(),
  // Simplified distance: manager enters KM travelled directly
  travelledKm: z.number().min(0).default(0),
  diesel: z.object({
    qty: z.number().min(0).default(0),
    // total is the full price paid (qty × rate), entered directly
    total: z.number().min(0).default(0),
  }),
  adblue: z.object({
    qty: z.number().min(0).default(0),
    total: z.number().min(0).default(0),
  }),
  bookings: z
    .array(
      z.object({
        reference: z.string().optional(),
        customerGroup: z.string().optional(),
        revenue: z.number().min(0).default(0),
        notes: z.string().optional(),
      })
    )
    .default([]),
  otherExpenses: z
    .array(
      z.object({
        category: z.string().min(1),
        amount: z.number().min(0),
        note: z.string().optional(),
      })
    )
    .default([]),
  notes: z.string().optional(),
  status: z.enum(['draft', 'complete']).default('complete'),
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const busId = searchParams.get('busId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const period = searchParams.get('period');
  const status = searchParams.get('status');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(500, parseInt(searchParams.get('limit') ?? '20', 10));

  const filter: Record<string, unknown> = {};
  if (busId) filter.busId = busId;
  if (status) filter.status = status;
  const dateFilter = buildMongoDateFilter(from, to, period);
  if (dateFilter) {
    filter.date = dateFilter;
  }

  await connectDB();

  const [records, total] = await Promise.all([
    DailyRecord.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('busId', 'plateNumber name')
      .populate('driverId', 'name')
      .populate('attendantId', 'name')
      .populate('createdBy', 'name role')
      .lean(),
    DailyRecord.countDocuments(filter),
  ]);

  return ok({
    records,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid JSON body');
  }

  const parsed = CreateRecordSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0].message);
  }

  const { date, busId, travelledKm } = parsed.data;

  await connectDB();

  // Check for duplicate: same bus + same date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const duplicate = await DailyRecord.findOne({
    busId,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  if (duplicate) {
    return fail(
      JSON.stringify({
        code: 'DUPLICATE_RECORD',
        existingId: duplicate._id.toString(),
        message: `A record already exists for this bus on ${date}.`,
      }),
      409
    );
  }

  // Map simplified UI fields to the database schema
  // pricePerL is stored as 0 (we use total directly)
  const record = await DailyRecord.create({
    date: new Date(date),
    busId: parsed.data.busId,
    driverId: parsed.data.driverId,
    attendantId: parsed.data.attendantId,
    travelledKm,
    // openingKm / closingKm are omitted — not tracked in the simplified flow
    diesel: {
      qty: parsed.data.diesel.qty,
      pricePerL: 0,
      total: parsed.data.diesel.total,
    },
    adblue: {
      qty: parsed.data.adblue.qty,
      pricePerL: 0,
      total: parsed.data.adblue.total,
    },
    // Normalise bookings — cost always 0 (not tracked in manager flow)
    bookings: parsed.data.bookings.map((b) => ({ ...b, cost: 0 })),
    otherExpenses: parsed.data.otherExpenses,
    notes: parsed.data.notes,
    status: parsed.data.status,
    createdBy: session!.user.id,
  });

  return ok(record, 201);
}
