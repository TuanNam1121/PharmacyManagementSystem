import React, { useState, useEffect } from 'react';

export default function Header() {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();

      if (hours < 12) {
        setGreeting('Good Morning');
      } else if (hours < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }

      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const dateString = now.toLocaleDateString('en-GB', options);
      const timeString = now.toLocaleTimeString('en-GB', { hour12: false });
      setCurrentDateTime(`${dateString} · ${timeString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-header">
      {/* Search Input */}
      <div className="header-search-wrap">
        <input
          type="text"
          className="header-search-input"
          placeholder="Search for anything here.."
        />
        <svg
          className="header-search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* Header Right Actions */}
      <div className="header-actions">
        {/* Language Selector */}
        <div className="lang-selector">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>English (US)</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Greeting & Date Time */}
        <div className="header-greeting">
          <p className="greeting-text">
            <span className="greeting-dot"></span>
            {greeting}
          </p>
          <p className="datetime-text">{currentDateTime || 'Loading date & time...'}</p>
        </div>
      </div>
    </header>
  );
}
