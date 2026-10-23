import { displayUrl } from "@/lib/text";
import type { Personal } from "@/lib/types";

export function VCard({ personal }: { personal: Personal }) {
  return (
    <section className="vcard" aria-label="Profiel">
      <div className="vcard__copy">
        <h1>{personal.fullName}</h1>
        <p className="vcard__role">{personal.function}</p>
        <p className="vcard__education">{personal.education}</p>
        <ul className="vcard__contacts">
          <li>
            <span>Mail</span>
            <a href={`mailto:${personal.email}`}>{personal.email}</a>
          </li>
          <li>
            <span>LinkedIn</span>
            <a href={personal.linkedIn} target="_blank" rel="noreferrer">
              Profiel
            </a>
          </li>
          <li>
            <span>Site</span>
            <a href={personal.portfolioUrl}>{displayUrl(personal.portfolioUrl)}</a>
          </li>
          <li>
            <span>Plaats</span>
            <span>{personal.location}</span>
          </li>
        </ul>
      </div>
      <img
        className="vcard__portrait"
        src="/images/profile.svg"
        alt={`Monogram van ${personal.fullName}`}
        width={280}
        height={350}
      />
    </section>
  );
}
