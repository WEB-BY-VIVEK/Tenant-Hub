export default function Slide2Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#f4f7f6" }}>
      <div className="absolute top-0 right-0 w-[38vw] h-full" style={{ background: "linear-gradient(160deg, #0d7b6e 0%, #094d44 100%)" }}></div>
      <div className="absolute top-[4vh] right-[2vw] w-[35vw] h-[92vh] rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}></div>
      <div className="relative flex flex-col h-full px-[6vw] py-[6vh]">
        <div className="mb-[2vh]">
          <p className="font-body font-semibold" style={{ fontSize: "1.5vw", color: "#0d7b6e", letterSpacing: "0.1em" }}>THE PROBLEM</p>
          <h2 className="font-display font-black text-text leading-tight tracking-tight" style={{ fontSize: "4vw" }}>
            Clinics Are Running<br />on Paper & Guesswork
          </h2>
          <div className="w-[5vw] h-[0.5vh] mt-[1.5vh]" style={{ background: "#f59e0b" }}></div>
        </div>
        <div className="flex-1 flex items-center gap-[4vw]">
          <div className="flex-1 flex flex-col gap-[2.5vh]">
            <div className="bg-white rounded-2xl px-[2.5vw] py-[2.5vh] shadow-sm border border-gray-100">
              <p className="font-display font-black" style={{ fontSize: "5.5vw", color: "#0d7b6e", lineHeight: 1 }}>70%</p>
              <p className="font-body font-medium text-text mt-[0.5vh]" style={{ fontSize: "1.6vw" }}>
                of Indian clinics still manage patient queues with paper tokens
              </p>
            </div>
            <div className="flex gap-[2vw]">
              <div className="flex-1 bg-white rounded-2xl px-[2vw] py-[2vh] shadow-sm border border-gray-100">
                <div className="w-[2vw] h-[2vw] rounded-lg mb-[1vh] flex items-center justify-center" style={{ background: "#fef3c7" }}>
                  <div className="w-[1vw] h-[1vw] rounded" style={{ background: "#f59e0b" }}></div>
                </div>
                <p className="font-display font-bold text-text" style={{ fontSize: "1.7vw" }}>Long Wait Times</p>
                <p className="font-body text-muted mt-[0.5vh]" style={{ fontSize: "1.5vw" }}>No visibility into queue status — patients leave frustrated</p>
              </div>
              <div className="flex-1 bg-white rounded-2xl px-[2vw] py-[2vh] shadow-sm border border-gray-100">
                <div className="w-[2vw] h-[2vw] rounded-lg mb-[1vh] flex items-center justify-center" style={{ background: "#fef3c7" }}>
                  <div className="w-[1vw] h-[1vw] rounded" style={{ background: "#f59e0b" }}></div>
                </div>
                <p className="font-display font-bold text-text" style={{ fontSize: "1.7vw" }}>No Digital Presence</p>
                <p className="font-body text-muted mt-[0.5vh]" style={{ fontSize: "1.5vw" }}>Clinics invisible to patients searching online</p>
              </div>
            </div>
          </div>
          <div className="w-[28vw] flex flex-col justify-center items-center text-white">
            <div className="w-full rounded-2xl px-[2.5vw] py-[3vh]" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="w-[2.5vw] h-[2.5vw] rounded-full mb-[1.5vh]" style={{ background: "#f59e0b" }}></div>
              <p className="font-display font-bold text-white" style={{ fontSize: "2vw" }}>Lost Patients</p>
              <p className="font-body text-white mt-[1vh]" style={{ fontSize: "1.55vw", opacity: 0.85 }}>
                Without online booking, clinics miss walk-ins who book competitors digitally
              </p>
              <div className="mt-[2.5vh] pt-[2vh] border-t border-white border-opacity-20">
                <p className="font-display font-black text-white" style={{ fontSize: "3vw" }}>3x</p>
                <p className="font-body text-white mt-[0.3vh]" style={{ fontSize: "1.5vw", opacity: 0.75 }}>more likely to lose patients without digital booking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
