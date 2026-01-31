import nextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';

const RocketSimulator = nextDynamic(
  () => import('@/components/RocketSimulator').then((m) => m.RocketSimulator),
  { ssr: false, loading: () => <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-slate-400">Loading simulator…</div> }
);

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <RocketSimulator />
    </div>
  );
}
