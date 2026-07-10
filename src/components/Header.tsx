import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Type, User } from 'lucide-react';
import poshanTrackerLogo from '../assets/poshan-tracker-logo.png';

export type Role = 'Supervisor' | 'CDPO' | 'DPO';

interface HeaderProps {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  fontSizeOffset: number;
  setFontSizeOffset: (offset: number) => void;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'Supervisor', label: 'Supervisor (Sector Level)' },
  { value: 'CDPO', label: 'CDPO (Project Level)' },
  { value: 'DPO', label: 'DPO (District Level)' },
];

// Static nav row matching the Poshan Tracker header design (Figma node 24906:6630).
// These items have no corresponding pages in this app, so they render as decorative labels.
const NAV_ITEMS = [
  'Dashboard',
  'Master List',
  'Current Month',
  'Monthly Reports',
  'Supportive Supervision',
  'Data Request',
  'State Connect',
  'Beneficiary Redressal',
  'More',
];

const NAV_ITEMS_WITH_CARET = new Set(['Master List', 'Current Month', 'Monthly Reports', 'More']);

export default function Header({ activeRole, setActiveRole, fontSizeOffset, setFontSizeOffset }: HeaderProps) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [textMenuOpen, setTextMenuOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const textSizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (textSizeRef.current && !textSizeRef.current.contains(event.target as Node)) {
        setTextMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLabel = ROLE_OPTIONS.find((opt) => opt.value === activeRole)?.label ?? '';

  return (
    <header className="app-header">
      {/* Logo: full header height, left column (Figma "image 40" spans both rows) */}
      <div className="brand-section">
        <img src={poshanTrackerLogo} alt="Poshan Tracker" className="poshan-logo" />
      </div>

      <div className="header-right-stack">
        {/* Row 1: role switcher (Figma node 24906:7018, above the divider) */}
        <div className="app-header-top">
          <div className="header-right">
            <div className="text-size-menu" ref={textSizeRef}>
              <button
                className="header-icon-btn"
                title="Text Resizing Tool"
                onClick={() => setTextMenuOpen((open) => !open)}
                aria-expanded={textMenuOpen}
              >
                <Type size={16} />
              </button>

              {textMenuOpen && (
                <div className="text-size-menu-panel">
                  <button className="acc-btn" onClick={() => setFontSizeOffset(-2)} title="Decrease font size">A-</button>
                  <button className="acc-btn" onClick={() => setFontSizeOffset(0)} title="Reset font size">A</button>
                  <button className="acc-btn" onClick={() => setFontSizeOffset(2)} title="Increase font size">A+</button>
                </div>
              )}
            </div>

            <div className="role-switcher" ref={switcherRef}>
              <button
                className="role-switcher-trigger"
                onClick={() => setRoleMenuOpen((open) => !open)}
                aria-expanded={roleMenuOpen}
              >
                <span className="role-switcher-label">{activeLabel}</span>
                <span className="ux4g-avatar ux4g-avatar-s" aria-hidden="true">
                  <User size={16} />
                </span>
                <ChevronDown size={14} style={{ transform: roleMenuOpen ? 'rotate(180deg)' : 'none', transition: 'var(--transition)' }} />
              </button>

              {roleMenuOpen && (
                <div className="role-switcher-menu">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`role-switcher-option ${opt.value === activeRole ? 'active' : ''}`}
                      onClick={() => {
                        setActiveRole(opt.value);
                        setRoleMenuOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: nav menu, right-aligned below the divider (Figma node I24906:7018;23710:56xx) */}
        <nav className="header-nav">
          {NAV_ITEMS.map((item) => (
            <span key={item} className={`header-nav-item ${item === 'Beneficiary Redressal' ? 'active' : ''}`}>
              {item}
              {NAV_ITEMS_WITH_CARET.has(item) && <ChevronDown size={12} />}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
