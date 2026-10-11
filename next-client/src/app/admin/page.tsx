import { ArrowRight, Database, ExternalLink, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin Dashboard | NestNeXt",
  description: "Platform management and directory operations.",
};

export default function AdminOverviewPage() {
  return (
    <PageLayout
      title="Admin Dashboard"
      description="System overview and quick access to administrative tools."
      actions={
        <Link
          href="/admin/users"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "gap-1.5 text-xs h-8",
          )}
        >
          <Users className="size-3.5" />
          <span>Users</span>
          <ArrowRight className="size-3.5 ml-1" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <div>
                <CardTitle className="text-base">Users Management</CardTitle>
                <CardDescription className="text-xs">
                  Directory of registered users with search, role filters, and
                  sorting.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="border-t bg-muted/10 pt-3 flex justify-end">
            <Link
              href="/admin/users"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1.5 text-xs h-8",
              )}
            >
              <span>Manage Users</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="size-5 text-primary" />
              <div>
                <CardTitle className="text-base">GraphQL API</CardTitle>
                <CardDescription className="text-xs">
                  GraphQL schema, queries, mutations, and playground.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="border-t bg-muted/10 pt-3 flex justify-end">
            <a
              href="http://localhost:4000/graphql"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs h-8",
              )}
            >
              <span>Open Playground</span>
              <ExternalLink className="size-3.5" />
            </a>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
}
