"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type FeatureKey = "pet-tracking" | "health" | "reminders" | "stats" | "dashboard";

type HeaderProps = {
  onSelectFeature?: (key: FeatureKey) => void;
};

const MENU_ID = "features-menu";

export default function Header({ onSelectFeature }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current || !btnRef.current) return;
      const target = e.target as Node;
      if (!menuRef.current.contains(target) && !btnRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  const onKeyDownBtn = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    }
  };

  const onKeyDownMenu = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      close();
      btnRef.current?.focus();
    }
  };

  const openFeature = (key: FeatureKey) => {
    onSelectFeature?.(key);
    close();
  };

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href="/" className="logo">
          PetCare
        </Link>

        <nav className="nav-items">
          <div className="dropdown" ref={menuRef}>
            <button
              ref={btnRef}
              type="button"
              className="nav-link dropdown-toggle"
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls={MENU_ID}
              onClick={toggle}
              onKeyDown={onKeyDownBtn}
            >
              Features
            </button>

            {open && (
              <div
                id={MENU_ID}
                className="dropdown-menu"
                role="menu"
                aria-label="Features"
                onKeyDown={onKeyDownMenu}
              >
                <button className="dropdown-item" role="menuitem" onClick={() => openFeature("pet-tracking")}>
                  Pet Tracking
                </button>
                <button className="dropdown-item" role="menuitem" onClick={() => openFeature("health")}>
                  Health Records
                </button>
                <button className="dropdown-item" role="menuitem" onClick={() => openFeature("reminders")}>
                  Reminders
                </button>
                <button className="dropdown-item" role="menuitem" onClick={() => openFeature("stats")}>
                  Statistics
                </button>
                <button className="dropdown-item" role="menuitem" onClick={() => openFeature("dashboard")}>
                  Dashboard
                </button>

                <Link href="/api/pets" className="dropdown-item" role="menuitem" onClick={close}>
                  API Pets
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
