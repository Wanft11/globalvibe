import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GlobalVibe — Localization Studio',
  description: 'An AI-native localization workbench for cross-border marketing.',
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
