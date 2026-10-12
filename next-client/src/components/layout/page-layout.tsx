import type React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

export interface PageLayoutProps extends Partial<PageHeaderProps> {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({
  title,
  description,
  badge,
  actions,
  children,
  className,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6",
        className,
      )}
    >
      {title && (
        <PageHeader
          title={title}
          description={description}
          badge={badge}
          actions={actions}
        />
      )}
      <div>{children}</div>
    </div>
  );
}
