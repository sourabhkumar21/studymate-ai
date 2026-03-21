import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode | string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      className="p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
      style={{
        background: "rgba(17, 24, 39, 0.85)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      <div className="text-3xl mb-4 text-blue-400">
        {icon}
      </div>

      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>

      <p className="text-slate-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}