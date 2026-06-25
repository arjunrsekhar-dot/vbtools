import type { Metadata } from "next";
import { AppProvider } from "@/components/AppProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageLoadingIndicator } from "@/components/PageLoadingIndicator";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: { default: "Voltbean Tools — Find the right tool for any problem", template: "%s — Voltbean Tools" },
  description: "A curated software directory for finding the right tool for your work, team, and budget."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var key = "voltbean_theme";
                function storedTheme() {
                  try {
                    var value = window.localStorage.getItem(key);
                    return value === "dark" || value === "light" ? value : "light";
                  } catch (error) {
                    return "light";
                  }
                }
                function applyTheme(theme) {
                  document.documentElement.dataset.theme = theme;
                  try { window.localStorage.setItem(key, theme); } catch (error) {}
                }
                applyTheme(storedTheme());
                document.addEventListener("click", function (event) {
                  if (document.documentElement.dataset.reactReady === "true") return;
                  var target = event.target instanceof Element ? event.target.closest("[data-theme-toggle]") : null;
                  if (target) {
                    applyTheme((document.documentElement.dataset.theme || "light") === "dark" ? "light" : "dark");
                    return;
                  }
                  var navLink = event.target instanceof Element ? event.target.closest(".main-nav a") : null;
                  var menu = document.getElementById("mobile-menu-toggle");
                  if (navLink && menu) menu.checked = false;
                });
              })();
            `
          }}
        />
        <AppProvider>
          <Header />
          <PageLoadingIndicator />
          <main>{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
