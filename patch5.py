import sys

with open('src/components/CitizenLifecycleTracker.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "import { fetchProblemById, submitCitizenFeedback } from '../lib/api';",
    "import { fetchProblemById, submitCitizenFeedback, retryProblemAI } from '../lib/api';"
)

target = """  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    initialProblemId || allProblems[0]?.id || ''
  );"""

replacement = """  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    initialProblemId || allProblems[0]?.id || ''
  );
  const [isRetryingAI, setIsRetryingAI] = useState(false);
  const [aiRetryError, setAiRetryError] = useState<string | null>(null);

  const handleRetryAI = async (id: string) => {
    setIsRetryingAI(true);
    setAiRetryError(null);
    try {
      await retryProblemAI(id);
      await loadProblem(id);
    } catch (err: any) {
      setAiRetryError(err.message || 'Failed to retry AI analysis');
    } finally {
      setIsRetryingAI(false);
    }
  };"""
code = code.replace(target, replacement)

target2 = """      summary: hasAiAnalysis
        ? `AI classified problem as "${problem.aiAnalysis?.category || problem.category}" (${problem.aiAnalysis?.confidence || 96}% confidence), identified root cause, and computed deterministic priority score of ${problem.priority?.totalScore || 87}/100.`
        : 'AI ingestion pipeline is actively extracting root cause, required engineering disciplines, and spatial risk factors.',"""

replacement2 = """      summary: hasAiAnalysis
        ? `AI classified problem as "${problem.aiAnalysis?.category || problem.category}" (${problem.aiAnalysis?.confidence || 96}% confidence), identified root cause, and computed deterministic priority score of ${problem.priority?.totalScore || 87}/100.`
        : 'AI analysis temporarily unavailable. Your problem has been saved. Please retry analysis.',"""
code = code.replace(target2, replacement2)


target3 = """                      {st.stageNumber === 2 && problemData.problem.priority && (
                        <div className="pt-2">
                          <PriorityBreakdownDisplay priority={problemData.problem.priority} variant="full" />
                        </div>
                      )}"""

replacement3 = """                      {st.stageNumber === 2 && problemData.problem.priority && (
                        <div className="pt-2">
                          <PriorityBreakdownDisplay priority={problemData.problem.priority} variant="full" />
                        </div>
                      )}
                      
                      {st.stageNumber === 2 && !problemData.problem.aiAnalysis && (
                        <div className="pt-2 space-y-2">
                          {aiRetryError && (
                            <div className="text-rose-600 text-[10px] font-bold uppercase">{aiRetryError}</div>
                          )}
                          <button
                            onClick={() => handleRetryAI(problemData.problem.id)}
                            disabled={isRetryingAI}
                            className="bg-black text-white px-4 py-2 text-xs font-black uppercase disabled:opacity-50"
                          >
                            {isRetryingAI ? 'Retrying...' : 'Retry AI Analysis'}
                          </button>
                        </div>
                      )}"""

code = code.replace(target3, replacement3)

with open('src/components/CitizenLifecycleTracker.tsx', 'w') as f:
    f.write(code)
