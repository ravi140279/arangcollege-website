import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-teal-900/15 bg-teal-950 text-teal-50">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="font-serif text-lg font-bold">Badri Prasad Lodhi Post Graduate Government College</p>
          <p className="mt-2 text-sm text-teal-100/90">Arang, District Raipur, Chhattisgarh</p>
          <p className="text-sm text-teal-100/90">Affiliated to Pt. Ravishankar Shukla University, Raipur</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">Important</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link href="/notice-board" className="hover:text-amber-300">
                Notice Board
              </Link>
            </li>
            <li>
              <Link href="/event" className="hover:text-amber-300">
                Events
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="hover:text-amber-300">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">Official Source</p>
          <a
            className="mt-2 block text-sm hover:text-amber-300"
            href="https://govpgcollarang.cgstate.gov.in/"
            target="_blank"
            rel="noreferrer"
          >
            govpgcollarang.cgstate.gov.in
          </a>
          <p className="mt-3 text-xs text-teal-100/70">
            This redesigned implementation is built with Next.js, React, and Tailwind CSS from publicly available
            content structure and page data.
          </p>
        </div>
      </div>
    </footer>
  );
}
