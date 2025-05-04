"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";

type PropsType = {
  label?: string;
  items: { value: string; label: string }[];
  prefixIcon?: React.ReactNode;
  className?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  shouldShowSearch?: boolean;
};

export function FilteredTextboxDropdown({
  items,
  label,
  placeholder = "Select...",
  prefixIcon,
  className,
  onChange,
  shouldShowSearch = true,
}: PropsType) {
  const id = useId();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = shouldShowSearch
    ? items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-dark-5 dark:text-white"
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex items-center justify-between gap-x-1 rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm font-medium text-dark-5 outline-none ring-offset-white dark:border-dark-3 dark:bg-dark-2 dark:text-white",
          isOpen && "ring-1 ring-primary"
        )}
      >
        {prefixIcon && <div className="mr-2">{prefixIcon}</div>}
        <input
          id={id}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            onChange?.(e.target.value);
          }}
          onFocus={() => {
            setSearch("");
            setIsOpen(true);
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent text-sm outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
            prefixIcon && "pl-2"
          )}
        />
        <ChevronUpIcon
          className={cn(
            "size-4 transition-transform",
            isOpen ? "rotate-0" : "rotate-180"
          )}
          onClick={() => setIsOpen((prev) => !prev)}
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-[#E8E8E8] bg-white p-1 font-medium text-dark-5 shadow-md dark:border-dark-3 dark:bg-dark-2 dark:text-current">
          {filteredItems.map((item) => (
            <li key={item.value}>
              <button
                type="button"
                className="flex w-full select-none items-center truncate rounded-md px-3 py-2 text-sm capitalize outline-none hover:bg-[#F9FAFB] hover:text-dark-3 dark:hover:bg-[#FFFFFF1A] dark:hover:text-white"
                onMouseDown={() => {
                  setSearch(item.label);
                  setIsOpen(false);
                  onChange?.(item.value);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
