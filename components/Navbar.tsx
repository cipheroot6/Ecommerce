import Link from "next/link";
import Image from "next/image";
import NavItems from "./NavItems";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link href="/">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <Image src="/images/logo.png" alt="logo" width={46} height={44} />
        </div>
      </Link>
      <div className="flex items-center gap-8">
       <NavItems />
       <Show when="signed-out">
         <SignInButton />
         <SignUpButton />
       </Show>
       <Show when="signed-in">
         <UserButton />
       </Show>
      </div>
    </nav>
  );
};

export default Navbar;
