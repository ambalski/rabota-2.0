import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rabota 2.0',
  description: 'Rabota 2.0 Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
