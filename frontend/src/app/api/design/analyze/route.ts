import { NextResponse } from 'next/server';
import { getPreLaunchResults } from '@/lib/designToSim';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const design = body.design;
    if (!design) return NextResponse.json({ error: 'Missing design' }, { status: 400 });

    const results = getPreLaunchResults(design);
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
