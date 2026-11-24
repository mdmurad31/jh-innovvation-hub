import sys

with open('src/components/CitizenLifecycleTracker.tsx', 'r') as f:
    code = f.read()

target = """  const [selectedProblemId, setSelectedProblemId] = useState<string>(
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

code = code.replace(target, """  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    initialProblemId || allProblems[0]?.id || ''
  );""")

target_vars = """  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    initialProblemId || allProblems[0]?.id || ''
  );"""

replacement_vars = """  const [selectedProblemId, setSelectedProblemId] = useState<string>(
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

code = code.replace(target_vars, replacement_vars)

with open('src/components/CitizenLifecycleTracker.tsx', 'w') as f:
    f.write(code)
