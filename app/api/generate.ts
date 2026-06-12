import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Octokit } from '@octokit/rest';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return res.status(500).json({ error: 'Missing GitHub configuration environment variables' });
  }

  const { month, year } = req.body ?? {};
  if (!month || !year) {
    return res.status(400).json({ error: 'month and year are required' });
  }

  try {
    const octokit = new Octokit({ auth: token });

    const response = await octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: 'generate-report.yml',
      ref: 'main',
      inputs: {
        month: String(month),
        year: String(year),
      },
    });

    return res.status(200).json({
      message: `Report generation triggered for ${month} ${year}`,
      status: response.status,
    });
  } catch (error: any) {
    console.error('Failed to trigger workflow:', error);
    return res.status(500).json({
      error: 'Failed to trigger report generation',
      details: error.message,
    });
  }
}
