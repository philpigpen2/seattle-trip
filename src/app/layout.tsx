import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const arcade = Press_Start_2P({ variable: "--font-arcade", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Phil Laney",
  description: "Personal apps & projects.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
      // The Clerk application is still named after the trip tracker, so the
      // sign-in card says so unless it is overridden here.
      localization={{
        signIn: {
          start: { title: "Sign in", subtitle: "philiplaney.com" },
          password: { title: "Enter your password", subtitle: "philiplaney.com" },
          emailCode: { title: "Check your email", subtitle: "philiplaney.com" },
        },
      }}
      appearance={{
        variables: {
          colorPrimary: "#ffd166",
          colorBackground: "#12122e",
          colorText: "#f4f1ea",
          colorTextSecondary: "#b9b2e0",
          colorInputBackground: "#1c1c3e",
          colorInputText: "#f4f1ea",
          borderRadius: "2px",
        },
      }}
    >
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${arcade.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
