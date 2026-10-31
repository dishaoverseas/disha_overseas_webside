import React, { createContext, useContext } from 'react';
// All website content lives in content/content.json.
// The admin panel edits it (via SQLite) and publishes it to GitHub, which triggers a Netlify rebuild.
import data from '../content/content.json';

const Ctx = createContext(data);
export const ContentProvider = ({ children }) => <Ctx.Provider value={data}>{children}</Ctx.Provider>;
export const useContent = () => useContext(Ctx);
