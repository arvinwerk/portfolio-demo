import type { Metadata } from "next";
import { About } from "@/components/about";
import { Banner } from "@/components/banner";
import { WorkExplorer } from "@/components/work-explorer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Skills } from "@/components/skills";
import { VCard } from "@/components/v-card";
import { loadContent } from "@/lib/content";
import { buildPageModel } from "@/lib/page-model";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { personal } = loadContent();

  return {
    title: `${personal.fullName} — ${personal.function}`,
    description: `${personal.function}. Werk, vaardigheden en een chat die het profiel doorzoekt.`,
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ keywords?: string | string[] }>;
}) {
  const params = await searchParams;
  const model = buildPageModel(loadContent(), { keywords: params.keywords });
  const [firstBanner, secondBanner] = model.banners;

  return (
    <>
      <SiteHeader name={model.personal.fullName} />
      <main id="inhoud">
        <VCard
          personal={model.personal}
          yearsAsDeveloper={model.yearsAsDeveloper}
          projectCount={model.allProjects.length}
          skillCount={model.skillGroups.reduce((total, group) => total + group.skills.length, 0)}
        />
        <About
          foreword={model.forewordParagraphs}
          github={model.personal.github}
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
        name={model.personal.fullName}
        email={model.personal.email}
        linkedIn={model.personal.linkedIn}
        github={model.personal.github}
      />
    </>
  );
}
