"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

function NavButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button
      asChild
      className={`text-black bg-transparent hover:bg-black hover:text-white hover:opacity-100 opacity-60 transition-all ${
        isActive ? "bg-black text-white opacity-100" : ""
      }`}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 p-4 border-b border-gray-300 bg-white z-50 h-16 flex items-center">
      <nav>
        <ul className="flex space-x-4">
          <li>
            <NavButton href="/">Calculators</NavButton>
          </li>
          <li>
            <NavButton href="/calculators/1">Calculator 1</NavButton>
          </li>
        </ul>
      </nav>
    </header>
  );
}
