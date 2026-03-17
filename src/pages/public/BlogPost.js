import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import { blogAPI } from '../../api';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const [post, setPost]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogAPI.getBySlug(slug)
      .then(r => setPost(r.data.data.post))
      .catch(() => navigate('/blog'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return <div><PublicNav /><div className="loading-screen"><div className="spinner" /></div></div>;
  if (!post) return null;

  return (
    <div>
      <PublicNav />
      <div style={{ paddingTop: 68 }}>
        <div className="blog-post-hero">
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Link to="/blog" style={{ color: 'var(--text-3)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>← Back to Blog</Link>
            <div className="blog-post-meta">
              <span className="badge badge-flame">{post.category}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                By {post.author_name} · {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>👁 {post.views} views</span>
            </div>
            <h1 className="blog-post-title">{post.title}</h1>
            {post.excerpt && <p style={{ fontSize: '1.1rem', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 680 }}>{post.excerpt}</p>}
          </div>
        </div>

        <div className="blog-post-content">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          <div style={{ marginTop: 52, paddingTop: 32, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{post.author_name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>GasQueue Platform</div>
            </div>
            <Link to="/blog" className="btn btn-ghost btn-sm">← More Posts</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
