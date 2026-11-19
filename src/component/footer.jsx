export default function Footer() {
  return (
    <footer className="site-footer">
      <p className="site-footer__title">
        🎓 On-Campus Mart - Share, Sell, Save Money in Your College Community
      </p>
      <p className="site-footer__subtext">
        Built for students, by students | Give your old notes a second life!
      </p>
      <nav className="site-footer__links" aria-label="Legal">
        <button type="button" className="site-footer__link" onClick={() => window.__studentMartSetPage && window.__studentMartSetPage('privacy')}>
          Privacy
        </button>
        <button type="button" className="site-footer__link" onClick={() => window.__studentMartSetPage && window.__studentMartSetPage('terms')}>
          Terms
        </button>
        <button type="button" className="site-footer__link" onClick={() => window.__studentMartSetPage && window.__studentMartSetPage('refund')}>
          Refunds
        </button>
        <button type="button" className="site-footer__link" onClick={() => window.__studentMartSetPage && window.__studentMartSetPage('cookies')}>
          Cookies
        </button>
        <button type="button" className="site-footer__link" onClick={() => window.__studentMartSetPage && window.__studentMartSetPage('data-deletion')}>
          Delete account
        </button>
      </nav>
    </footer>
  );
}
