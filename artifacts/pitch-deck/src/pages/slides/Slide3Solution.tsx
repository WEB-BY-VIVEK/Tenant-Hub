export default function Slide3Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#094d44" }}>
      <div className="absolute top-0 left-0 w-[50vw] h-full" style={{ background: "linear-gradient(135deg, #0d7b6e 0%, #094d44 100%)" }}></div>
      <div className="absolute bottom-0 right-0 w-[55vw] h-[70vh] rounded-tl-[5vw]" style={{ background: "#f4f7f6" }}></div>
      <div className="absolute top-[5vh] left-[5vw]" style={{ width: "3vw", height: "3vw", borderRadius: "50%", background: "rgba(245,158,11,0.25)" }}></div>
      <div className="absolute bottom-[8vh] left-[25vw]" style={{ width: "1.5vw", height: "1.5vw", borderRadius: "50%", background: "rgba(245,158,11,0.4)" }}></div>
      <div className="relative flex h-full">
        <div className="w-[48vw] flex flex-col justify-center px-[6vw] py-[7vh]">
          <p className="font-body font-semibold" style={{ fontSize: "1.5vw", color: "#6ee7de", letterSpacing: "0.1em" }}>THE SOLUTION</p>
          <h2 className="font-display font-black text-white leading-tight tracking-tight mt-[1.5vh]" style={{ fontSize: "4.2vw" }}>
            One Platform.<br />Every Touchpoint.
          </h2>
          <div className="w-[5vw] h-[0.5vh] mt-[2vh] mb-[3vh]" style={{ background: "#f59e0b" }}></div>
          <p className="font-body text-white" style={{ fontSize: "1.7vw", opacity: 0.85, lineHeight: 1.6 }}>
            Clinic Digital Growth is an all-in-one SaaS platform that replaces paper chaos with a smart digital system — giving clinics a queue, a booking portal, and a live analytics dashboard in one place.
          </p>
          <div className="mt-[3.5vh] flex flex-col gap-[1.5vh]">
            <div className="flex items-center gap-[1.5vw]">
              <div className="w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f59e0b" }}>
                <div className="w-[0.7vw] h-[0.7vw] rounded-full" style={{ background: "#094d44" }}></div>
              </div>
              <p className="font-body font-medium text-white" style={{ fontSize: "1.6vw" }}>Smart Token Queue — real-time, paperless</p>
            </div>
            <div className="flex items-center gap-[1.5vw]">
              <div className="w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f59e0b" }}>
                <div className="w-[0.7vw] h-[0.7vw] rounded-full" style={{ background: "#094d44" }}></div>
              </div>
              <p className="font-body font-medium text-white" style={{ fontSize: "1.6vw" }}>Online Booking Portal — accessible 24/7</p>
            </div>
            <div className="flex items-center gap-[1.5vw]">
              <div className="w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f59e0b" }}>
                <div className="w-[0.7vw] h-[0.7vw] rounded-full" style={{ background: "#094d44" }}></div>
              </div>
              <p className="font-body font-medium text-white" style={{ fontSize: "1.6vw" }}>Doctor Analytics Dashboard — act on real data</p>
            </div>
          </div>
        </div>
        <div className="w-[52vw] flex flex-col justify-center items-center pr-[5vw] pl-[2vw] py-[6vh]">
          <div className="w-full rounded-2xl p-[3vw]" style={{ background: "white" }}>
            <p className="font-display font-bold text-text mb-[2.5vh]" style={{ fontSize: "1.7vw" }}>Smart Queue + Booking Flow</p>
            <div className="flex items-center gap-[1.5vw]">
              <div className="flex-1 rounded-xl px-[1.5vw] py-[2vh] text-center" style={{ background: "#f4f7f6" }}>
                <div className="w-[3vw] h-[3vw] rounded-full mx-auto mb-[1vh] flex items-center justify-center" style={{ background: "#0d7b6e" }}>
                  <span className="font-display font-black text-white" style={{ fontSize: "1.5vw" }}>1</span>
                </div>
                <p className="font-display font-semibold text-text" style={{ fontSize: "1.5vw" }}>Patient Scans</p>
                <p className="font-body text-muted mt-[0.5vh]" style={{ fontSize: "1.35vw" }}>QR at clinic or books online</p>
              </div>
              <div style={{ width: "2vw", height: "0.3vh", background: "#0d7b6e" }}></div>
              <div className="flex-1 rounded-xl px-[1.5vw] py-[2vh] text-center" style={{ background: "#f4f7f6" }}>
                <div className="w-[3vw] h-[3vw] rounded-full mx-auto mb-[1vh] flex items-center justify-center" style={{ background: "#0d7b6e" }}>
                  <span className="font-display font-black text-white" style={{ fontSize: "1.5vw" }}>2</span>
                </div>
                <p className="font-display font-semibold text-text" style={{ fontSize: "1.5vw" }}>Gets Token</p>
                <p className="font-body text-muted mt-[0.5vh]" style={{ fontSize: "1.35vw" }}>Instant digital token with wait estimate</p>
              </div>
              <div style={{ width: "2vw", height: "0.3vh", background: "#0d7b6e" }}></div>
              <div className="flex-1 rounded-xl px-[1.5vw] py-[2vh] text-center" style={{ background: "#f4f7f6" }}>
                <div className="w-[3vw] h-[3vw] rounded-full mx-auto mb-[1vh] flex items-center justify-center" style={{ background: "#f59e0b" }}>
                  <span className="font-display font-black text-white" style={{ fontSize: "1.5vw" }}>3</span>
                </div>
                <p className="font-display font-semibold text-text" style={{ fontSize: "1.5vw" }}>Consulted</p>
                <p className="font-body text-muted mt-[0.5vh]" style={{ fontSize: "1.35vw" }}>Doctor calls via dashboard</p>
              </div>
            </div>
            <div className="mt-[2.5vh] pt-[2vh] border-t border-gray-100 flex items-center justify-between">
              <p className="font-body text-muted" style={{ fontSize: "1.4vw" }}>Average wait time reduction</p>
              <p className="font-display font-black" style={{ fontSize: "2.5vw", color: "#0d7b6e" }}>-45%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
