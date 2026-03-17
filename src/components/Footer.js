import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Gas<span>Queue</span></div>
            <p className="footer-desc">Nepal's first digital LPG queue management platform. Find suppliers, book gas, and skip the line — all from your browser.</p>
          </div>
          <div>
            <div className="footer-col-title">Platform</div>
            <Link to="/suppliers" className="footer-link">Find Suppliers</Link>
            <Link to="/blog"      className="footer-link">Blog & News</Link>
            <Link to="/auth"      className="footer-link">Sign In</Link>
            <Link to="/auth?tab=register" className="footer-link">Register</Link>
          </div>
          <div>
            <div className="footer-col-title">Resources</div>
            <span className="footer-link" style={{cursor:'default'}}>Safety Guide</span>
            <span className="footer-link" style={{cursor:'default'}}>FAQ</span>
            <span className="footer-link" style={{cursor:'default'}}>How It Works</span>
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            <span className="footer-link" style={{cursor:'default'}}>About Us</span>
            <span className="footer-link" style={{cursor:'default'}}>Contact</span>
            <span className="footer-link" style={{cursor:'default'}}>Privacy Policy</span>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© {new Date().getFullYear()} GasQueue. All rights reserved.</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div className="navbar-flame" style={{width:28,height:28,fontSize:14}}>🔥</div>
            <span style={{fontFamily:'var(--font-display)',fontSize:'0.95rem',fontWeight:700}}>
              Gas<span style={{color:'var(--flame)'}}>Queue</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
