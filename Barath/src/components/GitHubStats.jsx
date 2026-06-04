import React, { useEffect, useState } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import 'react-github-calendar/tooltips.css';
import TypingHeader from './TypingHeader';
import './GitHubStats.css';

const GITHUB_USERNAME = 'barathfiless';
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

function GitHubStats() {
  const [colorScheme, setColorScheme] = useState('light');
  const [selectedYear, setSelectedYear] = useState('last');

  useEffect(() => {
    const root = document.documentElement;

    const syncTheme = () => {
      setColorScheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  const currentYear = new Date().getFullYear();
  const startYear = 2023;
  const years = ['last'];
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y);
  }

  return (
    <section id="github-stats" className="msci-github-stats-section">
      <div className="container">
        <div className="msci-github-stats-header">
          <TypingHeader text="GitHub Stats" className="msci-github-stats-title" />
          <h3 className="msci-github-stats-subtitle">
            Insights into coding activity, contributions, and development growth
          </h3>
        </div>

        <div className="msci-github-stats-card">
          <div className="msci-github-stats-card-top">
            <div className="msci-github-stats-years">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`msci-github-stats-year-btn ${selectedYear === year ? 'active' : ''}`}
                >
                  {year === 'last' ? 'Last Year' : year}
                </button>
              ))}
            </div>

            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="msci-github-stats-profile-link"
            >
              @{GITHUB_USERNAME}
            </a>
          </div>

          <div className="msci-github-stats-calendar-wrap">
            <GitHubCalendar
              username={GITHUB_USERNAME}
              colorScheme={colorScheme}
              fontSize={13}
              blockSize={12}
              blockMargin={4}
              showTotalCount
              showWeekdayLabels
              year={selectedYear}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default GitHubStats;
