"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const { user} = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(
    NAV_DATA[user?.role || ""].map((section) => section.label)
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    setExpandedSections(NAV_DATA[user?.role||""].map((section)=>section.label));
  }, [user?.role]);

  useEffect(() => {
    NAV_DATA[user?.role || ""].some((section) => {
      return section.items.some((item) => {
        return item.items.some((subItem) => {
          if (subItem.url === pathname) {
            if (!expandedSections.includes(section.label)) {
              toggleSection(section.label);
            }
            return true;
          }
        });
      });
    });
  }, [pathname]);

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? (isCollapsed ? "w-[80px]" : "w-[290px]") : "w-0"
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div
          className={cn(
            "flex h-full flex-col py-10 pr-[7px]",
            isCollapsed ? "pl-[10px]" : "pl-[25px]"
          )}
        >
          <div className="relative pr-4.5 flex items-center justify-between">
            {!isCollapsed && (
              <Link
                href={"/"}
                onClick={() => isMobile && toggleSidebar()}
                className="px-0 py-2.5 min-[850px]:py-0"
              >
                <Logo />
              </Link>
            )}

            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon
                className={cn(
                  "size-6 transition-transform",
                  isCollapsed && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
          </div>

          <div
            className={cn(
              "custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10"
            )}
          >
            {NAV_DATA[user?.role || ""].map((section) => (
              <div key={section.label} className="mb-6">
                <button
                  onClick={() => toggleSection(section.label)}
                  className={cn(
                    "mb-5 flex items-center justify-between text-sm font-medium text-dark-4 dark:text-dark-6 w-full",
                    isCollapsed && "hidden"
                  )}
                >
                  <span>{section.label}</span>
                  <ChevronUp
                    className={cn(
                      "size-4 transition-transform",
                      expandedSections.includes(section.label)
                        ? "rotate-0"
                        : "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>

                {expandedSections.includes(section.label) && (
                  <nav role="navigation" aria-label={section.label}>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item.title}>
                          {(() => {
                            const href =
                              "url" in item
                                ? item.url + ""
                                : "/" +
                                  item.title.toLowerCase().split(" ").join("-");

                            return (
                              <MenuItem
                                className={cn(
                                  "flex items-center gap-3 px-6 py-3",
                                  isCollapsed && "justify-center"
                                )}
                                as="link"
                                href={href}
                                isActive={pathname === href}
                                title={isCollapsed ? item.title : undefined} // Add tooltip when collapsed
                              >
                                <item.icon
                                  className="size-6 shrink-0"
                                  aria-hidden="true"
                                />

                                {!isCollapsed && <span>{item.title}</span>}
                              </MenuItem>
                            );
                          })()}
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
