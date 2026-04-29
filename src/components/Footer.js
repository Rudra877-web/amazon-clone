import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer>
    {/* Back to top */}
    <div
      style={{ background: '#37475A', color: 'white', textAlign: 'center', padding: '14px', cursor: 'pointer', fontSize: 13 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      Back to top
    </div>

    {/* Main footer links */}
    <div style={{ background: '#232F3E', color: 'white', padding: '40px 0 24px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, marginBottom: 32 }}>
          {[
            { title: 'Get to Know Us', links: ['About Us', 'Careers', 'Press Releases', 'Science'] },
            { title: 'Connect with Us', links: ['Facebook', 'Twitter', 'Instagram'] },
            { title: 'Make Money with Us', links: ['Sell on Amazon', 'Sell under Amazon', 'Become an Affiliate', 'Advertise Products'] },
            { title: 'Let Us Help You', links: ['COVID-19 & Amazon', 'Shipping Rates & Policies', 'Returns & Replacements', 'Track Your Package', 'Help'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>{col.title}</h4>
              {col.links.map(link => (
                <div key={link} style={{ marginBottom: 6 }}>
                  <a href="#!" style={{ color: '#ccc', fontSize: 13, textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#ccc'}>{link}</a>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #3a4553', paddingTop: 24, display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>amazon</span>
            <span style={{ fontSize: 10, color: 'var(--amazon-orange)', letterSpacing: 2 }}>CLONE</span>
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            {['Conditions of Use & Sale', 'Privacy Notice', 'Interest-Based Ads'].map(t => (
              <a key={t} href="#!" style={{ color: '#ccc', fontSize: 12 }}>{t}</a>
            ))}
          </div>
          <span style={{ color: '#ccc', fontSize: 12 }}>© 2024 Amazon Clone. Built with React + Node.js + PostgreSQL</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
