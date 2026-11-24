const fs = require('fs');
let code = fs.readFileSync('server/routes.ts', 'utf8');
code = code.replace(
  `    });\n\n    // 2. Trigger AI Understanding`,
  `    });\n\n    let warning;\n\n    // 2. Trigger AI Understanding`
);
code = code.replace(
  `      } catch (err) {\n        console.warn('Background AI analysis failed:', err);\n      }\n    }\n\n    const updated = db.getProblemById(problem.id);\n    res.status(201).json({ success: true, problem: updated });\n  } catch (error: any) {`,
  `      } catch (err) {\n        console.warn('Background AI analysis failed:', err);\n        warning = 'AI analysis temporarily unavailable. Your problem has been saved.';\n      }\n    }\n\n    const updated = db.getProblemById(problem.id);\n    res.status(201).json({ success: true, problem: updated, warning });\n  } catch (error: any) {`
);
code = code.replace(
  `  } catch (error: any) {\n    res.status(500).json({ error: error.message || 'Failed to submit problem' });\n  }\n});\n\n// Upload Evidence`,
  `  } catch (error: any) {\n    res.status(500).json({ error: error.message || 'Failed to submit problem' });\n  }\n});\n\napiRouter.post('/problems/:id/retry-ai', async (req, res) => {\n  try {\n    const problem = db.getProblemById(req.params.id);\n    if (!problem) return res.status(404).json({ error: 'Problem not found' });\n    const analysis = await analyzeProblemWithAI({\n      title: problem.title,\n      description: problem.description,\n      district: problem.location.district,\n      block: problem.location.block || '',\n      category: problem.category,\n      affectedPeopleCount: problem.affectedPeopleCount,\n      urgency: problem.urgency,\n      frequency: problem.frequency,\n    });\n    db.updateProblemAIAnalysis(problem.id, analysis);\n    const updated = db.getProblemById(problem.id);\n    res.json({ success: true, problem: updated });\n  } catch (err) {\n    res.status(500).json({ error: 'AI analysis temporarily unavailable. Please try again later.' });\n  }\n});\n\n// Upload Evidence`
);
fs.writeFileSync('server/routes.ts', code);
