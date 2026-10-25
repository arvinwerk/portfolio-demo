import type { SkillGroup } from "../domain/model";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 sm:py-20" id="skills" aria-labelledby="skills-title">
      <div className="mx-auto max-w-5xl px-4">
        <h2 id="skills-title" className="font-display text-4xl font-semibold tracking-tight text-ink">
          Vaardigheden
        </h2>
        <div className="mt-10 grid gap-12 md:grid-cols-3">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="font-display text-xl font-semibold text-ink">{group.label}</h3>
              <ul className="mt-6 space-y-6">
                {group.skills.map((skill) => (
                  <li key={skill.name}>
                    <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-ink">{skill.name}</span>
                      <span className="font-ui text-xs text-muted">{skill.percentage}%</span>
                    </div>
                    <div
                      className="h-1 bg-[#e7dfd6]"
                      role="meter"
                      aria-label={skill.name}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={skill.percentage}
                      aria-valuetext={`${skill.percentage}%`}
                    >
                      <span className="block h-1 bg-primary" style={{ width: `${skill.percentage}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
