import type { ReactNode } from "react";
import Link from "next/link";

export type PageBreadcrumb = {
  href?: string;
  label: string;
};

export default function PageHeader({
  breadcrumbs,
  kicker,
  title,
  copy,
  actions
}: {
  breadcrumbs?: PageBreadcrumb[];
  kicker?: string;
  title: string;
  copy?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="min-w-0">
        {breadcrumbs?.length ? (
          <nav className="page-header__breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span className="inline-flex items-center gap-2 last:text-foreground last:font-medium [&:not(:last-child)]:after:content-['/'] [&:not(:last-child)]:after:text-muted-foreground" key={`${crumb.label}-${index}`}>
                {crumb.href ? <Link className="transition-colors hover:text-foreground" href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
              </span>
            ))}
          </nav>
        ) : kicker ? (
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">{kicker}</div>
        ) : null}
        <h1 className="m-0 text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {copy ? <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{copy}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
