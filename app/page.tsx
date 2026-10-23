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
      <SiteHeader />
      <main id="inhoud">
        <VCard personal={model.personal} />
        <About
          foreword={model.forewordParagraphs}
          github={model.personal.github}
          githubDescription={model.githubParagraphs}
        />
        <Skills groups={model.skillGroups} />

        {firstBanner ? <Banner banner={firstBanner} /> : null}

        <section className="mx-auto max-w-[1000px] px-4 py-12" id="werk" aria-labelledby="work-title">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="inline-flex h-[66px] w-[66px] items-center justify-center bg-white p-2.5 text-primary shadow-material">
              <LayersIcon />
            </span>
            <h2 id="work-title" className="font-display text-4xl font-semibold tracking-wide text-ink uppercase">
              Werkervaring
            </h2>
          </div>
          <WorkExplorer projects={model.allProjects} initialSelected={model.selectedKeywords} />
        </section>

        {secondBanner ? <Banner banner={secondBanner} /> : null}
      </main>
      <SiteFooter name={model.personal.fullName} />
    </>
  );
}

function LayersIcon() {
  return (
    <svg className="h-9 w-9" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3 3 8l9 5 9-5-9-5Zm-9 8 9 5 9-5M3 16l9 5 9-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
