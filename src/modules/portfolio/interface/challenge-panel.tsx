import { useState } from "react";
import { assessChoice, designChallenge, type ChoiceAssessment } from "../domain/design-challenge";

export function ChallengePanel() {
  const task = designChallenge();
  const [choices, setChoices] = useState<Record<string, ChoiceAssessment>>({});
  const answered = task.steps.filter((step) => choices[step.id]).length;
  const aligned = Object.values(choices).filter((choice) => choice.builtThisWay).length;

  return (
    <div data-boundary="opdracht" className="bg-white p-6 shadow-card sm:p-8">
      <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Opdracht</p>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{task.title}</h2>
      <p className="mt-4 max-w-3xl text-lg text-muted">{task.brief}</p>
      <ol className="mt-8 space-y-8">
        {task.steps.map((step, index) => {
          const choice = choices[step.id];
          return (
            <li key={step.id} className="border-l border-primary/30 pl-5">
              <p className="font-ui text-xs tracking-[0.16em] text-primary uppercase">Stap {index + 1}</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-ink">{step.prompt}</h3>
              <div className="mt-4 flex flex-col gap-2" role="group" aria-label={step.prompt}>
                {step.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={choice?.optionId === option.id}
                    className={`px-4 py-3 text-left text-sm ${
                      choice?.optionId === option.id ? "bg-primary text-white" : "bg-paper text-ink hover:bg-white"
                    }`}
                    onClick={() => {
                      const assessment = assessChoice(task, step.id, option.id);
                      if (!assessment) {
                        return;
                      }
                      setChoices((current) => ({ ...current, [step.id]: assessment }));
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {choice ? (
                <p className="mt-4 text-sm text-ink">
                  <span className="font-medium">{choice.builtThisWay ? "Zo is deze pagina gebouwd. " : "Dit is een ander ontwerp. "}</span>
                  {choice.consequence}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
      {answered === task.steps.length ? (
        <p className="mt-8 border-t border-black/10 pt-6 text-ink" role="status">
          {aligned === task.steps.length
            ? "Elke stap volgt deze pagina."
            : aligned === 1
              ? `1 van de ${task.steps.length} stappen volgt deze pagina. De andere blijven mogelijk, met de prijs die erbij staat.`
              : `${aligned} van de ${task.steps.length} stappen volgen deze pagina. De andere blijven mogelijk, met de prijs die erbij staat.`}
        </p>
      ) : (
        <p className="mt-8 text-sm text-muted">
          {answered} van de {task.steps.length} stappen gekozen.
        </p>
      )}
    </div>
  );
}
