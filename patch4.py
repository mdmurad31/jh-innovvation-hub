import sys

with open('src/components/CitizenSubmitView.tsx', 'r') as f:
    code = f.read()

target = """      const res = await submitProblem(payload);
      if (res.success && res.problem) {
        setSubmittedProblem(res.problem);
        setTrackingProblemId(res.problem.id);
        onProblemCreated(res.problem);

        // Clear draft from storage on successful submission
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {
          // ignore
        }

        // Switch to lifecycle view after submission
        setActiveSubTab('lifecycle');
      } else {
        setErrorMsg('Submission failed. Please check required fields.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };"""

replacement = """      const res = await submitProblem(payload);
      if (res.success && res.problem) {
        setSubmittedProblem(res.problem);
        setTrackingProblemId(res.problem.id);
        onProblemCreated(res.problem);

        // Clear draft from storage on successful submission
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {
          // ignore
        }
        
        if (res.warning) {
          setErrorMsg(res.warning);
        } else {
          setErrorMsg(null);
        }

        // Switch to lifecycle view after submission
        setActiveSubTab('lifecycle');
      } else {
        setErrorMsg('Submission failed. Please check required fields.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };"""

code = code.replace(target, replacement)

with open('src/components/CitizenSubmitView.tsx', 'w') as f:
    f.write(code)
