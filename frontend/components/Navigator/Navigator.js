'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigator() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="button is-primary is-small"
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 1000 }}
      >
        ☰ Menu
      </button>

      {isOpen && (
        <div
          className="modal is-active"
          onClick={() => setIsOpen(false)}
        >
          <div className="modal-background"></div>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-card-head">
              <p className="modal-card-title">Navigation</p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => setIsOpen(false)}
              ></button>
            </header>
            <section className="modal-card-body">
              <aside className="menu">
                <p className="menu-label">General</p>
                <ul className="menu-list">
                  <li><Link href="/" onClick={() => setIsOpen(false)}>Home</Link></li>
                  <li><Link href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
                </ul>
                <p className="menu-label">Learning</p>
                <ul className="menu-list">
                  <li><Link href="/lessons" onClick={() => setIsOpen(false)}>Lessons</Link></li>
                  <li><Link href="/ai-chat" onClick={() => setIsOpen(false)}>AI Chat</Link></li>
                </ul>
              </aside>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
