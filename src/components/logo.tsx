import darkLogo from "@/assets/logos/Kodama_Koi_Farm_Logo_Header.webp";
import logo from "@/assets/logos/Kodama_Koi_Farm_Logo_Header.webp";
import Image from "next/image";

export function Logo() {
  return (
    <><div className="relative h-8 flex items-center text-2xl font-bold">
      <span className="dark:hidden">Kodama Koi Farm</span>
      <span className="hidden dark:block">Kodama Koi Farm</span>

    </div>

      </>
  );
}
