export default function Slide5HowItWorks() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0d7b6e" }}>
      <div className="absolute top-0 right-0 w-[45vw] h-full" style={{ background: "linear-gradient(135deg, rgba(9,77,68,0.5) 0%, rgba(9,77,68,0.95) 100%)" }}></div>
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full" style={{ background: "rgba(255,255,255,0.04)", transform: "translate(-50%, 50%)" }}></div>
      <div className="absolute top-[10vh] right-[8vw] w-[18vw] h-[18vw] rounded-full" style={{ background: "rgba(245,158,11,0.08)" }}></div>
      <div className="relative flex flex-col h-full px-[7vw] py-[6vh]">
        <div className="mb-[3.5vh]">
          <p className="font-body font-semibold" style={{ fontSize: "1.5vw", color: "#f59e0b", letterSpacing: "0.1em" }}>HOW IT WORKS</p>
          <h2 className="font-display font-black text-white leading-tight tracking-tight mt-[0.5vh]" style={{ fontSize: "4vw" }}>
            From QR Scan to<br />Consultation in 3 Steps
          </h2>
          <div className="w-[5vw] h-[0.5vh] mt-[2vh]" style={{ background: "#f59e0b" }}></div>
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-full flex gap-[3vw]">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-[2vw] mb-[2vh]">
                <div className="w-[5vw] h-[5vw] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f59e0b" }}>
                  <span className="font-display font-black text-white" style={{ fontSize: "2.5vw" }}>1</span>
                </div>
                <div className="flex-1 h-[0.3vh]" style={{ background: "rgba(255,255,255,0.2)" }}></div>
              </div>
              <div className="rounded-2xl px-[2.5vw] py-[3vh] flex-1" style={{ background: "rgba(255,255,255,0.1)" }}>
                <p className="font-display font-bold text-white" style={{ fontSize: "2.2vw" }}>Patient Scans QR</p>
                <p className="font-body text-white mt-[1.5vh]" style={{ fontSize: "1.6vw", opacity: 0.85, lineHeight: 1.6 }}>
                  Patient scans the clinic's QR code at entrance — or books online via the clinic's portal link. No app download required.
                </p>
                <div className="mt-[2.5vh] inline-block rounded-lg px-[1.5vw] py-[0.8vh]" style={{ background: "rgba(245,158,11,0.2)" }}>
                  <p className="font-body font-semibold" style={{ fontSize: "1.5vw", color: "#fcd34d" }}>Works on any smartphone</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-[2vw] mb-[2vh]">
                <div className="w-[5vw] h-[5vw] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <span className="font-display font-black text-white" style={{ fontSize: "2.5vw" }}>2</span>
                </div>
                <div className="flex-1 h-[0.3vh]" style={{ background: "rgba(255,255,255,0.2)" }}></div>
              </div>
              <div className="rounded-2xl px-[2.5vw] py-[3vh] flex-1" style={{ background: "rgba(255,255,255,0.1)" }}>
                <p className="font-display font-bold text-white" style={{ fontSize: "2.2vw" }}>Token Confirmed</p>
                <p className="font-body text-white mt-[1.5vh]" style={{ fontSize: "1.6vw", opacity: 0.85, lineHeight: 1.6 }}>
                  Patient receives a digital token with their queue number and estimated wait time via WhatsApp. Live updates keep them informed.
                </p>
                <div className="mt-[2.5vh] inline-block rounded-lg px-[1.5vw] py-[0.8vh]" style={{ background: "rgba(245,158,11,0.2)" }}>
                  <p className="font-body font-semibold" style={{ fontSize: "1.5vw", color: "#fcd34d" }}>No waiting room confusion</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-[2vw] mb-[2vh]">
                <div className="w-[5vw] h-[5vw] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f59e0b" }}>
                  <span className="font-display font-black text-white" style={{ fontSize: "2.5vw" }}>3</span>
                </div>
                <div className="flex-1 h-[0.3vh] opacity-0"></div>
              </div>
              <div className="rounded-2xl px-[2.5vw] py-[3vh] flex-1" style={{ background: "rgba(255,255,255,0.1)" }}>
                <p className="font-display font-bold text-white" style={{ fontSize: "2.2vw" }}>Doctor Calls Patient</p>
                <p className="font-body text-white mt-[1.5vh]" style={{ fontSize: "1.6vw", opacity: 0.85, lineHeight: 1.6 }}>
                  Doctor's dashboard shows live queue. One tap calls next patient. Consultation notes auto-logged. Dashboard updates in real time.
                </p>
                <div className="mt-[2.5vh] inline-block rounded-lg px-[1.5vw] py-[0.8vh]" style={{ background: "rgba(245,158,11,0.2)" }}>
                  <p className="font-body font-semibold" style={{ fontSize: "1.5vw", color: "#fcd34d" }}>Analytics captured automatically</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
