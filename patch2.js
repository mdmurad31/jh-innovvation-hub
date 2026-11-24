const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');
code = code.replace(
  'export async function submitProblem(data: any): Promise<{ success: boolean; problem: Problem }> {\n  const res = await fetch(`${BASE_URL}/problems`, {\n    method: \'POST\',\n    headers: getAuthHeaders(),\n    body: JSON.stringify(data),\n  });\n  const json = await res.json();\n  if (!res.ok) throw new Error(json.error || \'Failed to submit problem\');\n  return json;\n}',
  'export async function submitProblem(data: any): Promise<{ success: boolean; problem: Problem; warning?: string }> {\n  const res = await fetch(`${BASE_URL}/problems`, {\n    method: \'POST\',\n    headers: getAuthHeaders(),\n    body: JSON.stringify(data),\n  });\n  const json = await res.json();\n  if (!res.ok) throw new Error(json.error || \'Failed to submit problem\');\n  return json;\n}\n\nexport async function retryProblemAI(id: string): Promise<{ success: boolean; problem: Problem }> {\n  const res = await fetch(`${BASE_URL}/problems/${id}/retry-ai`, {\n    method: \'POST\',\n    headers: getAuthHeaders(),\n  });\n  const json = await res.json();\n  if (!res.ok) throw new Error(json.error || \'Failed to retry AI analysis\');\n  return json;\n}'
);
fs.writeFileSync('src/lib/api.ts', code);
