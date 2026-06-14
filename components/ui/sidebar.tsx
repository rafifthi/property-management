"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";

type SidebarContextValue = {
  isMobile: boolean;
  open: boolean;
  openMobile: boolean;
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  state: "expanded" | "collapsed";
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    });
  };
}

function Slot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  children: React.ReactElement<{ className?: string; ref?: React.Ref<HTMLElement> }>;
}) {
  return React.cloneElement(children, {
    ...props,
    className: cn(className, children.props.className),
    ref: mergeRefs((props as { ref?: React.Ref<HTMLElement> }).ref, children.props.ref)
  });
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

export function SidebarProvider({
  children,
  className,
  defaultOpen = true,
  onOpenChange,
  open: openProp,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, openProp]
  );

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 820px)");
    const syncMobile = () => setIsMobile(media.matches);

    syncMobile();
    media.addEventListener("change", syncMobile);

    return () => media.removeEventListener("change", syncMobile);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        if (isMobile) {
          setOpenMobile((current) => !current);
        } else {
          setOpen(!open);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, open, setOpen]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      isMobile,
      open,
      openMobile,
      setOpen,
      setOpenMobile,
      state: open ? "expanded" : "collapsed",
      toggleSidebar: () => {
        if (isMobile) {
          setOpenMobile((current) => !current);
        } else {
          setOpen(!open);
        }
      }
    }),
    [isMobile, open, openMobile, setOpen]
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        className={cn("ui-sidebar-provider", className)}
        data-mobile-open={openMobile ? "true" : "false"}
        data-state={open ? "expanded" : "collapsed"}
        style={style}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export const Sidebar = React.forwardRef<
  HTMLElement,
  React.ComponentProps<"aside"> & {
    collapsible?: "offcanvas" | "icon" | "none";
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
  }
>(({ children, className, collapsible = "offcanvas", side = "left", variant = "sidebar", ...props }, ref) => (
  <aside
    className={cn("ui-sidebar", className)}
    data-collapsible={collapsible}
    data-side={side}
    data-variant={variant}
    ref={ref}
    {...props}
  >
    {children}
  </aside>
));
Sidebar.displayName = "Sidebar";

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => <div className={cn("ui-sidebar__header", className)} ref={ref} {...props} />
);
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => <div className={cn("ui-sidebar__content", className)} ref={ref} {...props} />
);
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => <div className={cn("ui-sidebar__footer", className)} ref={ref} {...props} />
);
SidebarFooter.displayName = "SidebarFooter";

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => <div className={cn("ui-sidebar-group", className)} ref={ref} {...props} />
);
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => <div className={cn("ui-sidebar-group__label", className)} ref={ref} {...props} />
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => <div className={cn("ui-sidebar-group__content", className)} ref={ref} {...props} />
);
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => <ul className={cn("ui-sidebar-menu", className)} ref={ref} {...props} />
);
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li className={cn("ui-sidebar-menu__item", className)} ref={ref} {...props} />
);
SidebarMenuItem.displayName = "SidebarMenuItem";

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
  }
>(({ asChild, children, className, isActive, type = "button", ...props }, ref) => {
  const classNames = cn("ui-sidebar-menu__button", isActive && "is-active", className);

  if (asChild && React.isValidElement(children)) {
    return (
      <Slot className={classNames} data-active={isActive ? "true" : "false"} {...(props as React.HTMLAttributes<HTMLElement>)}>
        {children as React.ReactElement<{ className?: string; ref?: React.Ref<HTMLElement> }>}
      </Slot>
    );
  }

  return (
    <button className={classNames} data-active={isActive ? "true" : "false"} ref={ref} type={type} {...props}>
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarMenuAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, type = "button", ...props }, ref) => (
    <button className={cn("ui-sidebar-menu__action", className)} ref={ref} type={type} {...props} />
  )
);
SidebarMenuAction.displayName = "SidebarMenuAction";

export const SidebarMenuBadge = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className, ...props }, ref) => <span className={cn("ui-sidebar-menu__badge", className)} ref={ref} {...props} />
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

export const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => <ul className={cn("ui-sidebar-menu__sub", className)} ref={ref} {...props} />
);
SidebarMenuSub.displayName = "SidebarMenuSub";

export const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li className={cn("ui-sidebar-menu__sub-item", className)} ref={ref} {...props} />
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

export const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean;
    isActive?: boolean;
  }
>(({ asChild, children, className, isActive, ...props }, ref) => {
  const classNames = cn("ui-sidebar-menu__sub-button", isActive && "is-active", className);

  if (asChild && React.isValidElement(children)) {
    return (
      <Slot className={classNames} data-active={isActive ? "true" : "false"} {...(props as React.HTMLAttributes<HTMLElement>)}>
        {children as React.ReactElement<{ className?: string; ref?: React.Ref<HTMLElement> }>}
      </Slot>
    );
  }

  return <a className={classNames} data-active={isActive ? "true" : "false"} ref={ref} {...props} />;
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, type = "button", ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <button
        aria-label="Toggle sidebar"
        className={cn("ui-sidebar__rail", className)}
        onClick={toggleSidebar}
        ref={ref}
        type={type}
        {...props}
      />
    );
  }
);
SidebarRail.displayName = "SidebarRail";

export const SidebarInset = React.forwardRef<HTMLElement, React.ComponentProps<"main">>(
  ({ className, ...props }, ref) => <main className={cn("ui-sidebar-inset", className)} ref={ref} {...props} />
);
SidebarInset.displayName = "SidebarInset";

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ children, className, type = "button", ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <button
        aria-label="Toggle sidebar"
        className={cn("ui-sidebar-trigger", className)}
        onClick={toggleSidebar}
        ref={ref}
        type={type}
        {...props}
      >
        {children ?? <PanelLeft size={17} />}
      </button>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";
