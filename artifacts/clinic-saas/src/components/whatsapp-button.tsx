import { useLocation } from "wouter";

const WHATSAPP_NUMBER = "919560990946";
const PREFILLED_MESSAGE = "Hello Clinic Digital Growth, I am interested in your clinic website and QR booking system. Please share more details.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`;

const HIDDEN_PATHS = ["/admin", "/dashboard"];

export function WhatsAppButton() {
  const [location] = useLocation();
  if (HIDDEN_PATHS.some((p) => location.startsWith(p))) return null;
  return (
    <>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="whatsapp-fab"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="28"
          height="28"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="whatsapp-fab-tooltip">Chat with us</span>
      </a>

      <style>{`
        .whatsapp-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: #25D366;
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.5);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
        }

        .whatsapp-fab:hover {
          transform: scale(1.12);
          box-shadow: 0 6px 24px rgba(37, 211, 102, 0.65);
        }

        .whatsapp-fab:active {
          transform: scale(0.96);
        }

        .whatsapp-fab-tooltip {
          position: absolute;
          right: 64px;
          background: #111827;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          padding: 6px 12px;
          border-radius: 8px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          font-family: sans-serif;
        }

        .whatsapp-fab-tooltip::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-left-color: #111827;
        }

        .whatsapp-fab:hover .whatsapp-fab-tooltip {
          opacity: 1;
        }

        @media (max-width: 640px) {
          .whatsapp-fab {
            bottom: 16px;
            right: 16px;
            width: 50px;
            height: 50px;
          }
          .whatsapp-fab-tooltip {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
