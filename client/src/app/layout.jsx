import { DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: "Rashtriya Nidhi Portal | Government Fund Allocation System",
  description: "Secure transparent fund allocation — Government of India. An official portal for managing and tracking national fund allocations with advanced security and transparency features.",
  applicationName: "Rashtriya Nidhi Portal",
  authors: [{ name: "UjjwalS" }],
  authorUrl: "https://ujjwalsaini.vercel.app/",
  keywords: [
    "Rashtriya Nidhi Portal", "Government Fund Allocation", "National Fund", "India Government", "Fund Management", "Transparent Allocation", "Secure Portal", "Next.js", "React.js", "TypeScript", "TailwindCSS",
  ],
  viewport: "width=device-width, initial-scale=1.0",
  robots: "index, follow",
  themeColor: "#000000",
  referrer: "origin-when-cross-origin",
  category: "government",
  metadataBase: new URL("https://rnp-gov.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rashtriya Nidhi Portal | Government Fund Allocation System",
    description: "Secure transparent fund allocation portal for Government of India, ensuring efficient and accountable fund management.",
    url: "https://rnp-gov.vercel.app/",
    authors: [{ name: "UjjwalS" }],
    authorUrl: "https://ujjwalsaini.vercel.app/",
    siteName: "Rashtriya Nidhi Portal",
    images: [
      {
        url: "/RnpLogo.png",
        width: 800,
        height: 600,
        alt: "Rashtriya Nidhi Portal Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rashtriya Nidhi Portal | Government Fund Allocation System",
    description: "Official portal for secure and transparent national fund allocation by Government of India.",
    creator: "@UjjwalSx007",
    site: "@RashtriyaNidhi",
    images: ["/RnpLogo.png"],
  },
  other: {
    "rating": "General",
    "distribution": "Global",
    "copyright": "Rashtriya Nidhi Portal ©2026",
    "apple-mobile-web-app-title": "Rashtriya Nidhi Portal",
    "apple-mobile-web-app-capable": "yes",
    "http-equiv": "IE=edge",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} bg-gray-50 text-gray-900 antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
