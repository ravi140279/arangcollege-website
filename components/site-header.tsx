"use client";

import Link from "next/link";
import { useState } from "react";
import { navGroups } from "@/lib/site-data";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-amber-200/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="max-w-[16rem] leading-tight">
          <p className="font-serif text-sm font-bold text-teal-900 sm:text-base">
            Badri Prasad Lodhi PG Govt. College
          </p>
          <p className="text-xs text-amber-700">Arang, District Raipur, Chhattisgarh</p>
        </Link>

        <button
          type="button"
          className="rounded-lg border border-teal-800 px-3 py-1 text-sm font-semibold text-teal-800 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Menu
        </button>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-3 text-sm font-semibold text-teal-900">
            <li>
              <Link href="/" className="rounded px-2 py-1 hover:bg-amber-100">
                Home
              </Link>
            </li>
            {navGroups.map((group) => (
              <li key={group.label} className="group relative">
                <span className="cursor-default rounded px-2 py-1 group-hover:bg-amber-100">{group.label}</span>
                <div className="invisible absolute right-0 top-full w-72 translate-y-1 rounded-xl border border-amber-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-900"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {open ? (
        <div className="border-t border-amber-200 bg-white px-4 py-4 lg:hidden">
          <Link href="/" className="mb-3 block rounded px-2 py-2 font-semibold text-teal-900" onClick={() => setOpen(false)}>
            Home
          </Link>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wide text-amber-700">{group.label}</p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded px-2 py-2 text-sm text-slate-800 hover:bg-teal-50"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </header>
  );
}
