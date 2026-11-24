import sys
import re

with open('src/components/CitizenLifecycleTracker.tsx', 'r') as f:
    code = f.read()

target = """  const [selectedProblemId, setSelectedProblemId] = useState<string>(defaultProblemId);"""

replacement = """  const [selectedProblemId, setSelectedProblemId] = useState<string>(defaultProblemId);

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

with open('src/components/CitizenLifecycleTracker.tsx', 'w') as f:
    f.write(code)
