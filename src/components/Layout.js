import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-content">{children}</main>
    </div>
  );
}
