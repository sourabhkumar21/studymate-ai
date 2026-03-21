export default function Trusted() {
  return (
   // <section className="py-12 border-b border-white/5 opacity-80">
   <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-xs tracking-[0.2em] text-gray-400 mb-8 uppercase font-semibold">
          BUILT WITH A MODERN, ENTERPRISE-GRADE TECH STACK
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-70 hover:grayscale-0 transition-all duration-500">
          {/* Tech Stack Items */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-300">React.js</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-300">Node.js</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-300">PostgreSQL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-300">Prisma</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-300">Google Gemini</span>
          </div>
        </div>
      </div>
    </section>
  );
}