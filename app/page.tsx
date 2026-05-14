export const unstable_instant = { prefetch: 'static' };

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import CompanionCards from "@/components/CompanionCards";
import CompanionList from "@/components/CompanionList";
import CTA from "@/components/CTA";
import { getSubjectColor } from "@/lib/utils";
import { getAllCompanions, getRecentSessions } from "@/lib/actions/companion.action";

type CompanionData = {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
};

const HomeContent = async () => {
  const companions = await getAllCompanions({ limit: 3});
  const recentCompanions = await getRecentSessions({ limit: 10 });
  
  return (
    <main>
      <h1 className="text-5xl font-bold">Popular Companions</h1>
      <section className="home-section">
        {companions.map((companion: CompanionData) => (
          <CompanionCards
            key={companion.id}
            id={companion.id}
            name={companion.name}
            topic={companion.topic}
            subject={companion.subject}
            duration={companion.duration}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>
      <section className="home-section">
        <CompanionList
          title="Recently Completed Sessions"
          companions={recentCompanions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
};

export default Page;
