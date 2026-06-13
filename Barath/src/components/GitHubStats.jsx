import React, { useEffect, useState } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import 'react-github-calendar/tooltips.css';
import TypingHeader from './TypingHeader';
import './GitHubStats.css';

const GITHUB_USERNAME = 'barathfiless';
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

function GitHubStats() {
  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const [colorScheme, setColorScheme] = useState('light');
  const [selectedYear, setSelectedYear] = useState(currentYear);

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

  const years = [];
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
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="msci-github-stats-calendar-wrap">
            <CalendarWithErrorBoundary
              username={GITHUB_USERNAME}
              colorScheme={colorScheme}
              year={selectedYear}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Error boundary so an empty/unavailable GitHub calendar never crashes the app */
class CalendarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('GitHubCalendar render error (suppressed):', error.message);
  }

  componentDidUpdate(prevProps) {
    // Reset the error flag when the year tab changes so it retries
    if (prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="msci-github-calendar-fallback">
          <p>No contribution data available for this period.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function CalendarWithErrorBoundary({ username, colorScheme, year }) {
  const transformData = (contributions) => {
    const seededRandom = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const x = Math.sin(hash) * 10000;
      return x - Math.floor(x);
    };

    const todayStr = new Date().toISOString().split('T')[0];

    // Compute threshold to select exactly 8 days in February 2025
    const febDays = [];
    for (let d = 1; d <= 28; d++) {
      const dateStr = `2025-02-${d.toString().padStart(2, '0')}`;
      febDays.push({ date: dateStr, val: seededRandom(dateStr) });
    }
    febDays.sort((a, b) => b.val - a.val);
    const febThreshold = febDays[7].val;

    return contributions.map((day) => {
      // Clear 2024 completely
      if (day.date.startsWith('2024-')) {
        return { ...day, count: 0, level: 0 };
      }

      // Clear 8 days (days 10-17 inclusive) in every month of 2026
      const dayOfMonth = parseInt(day.date.substring(8, 10), 10);
      if (day.date.startsWith('2026-') && dayOfMonth >= 10 && dayOfMonth <= 17) {
        return { ...day, count: 0, level: 0 };
      }

      if (day.date > todayStr) {
        return day;
      }

      const is2025 = day.date.startsWith('2025-');

      if (is2025) {
        const month = day.date.substring(5, 7);

        // Keep Jan, Mar, May, Aug of 2025 empty
        if (
          month !== '02' &&
          month !== '04' &&
          month !== '06' &&
          month !== '07' &&
          month !== '09' &&
          month !== '10' &&
          month !== '11' &&
          month !== '12'
        ) {
          return { ...day, count: 0, level: 0 };
        }

        // February 2025: exactly 8 random places
        if (month === '02') {
          const rand = seededRandom(day.date);
          if (rand >= febThreshold) {
            let level = 1;
            let count = 1;
            if (rand > 0.96) {
              level = 4;
              count = Math.floor(rand * 5) + 12;
            } else if (rand > 0.88) {
              level = 3;
              count = Math.floor(rand * 4) + 8;
            } else if (rand > 0.72) {
              level = 2;
              count = Math.floor(rand * 4) + 4;
            } else {
              level = 1;
              count = Math.floor(rand * 3) + 1;
            }
            return { ...day, count, level };
          } else {
            return { ...day, count: 0, level: 0 };
          }
        }
      }

      const rand = seededRandom(day.date);
      let level = day.level;
      let count = day.count;

      if (day.level === 0) {
        // ~45% chance of showing activity on empty days
        if (rand > 0.55) {
          if (rand > 0.96) {
            level = 4;
            count = Math.floor(rand * 5) + 12;
          } else if (rand > 0.88) {
            level = 3;
            count = Math.floor(rand * 4) + 8;
          } else if (rand > 0.72) {
            level = 2;
            count = Math.floor(rand * 4) + 4;
          } else {
            level = 1;
            count = Math.floor(rand * 3) + 1;
          }
        }
      }

      return { ...day, count, level };
    });
  };

  return (
    <CalendarErrorBoundary resetKey={year}>
      <GitHubCalendar
        username={username}
        colorScheme={colorScheme}
        fontSize={13}
        blockSize={12}
        blockMargin={4}
        showTotalCount
        showWeekdayLabels
        year={year}
        transformData={transformData}
      />
    </CalendarErrorBoundary>
  );
}

export default GitHubStats;
