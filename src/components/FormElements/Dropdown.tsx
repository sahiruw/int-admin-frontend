"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dropdown, DropdownContent, DropdownTrigger } from "@/components/ui/dropdown";

type PropsType<TItem extends string> = {
  value: TItem;
  setValue: (val: TItem) => void;
  items: TItem[];
  placeholder?: string;
  minimal?: boolean;
  disabled?: boolean;
};

export function Picker<TItem extends string>({
  value,
  setValue,
  items,
  placeholder = "Select...",
  minimal,
  disabled=false,
}: PropsType<TItem>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger
        className={cn(
          "flex w-fit items-center justify-between gap-x-1 rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm font-medium text-dark-5 outline-none ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-neutral-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:ring-offset-neutral-950 dark:focus:ring-neutral-300 dark:data-[placeholder]:text-neutral-400 [&>span]:line-clamp-1 [&[data-state='open']>svg]:rotate-0",
          minimal &&
        "border-none bg-transparent p-0 text-dark dark:bg-transparent dark:text-white"
        )}
        disabled={disabled}
      >
        <span className="capitalize">{value || placeholder}</span>
        <ChevronUpIcon className="size-4 rotate-180 transition-transform" />
      </DropdownTrigger>

      <DropdownContent
        align="start"
        className="w-fit overflow-y-scroll max-h-48 rounded-lg border border-[#E8E8E8] bg-white p-1 font-medium text-dark-5 shadow-md dark:border-dark-3 dark:bg-dark-2 dark:text-current"
      >
        <ul>
          {items.map((item) => (
            <li key={item}>
              <button
                className="flex w-full select-none items-center truncate rounded-md px-3 py-2 text-sm capitalize outline-none hover:bg-[#F9FAFB] hover:text-dark-3 dark:hover:bg-[#FFFFFF1A] dark:hover:text-white"
                onClick={() => {
                  setValue(item);
                  setIsOpen(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </DropdownContent>
    </Dropdown>
  );
}
