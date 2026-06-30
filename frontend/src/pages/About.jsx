import DashboardHeader from "@/components/workout/DashboardHeader";

export default function About() {
  return (
    <div className="noise relative min-h-screen">
      <div className="relative z-10 max-w-[1000px] mx-auto px-5 sm:px-8 py-8">
        <DashboardHeader today={null} onOpenSettings={() => {}} />

        <section className="mt-6 text-white">
          <h2 className="font-display font-bold text-2xl mb-4">About</h2>
          <p className="body-1 text-white/80">
            Stride is a focused workout logging app built to help you
            maintain consistency. Track workouts, plan weekly routines, and
            monitor progress over time.
          </p>

          <div className="mt-6">
            <h3 className="font-semibold">Purpose</h3>
            <p className="text-white/80">
              This app is designed as a lightweight daily ritual tracker to
              encourage small, consistent steps toward fitness goals.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
