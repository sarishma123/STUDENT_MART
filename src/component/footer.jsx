import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const goTo = (page) => {
    navigate(page);
  };

  return (
    <footer className="site-footer">
      <p className="site-footer__title">
        🎓 On-Campus Mart - Share, Sell, Save Money in Your College Community
      </p>
      <p className="site-footer__subtext">
        Built for students, by students | Give your old notes a second life!
      </p>
      <nav className="site-footer__links" aria-label="Legal">
        <button type="button" className="site-footer__link" onClick={() => goTo('/privacy')}>
          Privacy
        </button>
        <button type="button" className="site-footer__link" onClick={() => goTo('/terms')}>
          Terms
        </button>
        <button type="button" className="site-footer__link" onClick={() => goTo('/refund')}>
          Refunds
        </button>
        <button type="button" className="site-footer__link" onClick={() => goTo('/cookies')}>
          Cookies
        </button>
        <button type="button" className="site-footer__link" onClick={() => goTo('/data-deletion')}>
          Delete account
        </button>
      </nav>
    </footer>
  );
}
