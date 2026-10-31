import React from 'react';
import { Btn } from '../components/Common.jsx';
import { useSeo } from '../utils.js';

export default function NotFound() {
  useSeo('Page not found');
  return (
    <section className="section">
      <div className="container narrow center-text">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <Btn to="/">Back to home</Btn>
      </div>
    </section>
  );
}
