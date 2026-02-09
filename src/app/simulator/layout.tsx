export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {children}
    </div>
  );
}
