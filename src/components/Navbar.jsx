import React from 'react';

export default function Navbar() {
  return (
    <header className="navbar-header">
      <nav className="nav-container">
        <div className="logo">Portfolio<span>.dev</span></div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
        </ul>
      </nav>
    </header>
  );
}