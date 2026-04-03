export default function Slide6Pricing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#f4f7f6" }}>
      <div className="absolute top-0 left-0 w-full h-[0.8vh]" style={{ background: "linear-gradient(90deg, #f59e0b, #0d7b6e)" }}></div>
      <div className="absolute bottom-0 right-0 w-[40vw] h-[50vh] rounded-tl-[5vw]" style={{ background: "rgba(13,123,110,0.05)" }}></div>
      <div className="relative flex flex-col h-full px-[6vw] py-[5vh]">
        <div className="mb-[2.5vh]">
          <p className="font-body font-semibold" style={{ fontSize: "1.5vw", color: "#0d7b6e", letterSpacing: "0.1em" }}>PRICING</p>
          <h2 className="font-display font-black text-text leading-tight tracking-tight mt-[0.5vh]" style={{ fontSize: "4vw" }}>
            Transparent Pricing for Every Clinic
          </h2>
        </div>
        <div className="flex-1 flex gap-[2.5vw] items-stretch">
          <div className="flex-1 flex flex-col rounded-2xl px-[2.5vw] py-[3vh]" style={{ background: "white", border: "2px solid #e5e7eb" }}>
            <p className="font-body font-semibold text-muted" style={{ fontSize: "1.5vw", letterSpacing: "0.08em" }}>MONTHLY</p>
            <div className="mt-[1.5vh] flex items-baseline gap-[0.5vw]">
              <span className="font-display font-black text-text" style={{ fontSize: "1.8vw" }}>&#8377;</span>
              <span className="font-display font-black text-text" style={{ fontSize: "5.5vw", lineHeight: 1 }}>999</span>
              <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>/mo</span>
            </div>
            <div className="w-full h-[0.3vh] mt-[2vh] mb-[2.5vh]" style={{ background: "#e5e7eb" }}></div>
            <div className="flex flex-col gap-[1.5vh] flex-1">
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold" style={{ fontSize: "1.5vw", color: "#0d7b6e" }}>+</span>
                <p className="font-body text-text" style={{ fontSize: "1.5vw" }}>Smart Token Queue</p>
              </div>
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold" style={{ fontSize: "1.5vw", color: "#0d7b6e" }}>+</span>
                <p className="font-body text-text" style={{ fontSize: "1.5vw" }}>Online Booking Portal</p>
              </div>
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold" style={{ fontSize: "1.5vw", color: "#0d7b6e" }}>+</span>
                <p className="font-body text-text" style={{ fontSize: "1.5vw" }}>Basic Analytics</p>
              </div>
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold" style={{ fontSize: "1.5vw", color: "#0d7b6e" }}>+</span>
                <p className="font-body text-text" style={{ fontSize: "1.5vw" }}>WhatsApp Notifications</p>
              </div>
            </div>
            <div className="mt-[2.5vh] pt-[2vh] border-t border-gray-100">
              <p className="font-body text-muted" style={{ fontSize: "1.4vw" }}>Cancel anytime, no lock-in</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col rounded-2xl px-[2.5vw] py-[2.5vh] relative" style={{ background: "#0d7b6e" }}>
            <div className="flex items-center justify-between mb-[1vh]">
              <p className="font-body font-semibold text-white" style={{ fontSize: "1.5vw", letterSpacing: "0.08em", opacity: 0.8 }}>QUARTERLY</p>
              <span className="font-display font-bold text-white px-[1.2vw] py-[0.4vh] rounded-full" style={{ fontSize: "1.2vw", background: "#f59e0b" }}>
                BEST VALUE
              </span>
            </div>
            <div className="mt-[1.5vh] flex items-baseline gap-[0.5vw]">
              <span className="font-display font-black text-white" style={{ fontSize: "1.8vw" }}>&#8377;</span>
              <span className="font-display font-black text-white" style={{ fontSize: "5.5vw", lineHeight: 1 }}>2,499</span>
            </div>
            <p className="font-body text-white mt-[0.5vh]" style={{ fontSize: "1.5vw", opacity: 0.75 }}>3 months — save &#8377;498</p>
            <div className="w-full h-[0.3vh] mt-[2vh] mb-[2.5vh]" style={{ background: "rgba(255,255,255,0.2)" }}></div>
            <div className="flex flex-col gap-[1.5vh] flex-1">
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold text-white" style={{ fontSize: "1.5vw" }}>+</span>
                <p className="font-body text-white" style={{ fontSize: "1.5vw" }}>Everything in Monthly</p>
              </div>
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold text-white" style={{ fontSize: "1.5vw" }}>+</span>
                <p className="font-body text-white" style={{ fontSize: "1.5vw" }}>Advanced Analytics Reports</p>
              </div>
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold text-white" style={{ fontSize: "1.5vw" }}>+</span>
                <p className="font-body text-white" style={{ fontSize: "1.5vw" }}>Priority Support</p>
              </div>
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold text-white" style={{ fontSize: "1.5vw" }}>+</span>
                <p className="font-body text-white" style={{ fontSize: "1.5vw" }}>Custom Clinic Branding</p>
              </div>
            </div>
            <div className="mt-[2.5vh] pt-[2vh]" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <p className="font-body text-white" style={{ fontSize: "1.4vw", opacity: 0.75 }}>Best value for growing clinics</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col rounded-2xl px-[2.5vw] py-[3vh]" style={{ background: "white", border: "2px solid #0d7b6e" }}>
            <p className="font-body font-semibold" style={{ fontSize: "1.5vw", letterSpacing: "0.08em", color: "#0d7b6e" }}>YEARLY</p>
            <div className="mt-[1.5vh] flex items-baseline gap-[0.5vw]">
              <span className="font-display font-black text-text" style={{ fontSize: "1.8vw" }}>&#8377;</span>
              <span className="font-display font-black text-text" style={{ fontSize: "5.5vw", lineHeight: 1 }}>9,999</span>
            </div>
            <p className="font-body text-muted mt-[0.5vh]" style={{ fontSize: "1.5vw" }}>12 months — save &#8377;1,989</p>
            <div className="w-full h-[0.3vh] mt-[2vh] mb-[2.5vh]" style={{ background: "#e5e7eb" }}></div>
            <div className="flex flex-col gap-[1.5vh] flex-1">
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold" style={{ fontSize: "1.5vw", color: "#0d7b6e" }}>+</span>
                <p className="font-body text-text" style={{ fontSize: "1.5vw" }}>Everything in Quarterly</p>
              </div>
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold" style={{ fontSize: "1.5vw", color: "#0d7b6e" }}>+</span>
                <p className="font-body text-text" style={{ fontSize: "1.5vw" }}>Multi-Doctor Support</p>
              </div>
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold" style={{ fontSize: "1.5vw", color: "#0d7b6e" }}>+</span>
                <p className="font-body text-text" style={{ fontSize: "1.5vw" }}>Dedicated Account Manager</p>
              </div>
              <div className="flex items-center gap-[1vw]">
                <span className="font-body font-bold" style={{ fontSize: "1.5vw", color: "#0d7b6e" }}>+</span>
                <p className="font-body text-text" style={{ fontSize: "1.5vw" }}>API Integrations + Data Export</p>
              </div>
            </div>
            <div className="mt-[2.5vh] pt-[2vh] border-t border-gray-100">
              <p className="font-body" style={{ fontSize: "1.4vw", color: "#f59e0b", fontWeight: 600 }}>Includes &#8377;2,999 Setup Package free</p>
            </div>
          </div>
        </div>
        <div className="mt-[2.5vh] rounded-xl px-[2.5vw] py-[1.5vh] flex items-center gap-[2vw]" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <div className="w-[1.5vw] h-[1.5vw] rounded-full flex-shrink-0" style={{ background: "#f59e0b" }}></div>
          <p className="font-body font-medium text-text" style={{ fontSize: "1.55vw" }}>
            Setup Package (&#8377;2,999 one-time): Includes QR standee, display screen setup, staff training — everything to go live in 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}
