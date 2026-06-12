import type { APIRoute } from 'astro';
import { Octokit } from '@octokit/rest';

export const prerender = false;

export const GET: APIRoute = async () => {
  const token = import.meta.env.GITHUB_TOKEN;
  const owner = import.meta.env.GITHUB_OWNER;
  const repo = import.meta.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return new Response(
      JSON.stringify({ error: 'Missing GitHub configuration. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
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
      return new Response(
        JSON.stringify({ status: 'none', message: 'No workflow runs found' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        status: latest.status,
        conclusion: latest.conclusion,
        createdAt: latest.created_at,
        updatedAt: latest.updated_at,
        htmlUrl: latest.html_url,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Failed to check status:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check workflow status', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
