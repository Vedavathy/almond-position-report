import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Octokit } from '@octokit/rest';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return res.status(500).json({ error: 'Missing GitHub configuration environment variables' });
  }

  try {
    const octokit = new Octokit({ auth: token });

    const { data } = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: 'generate-report.yml',
      per_page: 1,
    });

    const latest = data.workflow_runs[0];
    if (!latest) {
      return res.status(200).json({ status: 'none', message: 'No workflow runs found' });
    }

    return res.status(200).json({
      status: latest.status,
      conclusion: latest.conclusion,
      createdAt: latest.created_at,
      updatedAt: latest.updated_at,
      htmlUrl: latest.html_url,
    });
  } catch (error: any) {
    console.error('Failed to check status:', error);
    return res.status(500).json({ error: 'Failed to check workflow status', details: error.message });
  }
}
