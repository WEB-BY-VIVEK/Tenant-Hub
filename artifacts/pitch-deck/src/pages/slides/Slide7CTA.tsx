export default function Slide7CTA() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#081e1b" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 30% 50%, rgba(13,123,110,0.35) 0%, transparent 70%)" }}></div>
      <div className="absolute top-0 right-0 w-[45vw] h-full" style={{ background: "linear-gradient(135deg, rgba(9,77,68,0.4) 0%, rgba(8,30,27,0.9) 100%)" }}></div>
      <div className="absolute top-[6vh] right-[6vw] w-[15vw] h-[15vw] rounded-full" style={{ background: "rgba(245,158,11,0.07)" }}></div>
      <div className="absolute bottom-[8vh] right-[20vw] w-[8vw] h-[8vw] rounded-full" style={{ background: "rgba(245,158,11,0.05)" }}></div>
      <div className="relative flex flex-col justify-between h-full px-[7vw] py-[7vh]">
        <div className="flex items-center gap-[1.2vw]">
          <div className="w-[2.5vw] h-[2.5vw] rounded-full flex items-center justify-center" style={{ background: "#f59e0b" }}>
            <div className="w-[1.2vw] h-[1.2vw] rounded-full" style={{ background: "#081e1b" }}></div>
          </div>
          <span className="font-display font-semibold text-white" style={{ fontSize: "1.6vw", letterSpacing: "0.05em", opacity: 0.9 }}>
            CLINIC DIGITAL GROWTH
          </span>
        </div>
        <div>
          <div className="w-[6vw] h-[0.5vh] mb-[3vh]" style={{ background: "#f59e0b" }}></div>
          <h2 className="font-display font-black text-white leading-none tracking-tight" style={{ fontSize: "7.5vw" }}>
            Ready to Go
          </h2>
          <h2 className="font-display font-black leading-none tracking-tight" style={{ fontSize: "7.5vw", color: "#6ee7de" }}>
            Digital?
          </h2>
          <p className="font-body text-white mt-[3vh]" style={{ fontSize: "1.8vw", opacity: 0.75, maxWidth: "45vw" }}>
            Join hundreds of clinics transforming patient experience with smart queuing and online booking.
          </p>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-[1.5vh]">
            <div className="flex items-center gap-[1.5vw]">
              <div className="w-[1.5vw] h-[1.5vw] rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)" }}>
                <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: "#f59e0b" }}></div>
              </div>
              <p className="font-body text-white" style={{ fontSize: "1.7vw", opacity: 0.85 }}>www.clinicdigitalgrowth.in</p>
            </div>
            <div className="flex items-center gap-[1.5vw]">
              <div className="w-[1.5vw] h-[1.5vw] rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)" }}>
                <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: "#f59e0b" }}></div>
              </div>
              <p className="font-body text-white" style={{ fontSize: "1.7vw", opacity: 0.85 }}>hello@clinicdigitalgrowth.in</p>
            </div>
            <div className="flex items-center gap-[1.5vw]">
              <div className="w-[1.5vw] h-[1.5vw] rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)" }}>
                <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: "#f59e0b" }}></div>
              </div>
              <p className="font-body text-white" style={{ fontSize: "1.7vw", opacity: 0.85 }}>+91 98765 43210</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display font-black" style={{ fontSize: "3vw", color: "#f59e0b" }}>Get Started</p>
            <p className="font-body text-white mt-[0.5vh]" style={{ fontSize: "1.6vw", opacity: 0.65 }}>Free 14-day trial, no card required</p>
          </div>
        </div>
      </div>
    </div>
  );
}
