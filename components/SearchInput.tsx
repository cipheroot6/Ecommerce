"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { formUrlQuery } from "@jsmastery/utils";

const SearchInput = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("topic") ?? "";

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        const newurl = formUrlQuery({
          params: searchParams.toString(),
          key: "topic",
          value: searchQuery,
        });
        router.push(newurl, {
          scroll: false,
        });
      } else if (query) {
        router.push(pathname, {
          scroll: false,
        });
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, pathname]);

  return (
    <div className="relative border black-border rounded-lg items-center flex gap-4 px-2 py-1 h-fit">
      <Image src="/icons/search.svg" alt="search" width={12.5} height={12.5} />
      <input
        placeholder="Search Companions..."
        className="outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
