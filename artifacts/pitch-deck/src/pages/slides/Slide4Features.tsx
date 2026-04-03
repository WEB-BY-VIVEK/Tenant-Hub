export default function Slide4Features() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#f4f7f6" }}>
      <div className="absolute top-0 left-0 w-full h-[1vh]" style={{ background: "linear-gradient(90deg, #0d7b6e, #f59e0b)" }}></div>
      <div className="absolute top-[8vh] right-[4vw] w-[20vw] h-[20vw] rounded-full" style={{ background: "rgba(13,123,110,0.06)" }}></div>
      <div className="relative flex flex-col h-full px-[6vw] py-[5vh]">
        <div className="mb-[3vh]">
          <p className="font-body font-semibold" style={{ fontSize: "1.5vw", color: "#0d7b6e", letterSpacing: "0.1em" }}>KEY FEATURES</p>
          <h2 className="font-display font-black text-text leading-tight tracking-tight mt-[0.5vh]" style={{ fontSize: "4vw" }}>
            Built for the Modern Indian Clinic
          </h2>
        </div>
        <div className="flex-1 flex gap-[2.5vw] items-stretch">
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden" style={{ background: "white", boxShadow: "0 2px 24px rgba(13,123,110,0.08)" }}>
            <div className="px-[2.5vw] pt-[3vh] pb-[2vh]" style={{ background: "#0d7b6e" }}>
              <div className="w-[3vw] h-[3vw] rounded-xl mb-[1.5vh] flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <div className="w-[1.5vw] h-[1.5vw] rounded" style={{ background: "#f59e0b" }}></div>
              </div>
              <p className="font-display font-black text-white" style={{ fontSize: "2.2vw" }}>Smart Token Queue</p>
            </div>
            <div className="flex-1 px-[2.5vw] py-[2.5vh] flex flex-col gap-[1.5vh]">
              <div className="flex items-start gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full mt-[0.6vh] flex-shrink-0" style={{ background: "#0d7b6e" }}></div>
                <p className="font-body text-text" style={{ fontSize: "1.55vw" }}>QR-scan token generation at clinic entrance</p>
              </div>
              <div className="flex items-start gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full mt-[0.6vh] flex-shrink-0" style={{ background: "#0d7b6e" }}></div>
                <p className="font-body text-text" style={{ fontSize: "1.55vw" }}>Live queue status on waiting-room display</p>
              </div>
              <div className="flex items-start gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full mt-[0.6vh] flex-shrink-0" style={{ background: "#0d7b6e" }}></div>
                <p className="font-body text-text" style={{ fontSize: "1.55vw" }}>SMS/WhatsApp alerts for next-in-queue</p>
              </div>
              <div className="mt-auto pt-[2vh] border-t border-gray-100">
                <p className="font-display font-black" style={{ fontSize: "2.5vw", color: "#0d7b6e" }}>Zero Paper</p>
                <p className="font-body text-muted" style={{ fontSize: "1.4vw" }}>Completely paperless workflow</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden" style={{ background: "white", boxShadow: "0 2px 24px rgba(13,123,110,0.08)" }}>
            <div className="px-[2.5vw] pt-[3vh] pb-[2vh]" style={{ background: "#f59e0b" }}>
              <div className="w-[3vw] h-[3vw] rounded-xl mb-[1.5vh] flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                <div className="w-[1.5vw] h-[1.5vw] rounded" style={{ background: "#094d44" }}></div>
              </div>
              <p className="font-display font-black text-white" style={{ fontSize: "2.2vw" }}>Online Booking Portal</p>
            </div>
            <div className="flex-1 px-[2.5vw] py-[2.5vh] flex flex-col gap-[1.5vh]">
              <div className="flex items-start gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full mt-[0.6vh] flex-shrink-0" style={{ background: "#f59e0b" }}></div>
                <p className="font-body text-text" style={{ fontSize: "1.55vw" }}>Custom clinic page accessible via link or Google</p>
              </div>
              <div className="flex items-start gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full mt-[0.6vh] flex-shrink-0" style={{ background: "#f59e0b" }}></div>
                <p className="font-body text-text" style={{ fontSize: "1.55vw" }}>Appointment slots, doctor info, fees visible</p>
              </div>
              <div className="flex items-start gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full mt-[0.6vh] flex-shrink-0" style={{ background: "#f59e0b" }}></div>
                <p className="font-body text-text" style={{ fontSize: "1.55vw" }}>WhatsApp confirmation on booking</p>
              </div>
              <div className="mt-auto pt-[2vh] border-t border-gray-100">
                <p className="font-display font-black" style={{ fontSize: "2.5vw", color: "#f59e0b" }}>24 / 7</p>
                <p className="font-body text-muted" style={{ fontSize: "1.4vw" }}>Patients book any time, anywhere</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden" style={{ background: "white", boxShadow: "0 2px 24px rgba(13,123,110,0.08)" }}>
            <div className="px-[2.5vw] pt-[3vh] pb-[2vh]" style={{ background: "#094d44" }}>
              <div className="w-[3vw] h-[3vw] rounded-xl mb-[1.5vh] flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div className="w-[1.5vw] h-[1.5vw] rounded" style={{ background: "#6ee7de" }}></div>
              </div>
              <p className="font-display font-black text-white" style={{ fontSize: "2.2vw" }}>Analytics Dashboard</p>
            </div>
            <div className="flex-1 px-[2.5vw] py-[2.5vh] flex flex-col gap-[1.5vh]">
              <div className="flex items-start gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full mt-[0.6vh] flex-shrink-0" style={{ background: "#094d44" }}></div>
                <p className="font-body text-text" style={{ fontSize: "1.55vw" }}>Daily patient volume and peak hour charts</p>
              </div>
              <div className="flex items-start gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full mt-[0.6vh] flex-shrink-0" style={{ background: "#094d44" }}></div>
                <p className="font-body text-text" style={{ fontSize: "1.55vw" }}>Revenue tracking and appointment conversion rates</p>
              </div>
              <div className="flex items-start gap-[1vw]">
                <div className="w-[0.6vw] h-[0.6vw] rounded-full mt-[0.6vh] flex-shrink-0" style={{ background: "#094d44" }}></div>
                <p className="font-body text-text" style={{ fontSize: "1.55vw" }}>No-show patterns and returning patient metrics</p>
              </div>
              <div className="mt-auto pt-[2vh] border-t border-gray-100">
                <p className="font-display font-black" style={{ fontSize: "2.5vw", color: "#094d44" }}>Live Data</p>
                <p className="font-body text-muted" style={{ fontSize: "1.4vw" }}>Decisions backed by real numbers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
