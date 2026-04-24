export const unstable_instant = {
  prefetch: "static",
  samples: [
    {
      params: {
        id: "00000000-0000-0000-0000-000000000000",
      },
    },
  ],
};

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCompanion } from "@/lib/actions/companion.action";
import { currentUser } from "@clerk/nextjs/server";
import { getSubjectColor } from "@/lib/utils";
import Image from "next/image";
// import CompanionComponent from "@/components/CompanionComponent"; // your actual UI

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CompanionSessionPage({ params }: Props) {
  return (
    <main>
      <Suspense fallback={<p>Loading session...</p>}>
        <CompanionSession params={params} />
      </Suspense>
    </main>
  );
}

// All async data fetching lives inside this component,
// which is wrapped in Suspense above ↑
async function CompanionSession({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [companion, user] = await Promise.all([
    getCompanion(id),
    currentUser(),
  ]);

  if (!user) redirect("/sign-in");
  if (!companion) redirect("/companions");

  return (
    <>
      <article className="flex justify-between items-center rounded-border p-6 max-md:flex-col">
        {/* LEFT: icon + name + topic */}
        <div className="flex items-center gap-2">
          <div
            className="size-18 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: getSubjectColor(companion.subject) }}
          >
            <Image
              src={`/icons/${companion.subject}.svg`}
              alt={companion.subject}
              width={35}
              height={35}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold text-2xl">{companion.name}</p>
            <p className="text-lg">{companion.topic}</p>
          </div>
        </div>

        {/* RIGHT: subject badge + duration */}
        <div className="flex items-center gap-4 max-md:hidden">
          <div className="subject-badge">{companion.subject}</div>
          <p className="text-2xl">{companion.duration} min</p>
        </div>
      </article>
    </>
  );
}
