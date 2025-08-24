import React, { useMemo, useState, useCallback, useEffect } from "react";
import { type Candidate } from "./types";
import { DEFAULT_WEIGHTS, TARGET_CATEGORIES } from "./constants/categories";
import { selectTeam, normalizeWeights } from "./utils/scoring";
import { convertToCSV } from "./utils/csvExport";
import { Card } from "./components/ui/Card";
import { Loader } from "./components/ui/Loader";
import { WeightControls } from "./components/controls/WeightControls";
import { HiringSlate } from "./components/results/HiringSlate";
import { AlgorithmExplanation } from "./components/results/AlgorithmExplanation";
import { CategoryCandidates } from "./components/candidate/CategoryCandidates";
import { FileUpload } from "./components/upload/FileUpload";
import { SectionTitle } from "./components/ui/SectionTitle";

const App: React.FC = () => {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [enableDiversity, setEnableDiversity] = useState(true);
  const [candidatesData, setCandidatesData] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const importedData = await import("./data/form-submissions.json");
          setCandidatesData(
            (importedData.default || importedData) as Candidate[]
          );
          setError(null);
        } catch (importError) {
          setError("Could not load candidate data. Please upload a JSON file.");
        }
      } catch (err) {
        setError("Failed to load candidate data");
        console.error("Error loading candidates:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, []);

  const normalizedWeights = useMemo(() => normalizeWeights(weights), [weights]);

  const teamSelection = useMemo(() => {
    if (candidatesData.length === 0) return null;
    return selectTeam(candidatesData, normalizedWeights, enableDiversity);
  }, [candidatesData, normalizedWeights, enableDiversity]);

  const totalCost = useMemo(() => {
    if (!teamSelection) return 0;
    return teamSelection.selected.reduce(
      (sum, candidate) => sum + (candidate.salary ?? 0),
      0
    );
  }, [teamSelection]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = JSON.parse(content);
          setCandidatesData(Array.isArray(parsedData) ? parsedData : []);
          setError(null);
        } catch (err) {
          setError("Invalid JSON file. Please upload a valid JSON file.");
          console.error("Error parsing JSON:", err);
        }
      };
      reader.readAsText(file);
    },
    []
  );

  const exportCSV = useCallback(() => {
    if (!teamSelection) return;

    const csvContent = convertToCSV(teamSelection.selected);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "hiring_slate.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [teamSelection]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Startup Hiring Assistant
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Select one candidate per role (budget & skill aware) — upload JSON
              or use sample data
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <FileUpload onFileUpload={handleFileUpload} />
            <button
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={exportCSV}
              disabled={!teamSelection || teamSelection.selected.length === 0}
            >
              Export CSV
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <WeightControls
          weights={weights}
          onWeightsChange={setWeights}
          enableDiversity={enableDiversity}
          onDiversityChange={setEnableDiversity}
          totalCost={totalCost}
        />

        {teamSelection && candidatesData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <HiringSlate teamSelection={teamSelection} />

              <Card>
                <SectionTitle>Top Candidates per Category</SectionTitle>
                <div className="space-y-6">
                  {TARGET_CATEGORIES.map((category) => (
                    <CategoryCandidates
                      key={category}
                      category={category}
                      candidates={teamSelection.byCategory[category] ?? []}
                    />
                  ))}
                </div>
              </Card>
            </div>

            <aside>
              <AlgorithmExplanation />
            </aside>
          </div>
        )}

        {candidatesData.length === 0 && !isLoading && (
          <Card>
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-slate-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No candidate data
              </h3>
              <p className="text-slate-600 mb-4">
                Upload a JSON file to get started
              </p>
              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload JSON File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </Card>
        )}

        <footer className="mt-10 text-center text-xs text-slate-500">
          Built for a startup with $100M funding: balances seniority, skills,
          and runway.
        </footer>
      </div>
    </div>
  );
};

export default App;
