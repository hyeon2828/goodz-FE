import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "Goodz",
  description: "애니 굿즈 탐색 & 방문 플래너",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-background" style={{ fontFamily: "Noto Sans KR, sans-serif" }}>
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
