import React from "react";
import { Button } from "@/components/ui/button";
import CompanionCards from "@/components/CompanionCards";
import CompanionList from "@/components/CompanionList";
import CTA from "@/components/CTA";
import { recentSessions } from "@/constants/index";

const Page = () => {
  return (
    <main>
      <h1 className="text-5xl font-bold">Popular Companions</h1>
      <section className="home-section">
        <CompanionCards
          id="1"
          name="Neura the Brainy Explorer"
          topic="Neural Network of the Brain"
          subject="Science"
          duration={45}
          color="#E5D0FF"
        />
      </section>
      <section className="home-section">
        <CompanionList
          title="Recently Completed Sessions"
          companions={recentSessions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
};

export default Page;
