export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload your syllabus",
      desc: "Give us your exam date and paste the unstructured text from your course syllabus.",
    },
    {
      number: "02",
      title: "AI builds your roadmap",
      desc: "Our engine chunks your syllabus into a day-by-day schedule with a perfectly balanced workload.",
    },
    {
      number: "03",
      title: "Study & Track Progress",
      desc: "Check off tasks, chat with your AI tutor, and hit the adapt button if you fall behind.",
    },
  ];

  return (
    <section className="py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto text-center">

        <p className="text-sm tracking-widest text-blue-400 mb-3">
          HOW IT WORKS
        </p>

        <h2 className="text-4xl md:text-5xl font-bold">
          Get organized in 3 simple steps
        </h2>

        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Stop procrastinating and start studying. We turn chaos into clarity in seconds.
        </p>

        <div className="grid md:grid-cols-3 gap-10 mt-16">
          {steps.map((step) => (
            <div
              key={step.number}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="text-blue-400 text-xl font-bold mb-4">
                {step.number}
              </div>

              <h3 className="text-xl font-semibold mb-3">
                {step.title}
              </h3>

              <p className="text-gray-400">
                {step.desc}
              </p>
            .</div>
          ))}
        </div>

      </div>
    </section>
  );
}