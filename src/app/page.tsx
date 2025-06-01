import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <div className="px-4 md:px-6 lg:px-12 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Image
          src="/images/logo.svg"
          alt="logo"
          width={100}
          height={100}
          className="size-10"
        />
        <h1 className="text-2xl font-bold text-green-700">Prepwise</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/sign-in" className="px-4 py-2 rounded-full bg-white text-green-700 border border-green-700">Login</Link>
        <Link href="/sign-up" className="px-4 py-2 rounded-full bg-green-700 text-white">Sign Up</Link>
      </div>
    </div>
  );
}
