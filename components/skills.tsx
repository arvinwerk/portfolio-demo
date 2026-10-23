import type { SkillGroup } from "@/lib/types";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto mt-10 max-w-[1000px] px-4 pb-10" id="skills" aria-labelledby="skills-title">
      <h2 id="skills-title" className="sr-only">
        Skills
      </h2>
      <div className="bg-primary px-6 py-8 text-white shadow-card sm:px-10">
        <div className="grid gap-10 md:grid-cols-3">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="mb-8 text-center font-display text-xl font-medium text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.29)]">
                {group.label}
              </h3>
              <ul>
                {group.skills.map((skill) => (
                  <li key={skill.name} className="mt-11">
                    <div className="mb-2 flex items-end justify-between text-sm text-white">
                      <span>{skill.name}</span>
                      <span className="text-xs">{skill.percentage}%</span>
                    </div>
                    <div
                      className="h-1 bg-primary-dark"
                      role="meter"
                      aria-label={skill.name}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={skill.percentage}
                      aria-valuetext={`${skill.percentage}%`}
                    >
                      <span className="block h-1 bg-white" style={{ width: `${skill.percentage}%` }} />
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
