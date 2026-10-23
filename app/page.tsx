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
        <div className="wrap sheet">
          <VCard personal={model.personal} />
          <About
            foreword={model.forewordParagraphs}
            github={model.personal.github}
            githubDescription={model.githubParagraphs}
          />
          <Skills groups={model.skillGroups} />
        </div>

        {firstBanner ? <Banner banner={firstBanner} /> : null}

        <div className="wrap sheet">
          <section className="work" aria-labelledby="work-title">
            <div className="work__heading">
              <LayersIcon />
              <h2 id="work-title">Werkervaring</h2>
            </div>
            <WorkExplorer projects={model.allProjects} initialSelected={model.selectedKeywords} />
          </section>
        </div>

        {secondBanner ? <Banner banner={secondBanner} /> : null}
      </main>
      <SiteFooter name={model.personal.fullName} />
    </>
  );
}

function LayersIcon() {
  return (
    <svg className="work__icon" viewBox="0 0 24 24" aria-hidden="true">
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
