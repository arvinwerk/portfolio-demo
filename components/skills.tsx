import type { SkillGroup } from "@/lib/types";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="skills" id="skills" aria-labelledby="skills-title">
      <h2 id="skills-title" className="sr-only">
        Skills
      </h2>
      <div className="skills__grid">
        {groups.map((group) => (
          <div key={group.category}>
            <h3>{group.label}</h3>
            <ul>
              {group.skills.map((skill) => (
                <li key={skill.name}>
                  <div className="skill__meta">
                    <span>{skill.name}</span>
                    <span>{skill.percentage}%</span>
                  </div>
                  <div
                    className="skill__track"
                    role="meter"
                    aria-label={skill.name}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={skill.percentage}
                    aria-valuetext={`${skill.percentage}%`}
                  >
                    <span style={{ width: `${skill.percentage}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
