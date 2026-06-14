import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RumahHub Property Management",
  description: "Property management dashboard for landlords"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
