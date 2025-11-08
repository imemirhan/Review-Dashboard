import Link from "next/link";
import Image from "next/image";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/flex.jpeg" alt="Flex Logo" width={36} height={36} className="rounded-md" />
            <span className="text-lg font-semibold text-gray-800">The Flex</span>
          </Link>

          {/* Some dummy links */}
          <nav className="hidden md:flex items-center gap-6 text-gray-600 text-sm font-medium">
            <Link href="/" className="hover:text-[#164f4c]">Home</Link>
            <Link href="/" className="hover:text-[#164f4c]">About</Link>
            <Link href="/" className="hover:text-[#164f4c]">Contact</Link>
          </nav>

          <button className="bg-[#164f4c] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0f3a38]">
            Get Started
          </button>
        </div>
      </header>

      {/* Content goes here */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-[#164f4c] text-white text-center py-6 text-sm mt-12">
        © {new Date().getFullYear()} The Flex.
      </footer>
    </>
  );
}
