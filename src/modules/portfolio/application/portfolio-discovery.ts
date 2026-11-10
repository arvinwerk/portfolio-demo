import type { PersonalProfile } from "../domain/model";

export type PortfolioDiscovery = {
  title: string;
  description: string;
  url: string;
  sameAs: readonly string[];
};

export function describePortfolio(profile: PersonalProfile): PortfolioDiscovery {
  return {
    title: `${profile.fullName} — ${profile.function}`,
    description: `Portfolio van ${profile.fullName}, ${profile.function} in ${profile.location}. Projecten, vaardigheden en contact.`,
    url: profile.portfolioUrl,
    sameAs: [profile.linkedIn, profile.github],
  };
}

export function portfolioStructuredData(profile: PersonalProfile): string {
  const discovery = describePortfolio(profile);
  const document = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: discovery.url,
    inLanguage: "nl-NL",
    mainEntity: {
      "@type": "Person",
      name: profile.fullName,
      jobTitle: profile.function,
      email: profile.email,
      url: discovery.url,
      image: new URL("/images/profile.svg", discovery.url).toString(),
      address: {
        "@type": "PostalAddress",
        addressLocality: profile.location,
      },
      sameAs: [...discovery.sameAs],
    },
  };

  return JSON.stringify(document).replaceAll("<", "\\u003c");
}
