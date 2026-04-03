const base = import.meta.env.BASE_URL;

export default function Slide1Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <img
        src={`${base}hero-clinic.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Modern clinic interior"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(9,77,68,0.88) 0%, rgba(13,123,110,0.70) 55%, rgba(9,77,68,0.50) 100%)" }}></div>
      <div className="absolute inset-0 flex flex-col justify-between px-[7vw] py-[6vh]">
        <div className="flex items-center gap-[1.2vw]">
          <div className="w-[2.5vw] h-[2.5vw] rounded-full bg-accent flex items-center justify-center">
            <div className="w-[1.3vw] h-[1.3vw] rounded-full bg-teal-dark"></div>
          </div>
          <span className="font-display font-semibold text-white" style={{ fontSize: "1.6vw", letterSpacing: "0.05em" }}>
            CLINIC DIGITAL GROWTH
          </span>
        </div>
        <div>
          <div className="mb-[2.5vh]">
            <div className="w-[6vw] h-[0.5vh] bg-accent mb-[3vh]"></div>
            <h1 className="font-display font-black text-white leading-none tracking-tight" style={{ fontSize: "7vw" }}>
              The Digital
            </h1>
            <h1 className="font-display font-black leading-none tracking-tight" style={{ fontSize: "7vw", color: "#6ee7de" }}>
              Operating System
            </h1>
            <h1 className="font-display font-black text-white leading-none tracking-tight" style={{ fontSize: "7vw" }}>
              for Modern Clinics
            </h1>
          </div>
          <p className="font-body text-white" style={{ fontSize: "1.8vw", opacity: 0.85 }}>
            Clinic Digital Growth — Smart Queue. Online Booking. Real Insights.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-body text-white" style={{ fontSize: "1.5vw", opacity: 0.6 }}>
            Investor Pitch Deck  •  2026
          </p>
          <div className="flex items-center gap-[0.8vw]">
            <div className="w-[0.8vw] h-[0.8vw] rounded-full bg-accent"></div>
            <div className="w-[0.8vw] h-[0.8vw] rounded-full bg-white opacity-40"></div>
            <div className="w-[0.8vw] h-[0.8vw] rounded-full bg-white opacity-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
