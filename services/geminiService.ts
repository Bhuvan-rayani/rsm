
import { AIResearchInsight } from "../types";

// Local stub: returns deterministic insights without any external API.
export const getResearchInsights = async (taskTitle: string, description: string): Promise<AIResearchInsight> => {
  const baseKeywords = ["literature review", "methodology", "baseline", "evaluation", "limitations"];
  const roboticsExtras = ["robot kinematics", "control strategy", "simulation to real", "sensor fusion"];
  const isRobotics = /robot/i.test(taskTitle + " " + description);

  const insight: AIResearchInsight = {
    summary: `Quick brief for "${taskTitle}": identify the core problem, compare two relevant papers, and explain one in depth with practical limitations. Capture notes and prompts you use while researching.`,
    suggestedResources: [
      "Google Scholar searches",
      "IEEE/ACM digital libraries",
      "Official documentation and repos",
      "Lecture notes and tutorials",
      "Your structured notes (Notion/Obsidian)"
    ],
    keyTerms: isRobotics ? [...baseKeywords, ...roboticsExtras] : baseKeywords,
    methodologyHints: [
      "Skim abstracts and conclusions to shortlist papers",
      "Map assumptions, hardware/simulation setup, and datasets",
      "Draw a block diagram of the selected paper",
      "Reproduce one key equation or algorithm step",
      "Write limitations and compare feasibility for student-level"
    ]
  };

  // Simulate async to keep UI behavior consistent
  await new Promise((r) => setTimeout(r, 200));
  return insight;
};
