import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4 lg:px-8">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl font-bold">
          jkvc
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal gap-1">
          <li>
            <Link href="#projects">Projects</Link>
          </li>
          <li>
            <Link href="#about">About</Link>
          </li>
          <li>
            <Link href="#contact">Contact</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
