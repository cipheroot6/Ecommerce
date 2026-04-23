import { getAllCompanions } from "@/lib/actions/companion.action";
import CompanionCards from "@/components/CompanionCards";
import { getSubjectColor } from "@/lib/utils";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
export const unstable_instant = { prefetch: 'static' }

const CompanionsLiberary = async ({ searchParams }: SearchParams) => {
  const filters = await searchParams;
  const subject = filters.subject ? filters.subject : '';
  const topic = filters.topic ? filters.topic : '';

  const companions = await getAllCompanions({ subject, topic });

  console.log(companions);
  return (
    <main>
      <section className="flex justify-center gap-4 max-sm:flex-col">
        <h1>Companion Liberary</h1>
        <div className="flex gap-4">
          <SearchInput />
          <SubjectFilter />
        </div>
      </section>
      <section className="companions-grid"> 
        {companions.map((companion) => (
          <CompanionCards key={companion.id} {...companion} color={getSubjectColor(companion.subject)} />
        ))}
      </section>
    </main>
  );
}

export default CompanionsLiberary