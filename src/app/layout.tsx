// ============================================
// NutriLens - Root Layout
// App-wide layout with navigation and metadata
// ============================================

import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'NutriLens — AI-Powered Food & Nutrition Tracker',
  description:
    'Scan food with AI, track your nutrition, get personalized meal plans, and discover healthy restaurants nearby. Built with Google Gemini & Vision AI.',
  keywords: ['nutrition', 'food tracker', 'AI', 'meal planner', 'health', 'calorie counter'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main
          id="main-content"
          className="relative z-10 min-h-screen pt-4 md:pt-24 pb-24 md:pb-8 px-4 md:px-6"
          tabIndex={-1}
        >
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
