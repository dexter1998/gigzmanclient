"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  action: string;
  placeholder?: string;
  className?: string;
}

/** Submits to `/properties?search=...`; the listing page reads it server-side. */
export default function SearchBar({
  action,
  placeholder = "Search sector, locality or project…",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    router.push(`${action}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`flex items-center gap-2 rounded-[10px] border border-line bg-surface p-2 shadow-[0_1px_2px_rgba(15,44,82,0.04),0_10px_30px_-18px_rgba(15,44,82,0.18)] ${className}`}
    >
      <Search className="ml-2 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-h-[38px] flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none"
      />
      <button
        type="submit"
        className="min-h-[38px] shrink-0 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft"
      >
        Search
      </button>
    </form>
  );
}
