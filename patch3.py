import sys

with open('src/lib/api.ts', 'r') as f:
    code = f.read()

target = """export async function submitProblem(data: any): Promise<{ success: boolean; problem: Problem }> {
  const res = await fetch(`${BASE_URL}/problems`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to submit problem');
  return json;
}"""

replacement = """export async function submitProblem(data: any): Promise<{ success: boolean; problem: Problem; warning?: string }> {
  const res = await fetch(`${BASE_URL}/problems`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to submit problem');
  return json;
}

export async function retryProblemAI(id: string): Promise<{ success: boolean; problem: Problem }> {
  const res = await fetch(`${BASE_URL}/problems/${id}/retry-ai`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to retry AI analysis');
  return json;
}"""

code = code.replace(target, replacement)

with open('src/lib/api.ts', 'w') as f:
    f.write(code)
