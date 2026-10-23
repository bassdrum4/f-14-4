// The first-flight tutorial: what to teach, and when a step is done.
//
// The sortie itself is the normal carrier launch; this module only owns the
// words on the glass and the conditions that move the lesson along. Keeping the
// progression pure means the diagnostic can fly the steps without WebGL.

import { keyLabel, type Action } from "./settings";

export const TUTORIAL_STEP_COUNT = 4;

export interface TutorialCard {
  title: string;
  body: string;
}

export interface TutorialHud extends TutorialCard {
  /** 1-based step number for the card's header. */
  step: number;
  count: number;
  complete: boolean;
}

export function tutorialCards(bindings: Record<Action, string>): TutorialCard[] {
  const up = keyLabel(bindings.throttleUp);
  const cat = keyLabel(bindings.cat);
  const pitch = keyLabel(bindings.pitchUp);
  const gear = keyLabel(bindings.gear);
  const fire = keyLabel(bindings.fire);
  return [
    {
      title: "CAT SHOT",
      body: `Hold ${up} for full power, then hold ${cat} until the shuttle fires. Ease back with ${pitch} as the bow drops away.`,
    },
    {
      title: "CLEAN UP",
      body: `Gear up: ${gear}. Climb to 1,500 ft. The bandit is circling ahead — the arrow around the gun sight points straight at him.`,
    },
    {
      title: "GUNS",
      body: `Put the green gun cross on the bandit and hold ${fire}. Short bursts track better than one long hose; watch the range readout.`,
    },
    {
      title: "TUTORIAL COMPLETE",
      body: "That was your first splash. Keep flying, or press Esc for the flight menu. The tutorial stays under Sortie Setup whenever you want it again.",
    },
  ];
}

export interface TutorialFlight {
  onGround: boolean;
  gearDown: boolean;
  /** Altitude above the sea, metres. */
  altitudeM: number;
  kills: number;
}

/**
 * The next step, given the jet's state. Steps never go backwards: a pilot who
 * drops the gear again after cleaning up does not reopen the gear lesson.
 */
export function advanceTutorialStep(step: number, f: TutorialFlight): number {
  if (step === 0 && !f.onGround) return 1;
  if (step === 1 && !f.gearDown && f.altitudeM > 450) return 2;
  if (step === 2 && f.kills > 0) return 3;
  return step;
}

export function tutorialHud(step: number, bindings: Record<Action, string>): TutorialHud {
  const cards = tutorialCards(bindings);
  const index = Math.min(Math.max(step, 0), cards.length - 1);
  const card = cards[index];
  return {
    step: index + 1,
    count: cards.length,
    complete: step >= cards.length - 1,
    title: card.title,
    body: card.body,
  };
}
