import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <p className="site-footer__title">
        <GraduationCap size={18} strokeWidth={1.8} aria-hidden="true" />
        On-Campus Mart
      </p>
      <p className="site-footer__subtext">
        A practical marketplace for your college community
      </p>
    </footer>
  );
}
