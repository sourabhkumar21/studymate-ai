import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export default function Button({ children, variant = "primary" }: ButtonProps) {
  const base =
    "px-6 py-3 rounded-xl font-medium transition-all duration-300";

  const styles = {
    primary:
      "text-white hover:scale-[1.02]",
    secondary:
      "border border-white/10 text-white hover:bg-white/5",
  };

  return (
    <button
      className={`${base} ${styles[variant]}`}
      style={
        variant === "primary"
          ? {
              background:
                "linear-gradient(90deg, #22d3ee, #3b82f6)",
              boxShadow: "0 0 80px rgba(6,182,212,0.55)",
            }
          : {}
      }
    >
      {children}
    </button>
  );
}