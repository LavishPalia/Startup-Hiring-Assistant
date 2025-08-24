import React from "react";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/SectionTitle";

export const AlgorithmExplanation: React.FC = () => {
  return (
    <Card>
      <SectionTitle>How the Algorithm Works</SectionTitle>
      <ol className="list-decimal ml-5 space-y-3 text-sm text-slate-700">
        <li>
          We check each candidate's <strong>expected salary</strong> — lower
          salaries score better for budget-friendliness.
        </li>
        <li>
          We look at their <strong>past job titles</strong> to see if they match
          the role (e.g. "Full Stack Developer").
        </li>
        <li>
          We scan their <strong>skills</strong> for keywords relevant to the
          job.
        </li>
        <li>
          Each of these signals is <strong>scaled fairly</strong> so they can be
          compared apples-to-apples.
        </li>
        <li>
          We combine them into a single score using the weights you set above.
        </li>
        <li>
          Candidates are ranked by score. If two are close, the system prefers
          the one with a lower salary or more skills.
        </li>
        <li>
          Finally, we pick the top person for each role. With the diversity
          option on, we try to spread hires across different locations when
          possible.
        </li>
      </ol>
      <p className="text-xs text-slate-500 mt-4">
        You can adjust the sliders above to give more importance to experience,
        skills, or budget. The weights always add up to 100%.
      </p>
    </Card>
  );
};
