interface SectionTitleProps {
  badge?: string;
  title: string;
  description?: string;
  center?: boolean;
}

export default function SectionTitle({
  badge,
  title,
  description,
  center = true,
}: SectionTitleProps) {
  return (
    <div
      className={`max-w-3xl ${
        center ? "mx-auto text-center" : ""
      } mb-16`}
    >
      {badge && (
        <p className="text-blue-400 text-sm tracking-widest mb-3">
          {badge}
        </p>
      )}

      <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
        {title}
      </h2>

      {description && (
        <p className="text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}