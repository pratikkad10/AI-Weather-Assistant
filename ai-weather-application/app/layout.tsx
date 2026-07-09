import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aether Weather AI",
  description: "Your intelligent weather assistant",
  icons: {
    icon: "/screen.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-hidden h-screen">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-container-lowest text-on-surface font-body-md h-screen w-screen overflow-hidden flex relative selection:bg-primary-container selection:text-on-primary-container">
        {children}
      </body>
    </html>
  );
}
