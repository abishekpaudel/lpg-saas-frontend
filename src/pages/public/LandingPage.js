import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import { supplierAPI, blogAPI } from '../../api';

const CATEGORY_ICONS = { 'General':'📰', 'Safety & Tips':'🛡️', 'Company News':'📣', 'Industry':'🏭' };

export default function LandingPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [blogs, setBlogs]         = useState([]);

  useEffect(() => {
    supplierAPI.getAll({ approved: true, limit: 6 }).then(r => setSuppliers(r.data.data || [])).catch(()=>{});
    blogAPI.getPublished({ limit: 3 }).then(r => setBlogs(r.data.data || [])).catch(()=>{});
  }, []);

  return (
    <div>
      <PublicNav />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div>
            <div className="hero-eyebrow">🔥 Nepal's #1 LPG Platform</div>
            <h1 className="hero-title">
              Skip the Queue.<br />
              Get Your Gas <span className="accent">Delivered.</span>
            </h1>
            <p className="hero-subtitle">
              Find verified LPG suppliers near you, book online in seconds, and track your real-time queue position — all without leaving your home.
            </p>
            <div className="hero-actions">
              <Link to="/suppliers" className="btn btn-flame btn-lg">🔍 Find Gas Near Me</Link>
              <Link to="/auth?tab=register" className="btn btn-ghost btn-lg">Create Free Account</Link>
            </div>
            <div className="hero-stats">
              {[
                { num:'500+', label:'Happy Customers' },
                { num:'12',   label:'Active Suppliers' },
                { num:'2,400+', label:'Deliveries Done' },
              ].map(s => (
                <div key={s.label}>
                  <div className="hero-stat-num">{s.num}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orb">
              <div className="hero-orb-inner">🔥</div>
            </div>
            <div className="hero-float-card hero-float-1">
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:'1.5rem'}}>🎉</span>
                <div>
                  <div style={{fontWeight:600,fontSize:'0.85rem'}}>Queue Position #1</div>
                  <div style={{color:'var(--text-3)',fontSize:'0.75rem'}}>You're next! Prepare for delivery</div>
                </div>
              </div>
            </div>
            <div className="hero-float-card hero-float-2">
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:'var(--flame-glow)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>📦</div>
                <div>
                  <div style={{fontWeight:600,fontSize:'0.82rem'}}>14.2 kg Cylinder</div>
                  <div style={{color:'var(--flame)',fontSize:'0.78rem',fontWeight:600}}>NPR 1,850 · Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header" style={{textAlign:'center',alignItems:'center',display:'flex',flexDirection:'column'}}>
            <div className="section-eyebrow">How It Works</div>
            <h2 className="section-title" style={{textAlign:'center'}}>Gas Booking in 4 Simple Steps</h2>
            <p className="section-subtitle" style={{textAlign:'center',maxWidth:520}}>From finding your nearest supplier to tracking your delivery — GasQueue makes the entire process effortless.</p>
          </div>
          <div className="steps-grid">
            {[
              { n:'01', icon:'🔍', title:'Find Supplier', text:'Browse verified LPG suppliers near your area. Compare prices, ratings, and availability at a glance.' },
              { n:'02', icon:'📱', title:'Create Account', text:'Register free in seconds. As a customer you get instant access — no waiting for approval.' },
              { n:'03', icon:'🛒', title:'Book Your Gas', text:'Select your cylinder type, confirm the quantity, and join the digital queue instantly.' },
              { n:'04', icon:'🚚', title:'Track & Receive', text:'Watch your live queue position update in real time. Get notified when your delivery is ready.' },
            ].map(s => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-text">{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPLIERS ── */}
      {suppliers.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <div className="section-header flex-between" style={{alignItems:'flex-end'}}>
              <div>
                <div className="section-eyebrow">Verified Suppliers</div>
                <h2 className="section-title">Available Near You</h2>
                <p className="section-subtitle">All suppliers are verified and approved. Real-time stock and queue info.</p>
              </div>
              <Link to="/suppliers" className="btn btn-outline-flame">View All →</Link>
            </div>
            <div className="suppliers-grid">
              {suppliers.slice(0,6).map(s => (
                <Link to={`/suppliers/${s.id}`} className="supplier-card" key={s.id}>
                  <div className="supplier-card-header">
                    <div className="supplier-icon">🏪</div>
                    <div style={{flex:1}}>
                      <div className="supplier-name">{s.business_name}</div>
                      <div className="supplier-city">📍 {s.city || s.address || 'Nepal'}</div>
                    </div>
                    <div className={`supplier-open ${s.is_open ? 'open' : 'closed'}`}>
                      {s.is_open ? '● Open' : '● Closed'}
                    </div>
                  </div>
                  <div className="supplier-card-body">
                    <div className="supplier-meta">
                      <div className="supplier-meta-item">⭐ {Number(s.avg_rating||0).toFixed(1)} ({s.total_reviews})</div>
                      <div className="supplier-meta-item">🚚 {s.total_deliveries} deliveries</div>
                    </div>
                  </div>
                  <div className="supplier-card-footer">
                    <span style={{fontSize:'0.8rem',color:'var(--text-3)'}}>⏰ {s.opening_hours||'08:00–18:00'}</span>
                    <span style={{fontSize:'0.8rem',color:'var(--flame)',fontWeight:600}}>View Stock →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY GASQUEUE ── */}
      <section className="section section-alt">
        <div className="section-inner">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'}}>
            <div>
              <div className="section-eyebrow">Why GasQueue</div>
              <h2 className="section-title">The Smarter Way to Get Your LPG</h2>
              <p className="section-subtitle" style={{marginBottom:32}}>We built GasQueue because we experienced the frustration of long queues first-hand. Technology should make this simple.</p>
              {[
                { icon:'⚡', title:'Real-Time Queue', text:'See your exact position in queue, updated live. No more guessing.' },
                { icon:'🔒', title:'Verified Suppliers', text:'Every supplier is approved by our admin team. Zero counterfeits.' },
                { icon:'💰', title:'Transparent Pricing', text:'All prices are listed upfront. No hidden charges, ever.' },
                { icon:'📊', title:'Digital Receipts', text:'Full booking history and payment records always at your fingertips.' },
              ].map(f => (
                <div key={f.title} style={{display:'flex',gap:14,marginBottom:22}}>
                  <div style={{width:44,height:44,borderRadius:'var(--r-md)',background:'var(--flame-glow)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0}}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{fontWeight:600,marginBottom:4}}>{f.title}</div>
                    <div style={{fontSize:'0.85rem',color:'var(--text-2)',lineHeight:1.6}}>{f.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {[
                { icon:'🏪', label:'Verified Agencies', value:'12+', color:'var(--flame-glow)' },
                { icon:'📦', label:'Cylinders Delivered', value:'2,400+', color:'var(--green-dim)' },
                { icon:'👥', label:'Happy Customers', value:'500+', color:'var(--blue-dim)' },
                { icon:'⭐', label:'Average Rating', value:'4.7/5', color:'var(--gold-dim)' },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{textAlign:'center'}}>
                  <div className="stat-icon" style={{background:s.color,margin:'0 auto 14px',justifyContent:'center'}}>{s.icon}</div>
                  <div className="stat-value" style={{color:'var(--flame)'}}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      {blogs.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <div className="section-header flex-between" style={{alignItems:'flex-end'}}>
              <div>
                <div className="section-eyebrow">From the Blog</div>
                <h2 className="section-title">News & LPG Insights</h2>
                <p className="section-subtitle">Tips, updates, and everything LPG from our team.</p>
              </div>
              <Link to="/blog" className="btn btn-outline-flame">All Posts →</Link>
            </div>
            <div className="blog-grid">
              {blogs.map(b => (
                <Link to={`/blog/${b.slug}`} className="blog-card" key={b.id}>
                  <div className="blog-card-cover">
                    <span>{CATEGORY_ICONS[b.category] || '📰'}</span>
                    <div className="blog-card-cover-overlay" />
                    <div className="blog-card-category">{b.category}</div>
                  </div>
                  <div className="blog-card-body">
                    <div className="blog-card-title">{b.title}</div>
                    <div className="blog-card-excerpt">{b.excerpt}</div>
                  </div>
                  <div className="blog-card-footer">
                    <span className="blog-card-author">By {b.author_name}</span>
                    <span className="blog-card-read">Read More →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section style={{padding:'80px 40px',background:'linear-gradient(135deg,var(--ink-3),var(--ink-4))',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <div style={{maxWidth:700,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:16}}>🔥</div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:900,letterSpacing:'-0.02em',marginBottom:14}}>
            Ready to Never Wait in Line Again?
          </h2>
          <p style={{color:'var(--text-2)',marginBottom:32,fontSize:'1rem',lineHeight:1.7}}>
            Join hundreds of households across Nepal who have made the switch to digital LPG booking. It's free, it's fast, and it works.
          </p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/auth?tab=register" className="btn btn-flame btn-lg">Create Free Account →</Link>
            <Link to="/suppliers" className="btn btn-ghost btn-lg">Browse Suppliers</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
