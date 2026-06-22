"use client";

import Link from "next/link";
import { Bookmark, ChevronDown, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useApp } from "@/components/AppProvider";

export function Header() {
  const { user, saved, logout } = useApp();
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "DEVELOPER" ? "/developer" : "/dashboard";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
          <Link href="/tools" onClick={() => setOpen(false)}>Browse tools</Link>
          <Link href="/categories" onClick={() => setOpen(false)}>Categories</Link>
          <Link href="/deals" onClick={() => setOpen(false)}>Deals <span className="nav-dot" /></Link>
          <Link href="/submit" onClick={() => setOpen(false)}>Submit a tool</Link>
        </nav>
        <div className="header-actions">
          <Link href="/tools" className="icon-button header-search" aria-label="Search tools">
            <Search size={19} />
          </Link>
          {user ? (
            <>
              <Link href="/saved" className="icon-button saved-button" aria-label="Saved tools">
                <Bookmark size={19} />
                {saved.length > 0 && <span className="saved-count">{saved.length}</span>}
              </Link>
              <div className="user-menu-wrap">
                <button className="profile-button" onClick={() => setUserMenu(!userMenu)}>
                  <span className="avatar">{user.name.charAt(0)}</span>
                  <span className="profile-copy">
                    <strong>{user.name.split(" ")[0]}</strong>
                    <small>{user.role.toLowerCase()}</small>
                  </span>
                  <ChevronDown size={15} />
                </button>
                {userMenu && (
                  <div className="user-dropdown">
                    <Link href={dashboardHref}>Dashboard</Link>
                    <Link href="/saved">Saved tools</Link>
                    <button onClick={logout}>Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-button">Log in</Link>
              <Link href="/register" className="button button-dark button-sm">Join free</Link>
            </>
          )}
          <button className="mobile-menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
