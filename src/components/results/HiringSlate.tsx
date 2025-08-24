import React from "react";
import { type TeamSelectionResult } from "../../types";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/SectionTitle";
import { CandidateList } from "../candidate/CandidateList";

interface HiringSlateProps {
  teamSelection: TeamSelectionResult;
}

export const HiringSlate: React.FC<HiringSlateProps> = ({ teamSelection }) => {
  return (
    <Card>
      <SectionTitle>Recommended Hiring Slate</SectionTitle>
      <CandidateList candidates={teamSelection.selected} columns={2} />
    </Card>
  );
};
