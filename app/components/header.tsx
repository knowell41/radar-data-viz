'use client';

import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                RadarViz Pro
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                NOAA Weather Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/test-radar"
            className="text-sm font-medium text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            API Test
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {/* Status indicator */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="text-xs text-muted-foreground">
              Live Data
            </span>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}