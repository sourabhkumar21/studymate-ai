export default function Title({ heading, description }: { heading: string; description: string }) {
  return (
    <div className="text-center mb-12">
      <h1 className="text-3xl md:text-4xl font-bold text-white">
        {heading}
      </h1>

      <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
}