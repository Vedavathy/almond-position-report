import type { APIRoute } from 'astro';
import { Octokit } from '@octokit/rest';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = import.meta.env.GITHUB_TOKEN;
  const owner = import.meta.env.GITHUB_OWNER;
  const repo = import.meta.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return new Response(
      JSON.stringify({ error: 'Missing GitHub configuration. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { month?: string; year?: number };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { month, year } = body;
  if (!month || !year) {
    return new Response(
      JSON.stringify({ error: 'month and year are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
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

    return new Response(
      JSON.stringify({ message: `Report generation triggered for ${month} ${year}`, status: response.status }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Failed to trigger workflow:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to trigger report generation', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
