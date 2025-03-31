"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";

type PropsType = {
  label: string;
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
  placeholder,
  prefixIcon,
  className,
  onChange,
  shouldShowSearch = true,
}: PropsType) {
  const id = useId();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = shouldShowSearch ? items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  ) : items;

  return (
    <div className={cn("space-y-3 min-w-60 relative", className)}>
      <label htmlFor={id} className="block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </label>
      <div className="relative">
        {prefixIcon && <div className="absolute left-4 top-1/2 -translate-y-1/2">{prefixIcon}</div>}

        <input
          id={id}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (onChange) onChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary",
            prefixIcon && "pl-11.5"
          )}
        />

        <ChevronUpIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-180" />
      </div>
      {isOpen && filteredItems.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-stroke bg-white dark:bg-dark-2 shadow-md max-h-40 overflow-y-auto">
          {filteredItems.map((item) => (
            <li
              key={item.value}
              onMouseDown={() => {
                setSearch(item.label);
                setIsOpen(false);
                if (onChange) onChange(item.value);
              }}
              className="cursor-pointer px-5.5 py-2 hover:bg-gray-200 dark:hover:bg-dark-3"
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
