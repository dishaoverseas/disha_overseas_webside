import React, { createContext, useContext } from 'react';
// On the live server the content is injected into the page (window.__CONTENT__), so admin changes show instantly.
// When running "npm run dev" on your own computer, content/content.json is used instead.
import fallback from '../content/content.json';

const data = (typeof window !== 'undefined' && window.__CONTENT__) || fallback;
const Ctx = createContext(data);
export const ContentProvider = ({ children }) => <Ctx.Provider value={data}>{children}</Ctx.Provider>;
export const useContent = () => useContext(Ctx);