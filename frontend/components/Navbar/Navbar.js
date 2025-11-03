'use client';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="navbar is-primary">
      <div className="navbar-brand">
        <Link href="/" className="navbar-item has-text-weight-bold">AI-E-Learning</Link>
      </div>
      <div className="navbar-end">
        {status === 'loading' ? (
          <span className="navbar-item">Ładowanie...</span>
        ) : session ? (
          <>
            <Link href="/dashboard" className="navbar-item">Panel</Link>
            <button onClick={() => signOut()} className="button is-light m-2">Wyloguj</button>
          </>
        ) : (
          <Link href="/login" className="navbar-item">Zaloguj</Link>
        )}
      </div>
    </nav>
  );
}
