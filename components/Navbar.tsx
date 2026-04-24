import Link from "next/link";
import Image from "next/image";
import NavItems from "./NavItems";
import { Suspense } from "react";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link href="/">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <Image
            src="/images/logo.png"
            alt="logo"
            width={46}
            height={44}
            loading="eager"
            style={{ height: "46px", width: "44px" }} 
          />
        </div>
      </Link>
      <div className="flex items-center gap-8">
        <Suspense fallback={null}>
          <NavItems />
          <Show when="signed-out">
            <SignInButton>
              <button className="btn-signin">Sign In</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </Suspense>
      </div>
    </nav>
  );
};

export default Navbar;
