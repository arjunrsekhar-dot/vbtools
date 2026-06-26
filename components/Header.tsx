"use client";

import Link from "next/link";
import { Bookmark, ChevronDown, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { useApp } from "@/components/AppProvider";

export function Header() {
  const { user, saved, toggleTheme, logout } = useApp();
  const [userMenu, setUserMenu] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "DEVELOPER" ? "/developer" : "/dashboard";
  const closeMenus = useCallback(() => {
    setUserMenu(false);
    const mobileMenu = document.getElementById("mobile-menu-toggle");
    if (mobileMenu instanceof HTMLInputElement) {
      mobileMenu.checked = false;
    }
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && headerRef.current?.contains(target)) return;
      closeMenus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [closeMenus]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container header-inner">
        <Logo />
        <input id="mobile-menu-toggle" className="mobile-menu-checkbox" type="checkbox" aria-label="Toggle menu" />
        <nav className="main-nav" aria-label="Main navigation" onClick={closeMenus}>
          <Link href="/tools">Browse tools</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/deals">Deals <span className="nav-dot" /></Link>
          <Link href="/submit">Submit a tool</Link>
          {!user && (
            <div className="mobile-auth-actions">
              <Link href="/login" className="text-button">Log in</Link>
              <Link href="/register" className="button button-dark button-sm">Join free</Link>
            </div>
          )}
        </nav>
        <div className="header-actions">
          <Link href="/tools" className="icon-button header-search" aria-label="Search tools">
            <Search size={19} />
          </Link>
          <button
            type="button"
            className="icon-button theme-toggle"
            data-theme-toggle
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            <Moon className="theme-icon theme-icon-moon" size={18} />
            <Sun className="theme-icon theme-icon-sun" size={18} />
          </button>
          {user ? (
            <>
              <Link href="/saved" className="icon-button saved-button" aria-label="Saved tools" onClick={closeMenus}>
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
                    <Link href={dashboardHref} onClick={closeMenus}>Dashboard</Link>
                    <Link href="/saved" onClick={closeMenus}>Saved tools</Link>
                    <button
                      onClick={() => {
                        closeMenus();
                        logout();
                      }}
                    >
                      Log out
                    </button>
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
          <label className="mobile-menu-button" htmlFor="mobile-menu-toggle" aria-label="Toggle menu">
            <Menu className="menu-icon-open" />
            <X className="menu-icon-close" />
          </label>
        </div>
      </div>
    </header>
  );
}
