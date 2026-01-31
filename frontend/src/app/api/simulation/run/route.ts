import { NextResponse } from 'next/server';
import { getSimParams } from '@/lib/designToSim';
import { createSimulationState, stepSimulation } from '@/lib/simulation';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const design = body.design;
    if (!design) return NextResponse.json({ error: 'Missing design' }, { status: 400 });

    const params = getSimParams(design);
    if (!params) return NextResponse.json({ error: 'Invalid motor or design' }, { status: 400 });

    const dt = 1 / 60;
    const maxTime = 120; // seconds

    const states = [] as Array<any>;
    let state = createSimulationState(params);
    // push initial
    states.push(state);

    while (state.time < maxTime && state.phase !== 'recovery') {
      state = stepSimulation(state, params, dt);
      states.push(state);
      // safety guard
      if (states.length > Math.ceil(maxTime / dt) + 10) break;
    }

    const telemetryHistory = states.map((s) => ({ time: s.time, altitude: s.altitude, velocity: s.velocity }));

    return NextResponse.json({ states, telemetryHistory });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
