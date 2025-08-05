import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { DefaultSeo } from 'next-seo';
// import SEO from '../next-seo.config';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "YPG - Presbyterian Young People's Guild",
  description: "Empowering young people aged 18-30 in faith, leadership, and community service",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <DefaultSeo {...SEO} /> */}
        {children}
      </body>
    </html>
  );
}
