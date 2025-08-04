"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { LogoutConfirmation } from "@/components/LogoutConfirmation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import { useAuth } from "@/hooks/use-auth";

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, supabaseUser, signOut, loading } = useAuth();

  // if (loading) {
  //   return (
  //     <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-12 w-12"></div>
  //   );
  // }

  if (!user || !supabaseUser) {
    return null;
  }

  const handleSignOut = () => {
    setIsOpen(false);
    setShowLogoutConfirm(true);
  };

  const displayName = user.full_name || supabaseUser.email?.split('@')[0] || 'User';
  const displayEmail = supabaseUser.email || '';
  const displayRole = user.role === 'admin' ? 'Administrator' : 'Assistant';
  const avatarUrl = user.avatar_url || "/images/user/user-01.png";

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>        <figure className="flex items-center gap-3">
          <Image
            src={avatarUrl}
            className="size-12"
            alt={`Avatar of ${displayName}`}
            role="presentation"
            width={200}
            height={200}
          />
          <figcaption className="flex  items-center font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <div className="flex items-start  flex-col mr-2"><span className="block">{displayName}</span>
              <span className="block text-gray-6 dark:text-dark-6 text-xs">{displayRole}</span>
            </div>
            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="z-99999 border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <Image
            src={avatarUrl}
            className="size-12"
            alt={`Avatar for ${displayName}`}
            role="presentation"
            width={200}
            height={200}
          />

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {displayName}
            </div>

            <div className="leading-none text-gray-6">{displayEmail}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />

            <span className="mr-auto text-base font-medium">View profile</span>
          </Link>

          <Link
            href={"/pages/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />

            <span className="mr-auto text-base font-medium">
              Account Settings
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={handleSignOut}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Log out</span>
          </button>        </div>
      </DropdownContent>
      
      <LogoutConfirmation 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </Dropdown>
  );
}
