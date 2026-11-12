import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060A30] text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <Image
          src="/logo.png"
          alt="Q-JEN Logo"
          width={84}
          height={84}
          className="mx-auto"
        />
        <div className="font-mono text-6xl font-bold text-[#FACC15]">404</div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">
          Page Not Found
        </h1>
        <p className="text-sm text-blue-100/80 leading-relaxed">
          The VFD model or page you are looking for could not be found. Browse
          our active drive ratings or search the catalog below.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1C66EB] hover:bg-[#336DFD] text-white font-semibold px-5 py-2.5 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-2.5 text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            <Search className="w-4 h-4" />
            All Products
          </Link>
        </div>
      </div>
    </div>
  );
}

