import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { Calendar, ArrowRight } from '../icons.jsx';
import { PageHero, RichText, Img, CtaBand } from '../components/Common.jsx';
import { useSeo, formatDate } from '../utils.js';
import NotFound from './NotFound.jsx';

export function Blog() {
  const { blog } = useContent();
  useSeo('Blog', 'Visa tips, guides and updates from Disha Overseas.');
  const posts = [...blog].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return (
    <>
      <PageHero title="Visa guides and updates" subtitle="Practical advice to help you apply with confidence." />
      <section className="section">
        <div className="container grid grid-3">
          {posts.length === 0 && <p>No articles yet. Please check back soon.</p>}
          {posts.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="card post-card">
              <Img src={p.image} alt="" className="post-img" icon="FileText" />
              <div className="post-body">
                <span className="meta"><Calendar size={14} aria-hidden="true" /> {formatDate(p.date)}</span>
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
                <span className="more">Read article <ArrowRight size={16} aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const { blog, home } = useContent();
  const p = blog.find((b) => b.slug === slug);
  useSeo(p?.title, p?.excerpt);
  if (!p) return <NotFound />;
  return (
    <>
      <PageHero title={p.title} subtitle={`${formatDate(p.date)}${p.author ? ' by ' + p.author : ''}`} />
      <section className="section">
        <div className="container narrow article">
          {p.image && <img src={p.image} alt="" className="article-img" />}
          <RichText text={p.content} />
          <p><Link to="/blog" className="more">Back to all articles</Link></p>
        </div>
      </section>
      <CtaBand data={home.cta} />
    </>
  );
}
