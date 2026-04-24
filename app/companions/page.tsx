import { Suspense } from "react";
import { getAllCompanions } from "@/lib/actions/companion.action";
import CompanionCards from "@/components/CompanionCards";
import { getSubjectColor } from "@/lib/utils";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { searchParams: { subject: null, topic: null } },
    { searchParams: { subject: "maths", topic: null } },
    { searchParams: { subject: null, topic: "algebra" } },
    { searchParams: { subject: "maths", topic: "algebra" } },
  ],
};

async function CompanionGrid({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filters = await searchParams;
  const subject = filters.subject ? String(filters.subject) : "";
  const topic = filters.topic ? String(filters.topic) : "";
  const companions = await getAllCompanions({ subject, topic });

  return (
    <section className="companions-grid">
      {companions.map((companion) => (
        <CompanionCards
          key={companion.id}
          {...companion}
          color={getSubjectColor(companion.subject)}
        />
      ))}
    </section>
  );
}

const CompanionsLibrary = ({ searchParams }: SearchParams) => {
  return (
    <main>
      <section className="flex gap-4 flex-col">
        <h1>Companion Library</h1>
        <div className="flex gap-4">
          <Suspense fallback={null}>
            <SearchInput />
            <SubjectFilter />
          </Suspense>
        </div>
      </section>
      <Suspense fallback={<p>Loading companions...</p>}>
        <CompanionGrid searchParams={searchParams} />
      </Suspense>
    </main>
  );
};

export default CompanionsLibrary;
