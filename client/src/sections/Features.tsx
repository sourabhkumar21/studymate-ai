import FeatureCard from "../components/FeatureCard";
import SectionTitle from "../components/SectionTitle";

export default function Features() {
  const features = [
    {
      icon: "📄",
      title: "Smart Syllabus Parsing",
      description:
        "Paste your unstructured syllabus text. Our Gemini AI engine instantly extracts distinct topics and calculates your workload.",
    },
    {
      icon: "🧠",
      title: "Context-Aware AI Tutor",
      description:
        "Chat with an empathetic AI buddy that actually knows your exam dates, current progress, and weak points using RAG technology.",
    },
    {
      icon: "⚡",
      title: "Dynamic Recalibration",
      description:
        "Fell behind? Hit one button to run our round-robin algorithm and perfectly redistribute your pending tasks.",
    },
  ];

  return (
      <section className="relative py-32 px-6">
          <div
  className="absolute inset-0 -z-10"
  style={{
    background:
      "radial-gradient(800px circle at 50% 20%, rgba(6,182,212,0.08), transparent 60%)",
  }}
/>

  <div className="max-w-7xl mx-auto text-center">

        <SectionTitle
          badge="FEATURES"
          title="Built for top-tier students"
          description="Our platform leverages mathematical scheduling algorithms and Retrieval-Augmented Generation to keep you on track."
        />

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

      </div>
    </section>
  );
}