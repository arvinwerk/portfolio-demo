import { describe, expect, it } from "vitest";
import { ContentError, parseContent } from "./portfolio-document";

function validInput() {
  return {
    personal: {
      fullName: "Noor Linden",
      function: "Frontend developer",
      email: "noor.linden@example.com",
      education: "Voorbeeld",
      developingStartDate: "2015-08-03",
      linkedIn: "https://example.com/demo/noor-linden/linkedin",
      portfolioUrl: "https://example.com/demo/noor-linden",
      location: "Kadewijk (verzonnen)",
      foreword: "Hoi ${age}",
      dateOfBirth: "1993-04-18",
      github: "https://example.com/demo/noor-linden/code",
      githubDescription: "Code",
    },
    skills: [{ name: "React", percentage: 80, category: "framework" }],
    projects: [
      {
        company: "Studio",
        title: "Bibliotheek",
        shortDescription: "Kort",
        longDescription: null,
        keywords: ["React"],
        images: ["ui.svg"],
      },
    ],
    banners: [
      {
        title: "Campagne",
        bgImage: { src: "/images/banners/noordlicht-bg.svg" },
        laptopImage: { src: "/images/banners/noordlicht-laptop.svg" },
        mobileImage: { src: "/images/banners/noordlicht-mobile.svg" },
      },
    ],
  };
}

describe("parseContent", () => {
  it("accepteert geldige content, inclusief een lege lange beschrijving", () => {
    const content = parseContent(validInput());
    expect(content.projects[0].longDescription).toBeNull();
    expect(content.skills[0].category).toBe("framework");
  });

  it.each([
    ["een percentage boven 100", (input: ReturnType<typeof validInput>) => {
      input.skills[0].percentage = 101;
    }],
    ["een onbekende categorie", (input: ReturnType<typeof validInput>) => {
      (input.skills[0] as { category: string }).category = "design";
    }],
    ["een pad buiten /images", (input: ReturnType<typeof validInput>) => {
      input.banners[0].bgImage.src = "/assets/geheim.svg";
    }],
    ["een relatief logopad", (input: ReturnType<typeof validInput>) => {
      input.projects[0].images = ["../etc/passwd.svg"];
    }],
    ["een leeg trefwoord", (input: ReturnType<typeof validInput>) => {
      input.projects[0].keywords = [];
    }],
    ["een extra veld", (input: ReturnType<typeof validInput>) => {
      (input.personal as { nickname?: string }).nickname = "A";
    }],
    ["een ongeldig e-mailadres", (input: ReturnType<typeof validInput>) => {
      input.personal.email = "niet-een-adres";
    }],
  ])("wijst %s af", (_label, mutate) => {
    const input = validInput();
    mutate(input);
    expect(() => parseContent(input)).toThrow(ContentError);
  });
});
