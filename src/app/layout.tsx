import type { Metadata, Viewport } from "next";
import "./globals.css";
import { basePath } from "@/lib/basePath";

export const metadata: Metadata = {
  title: "3RDYUUU",
  description: "Valentine Love Lobby with cozy Gather-like room.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = basePath || "";
  return (
    <html lang="th">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `:root {
              --url-lobby: url('${path}/images/MAP/lobby.png');
              --url-char-straight: url('${path}/images/MAP/char-straight.png');
              --url-char-back: url('${path}/images/MAP/char-back.png');
              --url-char-left: url('${path}/images/MAP/char-left.png');
              --url-char-right: url('${path}/images/MAP/char-right.png');
            }`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Jost:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}

