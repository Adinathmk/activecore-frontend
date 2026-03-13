import React from 'react';
import {
  FaInstagram,
  FaPinterest,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaApplePay,
} from 'react-icons/fa';

export default function MinimalWhiteFooter() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .f-root {
          background: #f9f8f6;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          color: #1a1a2e;
          border-top: 1px solid rgba(26,26,46,0.08);
        }

        .f-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 0px;
        }
        @media (max-width: 600px) {
          .f-inner { padding: 0 20px; }
        }

        .f-top {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 30px 0 30px;
          gap: 40px;
        }
        @media (max-width: 700px) {
          .f-top {
            flex-direction: column;
            align-items: flex-start;
            padding: 48px 0 36px;
            gap: 28px;
          }
        }

        .f-wordmark {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .f-wordmark-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          font-weight: 300;
          letter-spacing: -0.025em;
          line-height: 1;
          color: #1a1a2e;
        }
        .f-wordmark-sub {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9090a2;
          font-weight: 400;
        }

        .f-nav {
          display: flex;
          gap: 36px;
          align-items: flex-end;
          padding-bottom: 4px;
        }
        @media (max-width: 500px) {
          .f-nav { gap: 20px; flex-wrap: wrap; }
        }

        .f-nav-link {
          font-size: 11.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7070820;
          text-decoration: none;
          font-weight: 400;
          color: #70708a;
          transition: color 0.2s;
          position: relative;
          padding-bottom: 2px;
        }
        .f-nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1px;
          background: #1a1a2e;
          transition: width 0.25s ease;
        }
        .f-nav-link:hover { color: #1a1a2e; }
        .f-nav-link:hover::after { width: 100%; }

        .f-rule {
          height: 1px;
          background: rgba(26,26,46,0.07);
        }

        .f-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0 22px;
          gap: 20px;
          flex-wrap: wrap;
        }
        @media (max-width: 600px) {
          .f-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
        }

        .f-bottom-left {
          display: flex;
          align-items: center;
          gap: 22px;
        }
        .f-copy {
          font-size: 11px;
          color: #a8a8b8;
          letter-spacing: 0.03em;
        }
        .f-social {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .f-social-link {
          color: #b0b0c2;
          text-decoration: none;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .f-social-link:hover { color: #1a1a2e; }

        .f-payments {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .f-pay-icon {
          color: #c8c8d4;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .f-pay-icon:hover { color: #8a8a9a; }
      `}</style>

      <footer className="f-root">
        <div className="f-inner">

          <div className="f-top">
            <div className="f-wordmark">
              <span className="f-wordmark-name">ActiveCore</span>
              <span className="f-wordmark-sub">Fit for performance, made for you</span>
            </div>
            <nav className="f-nav" aria-label="Footer navigation">
              {[
                { label: 'Shop', href: '/products/men' },
                { label: 'Collections', href: '/products/men' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <a key={label} href={href} className="f-nav-link">{label}</a>
              ))}
            </nav>
          </div>

          <div className="f-rule" />

          <div className="f-bottom">
            <div className="f-bottom-left">
              <span className="f-copy">© 2025 ActiveCore</span>
              <div className="f-social">
                <a href="#" className="f-social-link" aria-label="Instagram">
                  <FaInstagram size={14} />
                </a>
                <a href="#" className="f-social-link" aria-label="Pinterest">
                  <FaPinterest size={14} />
                </a>
              </div>
            </div>
            <div className="f-payments">
              {[FaCcVisa, FaCcMastercard, FaCcPaypal, FaApplePay].map((Icon, i) => (
                <span key={i} className="f-pay-icon"><Icon size={22} /></span>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}