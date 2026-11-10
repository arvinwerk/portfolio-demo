import { describe, expect, it } from "vitest";
import type { PersonalProfile } from "../domain/model";
import { describePortfolio, portfolioStructuredData } from "./portfolio-discovery";

const profile: PersonalProfile = {
  fullName: "Noor Linden",
  function: "Frontend developer",
  email: "noor.linden@example.com",
  education: null,
  developingStartDate: "2015-08-03",
  linkedIn: "https://example.com/demo/noor-linden/linkedin",
  portfolioUrl: "https://example.com/demo/noor-linden",
  location: "Kadewijk (verzonnen)",
  foreword: "Hoi",
  dateOfBirth: null,
  github: "https://example.com/demo/noor-linden/code",
  githubDescription: "Code",
};

describe("describePortfolio", () => {
  it("beschrijft de persoon, de plaats en het canonieke adres", () => {
    expect(describePortfolio(profile)).toEqual({
      title: "Noor Linden — Frontend developer",
      description: "Portfolio van Noor Linden, Frontend developer in Kadewijk (verzonnen). Projecten, vaardigheden en contact.",
      url: "https://example.com/demo/noor-linden",
      sameAs: ["https://example.com/demo/noor-linden/linkedin", "https://example.com/demo/noor-linden/code"],
    });
  });

  it("zet een profielpagina in de gestructureerde data", () => {
    const data = JSON.parse(portfolioStructuredData(profile)) as {
      "@type": string;
      inLanguage: string;
      mainEntity: { name: string; jobTitle: string; address: { addressLocality: string } };
    };

    expect(data["@type"]).toBe("ProfilePage");
    expect(data.inLanguage).toBe("nl-NL");
    expect(data.mainEntity.name).toBe("Noor Linden");
    expect(data.mainEntity.jobTitle).toBe("Frontend developer");
    expect(data.mainEntity.address.addressLocality).toBe("Kadewijk (verzonnen)");
  });
});
