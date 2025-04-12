"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useState, useId, useEffect } from "react";

interface Item {
  value: string;
  label: string;
}

interface PropsType {
  items: Item[];
  label: string;
  placeholder: string;
  className?: string;
  onChange?: (selected: string[]) => void;
  reset?: boolean;
}

export function FilteredMultiSelectTextboxDropdown({
  items,
  label,
  placeholder,
  className,
  onChange,
  reset
}: PropsType) {
  const id = useId();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  useEffect(() => {
    if (reset) {
      setSelectedValues([]);
    }
  }, [reset]);


  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = () => {
    const filteredValues = filteredItems.map((item) => item.value);
    const newSelected = Array.from(
      new Set([...selectedValues, ...filteredValues])
    );
    setSelectedValues(newSelected);
    onChange?.(newSelected);
  };

  const handleDeselectAll = () => {
    const filteredValues = filteredItems.map((item) => item.value);
    const newSelected = selectedValues.filter(
      (val) => !filteredValues.includes(val)
    );
    setSelectedValues(newSelected);
    onChange?.(newSelected);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder || "Select";
    return `${selectedValues.length} selected`;
  };

  return (
    <div className={cn("space-y-1 min-w-60 relative text-sm", className)}>
      <label
        htmlFor={id}
        className="block text-body-xs font-medium text-dark dark:text-white"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={isOpen ? search : getDisplayText()}
          readOnly={!isOpen}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch("");
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className={cn(
            "w-full rounded-lg border border-stroke bg-transparent px-5.5 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary",
            { "cursor-pointer": !isOpen }
          )}
          placeholder={placeholder}
        />

        <ChevronUpIcon
          className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition-transform ${
            isOpen ? "" : "rotate-180"
          }`}
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-stroke bg-white dark:bg-dark-2 shadow-md max-h-40 overflow-y-auto"
        // onMouseLeave={() => setIsOpen(false)}
        >
          <div className="flex justify-between px-5.5 py-2 border-b border-stroke dark:border-dark-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-primary hover:text-primary-dark text-body-sm"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-primary hover:text-primary-dark text-body-sm"
            >
              Deselect All
            </button>
          </div>
          <ul>
            {filteredItems.map((item) => (
              <li
                key={item.value}
                onMouseDown={() => {
                  const newSelected = selectedValues.includes(item.value)
                    ? selectedValues.filter((val) => val !== item.value)
                    : [...selectedValues, item.value];
                  setSelectedValues(newSelected);
                  onChange?.(newSelected);
                }}
                className="cursor-pointer px-5.5 py-2 hover:bg-gray-200 dark:hover:bg-dark-3"
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(item.value)}
                    readOnly
                    className="h-4 w-4 rounded border-stroke focus:ring-primary dark:bg-dark-3 dark:border-dark-3"
                  />
                  <span>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}