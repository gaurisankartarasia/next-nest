import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/provider";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "NestNeXt Auth | Secure Authentication & Authorization",
  description:
    "Full-stack authentication system with NestJS GraphQL, Prisma ORM v8, PostgreSQL, Next.js 16, Redux Toolkit, and shadcn/ui.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("h-full", "antialiased")}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
