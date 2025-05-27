"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GitPullRequest, Menu, X, Github, User, BarChart2 } from "lucide-react";
import { useSession } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { usePathname } from "next/navigation";

const routes = [
  { name: "Dashboard", path: "/dashboard", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
  { name: "Profile", path: "/profile", icon: <User className="h-4 w-4 mr-2" /> },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path:string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };
  

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        isScrolled
          ? "bg-background/80 backdrop-blur-sm border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <GitPullRequest className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">ShowPR</span>
          </Link>

          <nav className="hidden md:ml-10 md:flex md:items-center md:space-x-6">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "text-sm transition-colors relative py-1", 
                  isActive(route.path)
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {route.name}
                {isActive(route.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          
          <ThemeToggle />

          {status === "authenticated" ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="relative rounded-full h-8 w-8 p-0 overflow-hidden border border-border">
                  <img
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || "U"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  sideOffset={8}
                  align="end"
                  className="z-50 w-56 rounded-md bg-popover p-1 shadow-lg border border-border"
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                  <div className="my-1 border-t border-border" />

                  {routes.map((route) => (
                    <DropdownMenu.Item asChild key={route.path}>
                      <Link
                        href={route.path}
                        className={cn(
                          "cursor-pointer flex items-center px-3 py-2 text-sm hover:bg-muted rounded",
                          isActive(route.path) && "bg-muted font-medium text-foreground"
                        )}
                      >
                        {route.icon}
                        {route.name}
                        {isActive(route.path) && (
                          <span className="ml-auto w-1 h-4 bg-primary rounded-full" />
                        )}
                      </Link>
                    </DropdownMenu.Item>
                  ))}

                  <div className="my-1 border-t border-border" />
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/auth/signout"
                      className="cursor-pointer px-3 py-2 text-sm hover:bg-muted rounded block"
                    >
                      Sign out
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted"
            >
              <Github className="mr-2 h-4 w-4" />
              Sign in
            </Link>
          )}

          <button className="rounded-md p-2 md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 border-t border-border bg-background">
          <nav className="flex flex-col space-y-4">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center py-2 text-base transition-colors",
                  isActive(route.path)
                    ? "text-foreground font-medium relative pl-4 border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground pl-4"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.icon}
                <span>{route.name}</span>
              </Link>
            ))}
            {status !== "authenticated" && (
              <Link
                href="/auth/signin"
                className={cn(
                  "flex items-center py-2 text-base transition-colors",
                  isActive("/auth/signin")
                    ? "text-foreground font-medium relative pl-4 border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground pl-4"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Github className="h-4 w-4 mr-2" />
                <span>Sign in</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}