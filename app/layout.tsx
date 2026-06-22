import type { Metadata } from "next";
import { AppProvider } from "@/components/AppProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: { default: "Voltbean Tools — Find the right tool for any problem", template: "%s — Voltbean Tools" },
  description: "A curated software directory for finding the right tool for your work, team, and budget."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
