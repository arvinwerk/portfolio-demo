import type { ReactNode } from "react";
import type { PortfolioPage } from "../application/compose-portfolio-page";
import { About } from "./about";
import { Banner } from "./banner";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { Skills } from "./skills";
import { VCard } from "./v-card";
import { WorkExplorer } from "./work-explorer";

export function PortfolioView({ model, chatAction }: { model: PortfolioPage; chatAction?: ReactNode }) {
  const [firstBanner, secondBanner] = model.banners;

  return (
    <>
      <SiteHeader name={model.profile.fullName} action={chatAction} />
      <main id="inhoud">
        <VCard
          profile={model.profile}
          yearsAsDeveloper={model.yearsAsDeveloper}
          projectCount={model.allProjects.length}
          skillCount={model.skillGroups.reduce((total, group) => total + group.skills.length, 0)}
        />
        <About
          foreword={model.forewordParagraphs}
          github={model.profile.github}
          githubDescription={model.githubParagraphs}
        />
        <Skills groups={model.skillGroups} />

        {firstBanner ? <Banner banner={firstBanner} /> : null}

        <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20" id="werk" aria-labelledby="work-title">
          <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Werk</p>
          <h2 id="work-title" className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
            Werkervaring
          </h2>
          <div className="mt-8">
            <WorkExplorer projects={model.allProjects} initialSelected={model.selectedKeywords} />
          </div>
        </section>

        {secondBanner ? <Banner banner={secondBanner} /> : null}
      </main>
      <SiteFooter
        name={model.profile.fullName}
        email={model.profile.email}
        linkedIn={model.profile.linkedIn}
        github={model.profile.github}
      />
    </>
  );
}
