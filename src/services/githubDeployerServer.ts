import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';

export interface DeployOptions {
  token: string;
  repo: string;
  branch?: string;
  commitMessage?: string;
}

export interface ProgressEvent {
  step: 'validating' | 'checking_repo' | 'scanning_files' | 'uploading' | 'creating_tree' | 'committing' | 'updating_ref' | 'completed' | 'error';
  message: string;
  progress: number; // 0 - 100
  details?: {
    currentFile?: string;
    completedFiles?: number;
    totalFiles?: number;
    reusedFiles?: number;
    uploadedFiles?: number;
    repoUrl?: string;
    commitUrl?: string;
    commitSha?: string;
    branch?: string;
    owner?: string;
    repo?: string;
  };
}

export type ProgressCallback = (event: ProgressEvent) => void;

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.aistudio',
  '.cache',
  'coverage',
  '.temp',
  '.tmp'
]);

const IGNORED_FILES = new Set([
  '.DS_Store',
  'bun.lock',
  'package-lock.json',
  'yarn.lock'
]);

// Helper for GitHub REST API calls
function githubRequest(
  endpoint: string,
  method: string,
  token: string,
  body: any = null
): Promise<{ status: number; data: any; headers: any }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const url = new URL(endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`);

    const req = https.request(
      url,
      {
        method,
        headers: {
          'Authorization': `token ${token.trim()}`,
          'User-Agent': 'Adoriva-Gifting-Deployer',
          'Accept': 'application/vnd.github.v3+json',
          ...(payload
            ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
              }
            : {}),
        },
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({ status: res.statusCode || 200, data: parsed, headers: res.headers });
          } catch {
            resolve({ status: res.statusCode || 200, data: responseData, headers: res.headers });
          }
        });
      }
    );

    req.on('error', (err) => {
      reject(new Error(`GitHub Network Error: ${err.message}`));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('GitHub API request timed out after 30 seconds'));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

// Compute Git's exact SHA1 blob hash
export function computeGitBlobSha(buffer: Buffer): string {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex');
}

// Recursively scan project workspace directory
export function scanProjectFiles(rootDir: string, baseDir = ''): { relPath: string; absPath: string; size: number }[] {
  let fileList: { relPath: string; absPath: string; size: number }[] = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const name = entry.name;
    // Skip hidden files except essential ones (.gitignore, .env.example)
    if (name.startsWith('.') && name !== '.gitignore' && name !== '.env.example') {
      continue;
    }
    if (IGNORED_DIRECTORIES.has(name)) {
      continue;
    }
    if (IGNORED_FILES.has(name)) {
      continue;
    }
    // Skip backup files
    if (name.includes('_backup.') || name.endsWith('.tmp')) {
      continue;
    }

    const fullPath = path.join(rootDir, name);
    const relPath = path.join(baseDir, name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      fileList = fileList.concat(scanProjectFiles(fullPath, relPath));
    } else {
      const stats = fs.statSync(fullPath);
      fileList.push({
        relPath,
        absPath: fullPath,
        size: stats.size,
      });
    }
  }

  return fileList;
}

// Concurrency pool helper to upload blobs fast without overwhelming rate limits
async function asyncPool<T, R>(poolLimit: number, array: T[], iteratorFn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const ret: Promise<R>[] = [];
  const executing: Promise<any>[] = [];

  for (let i = 0; i < array.length; i++) {
    const p = Promise.resolve().then(() => iteratorFn(array[i], i));
    ret.push(p);

    if (poolLimit <= array.length) {
      const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(ret);
}

// Main Automated Deployment Orchestrator
export async function executeGitHubDeployment(
  options: DeployOptions,
  onProgress: ProgressCallback
): Promise<{
  success: boolean;
  repoUrl: string;
  commitUrl: string;
  commitSha: string;
  branch: string;
  owner: string;
  repo: string;
  totalFiles: number;
  uploadedFiles: number;
  reusedFiles: number;
  message: string;
}> {
  const token = options.token ? options.token.trim() : '';
  if (!token) {
    throw new Error('GitHub Personal Access Token is required.');
  }

  let rawRepo = options.repo ? options.repo.trim() : '';
  if (!rawRepo) {
    throw new Error('Repository Name is required (e.g. "username/repository-name" or "adoriva").');
  }

  // Sanitize repo string (strip https://github.com/ or git@github.com: or .git)
  rawRepo = rawRepo
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/^git@github\.com:/i, '')
    .replace(/\.git$/i, '')
    .trim();

  const targetBranch = options.branch ? options.branch.trim() : 'main';
  const commitMsg = options.commitMessage || `Deploy complete Adoriva luxury website source (${new Date().toLocaleString()})`;

  // Step 1: Validate GitHub Token & Get User
  onProgress({
    step: 'validating',
    message: 'Authenticating with GitHub REST API...',
    progress: 5,
  });

  const userRes = await githubRequest('/user', 'GET', token);
  if (userRes.status === 401) {
    throw new Error('Invalid GitHub Personal Access Token. Please ensure the token is active with "repo" permissions.');
  }
  if (userRes.status !== 200 || !userRes.data?.login) {
    throw new Error(`GitHub Authentication failed (HTTP ${userRes.status}): ${userRes.data?.message || 'Unknown error'}`);
  }

  const authenticatedUser = userRes.data.login;

  // Resolve Owner and Repo
  let owner = authenticatedUser;
  let repoName = rawRepo;

  if (rawRepo.includes('/')) {
    const parts = rawRepo.split('/');
    owner = parts[0].trim();
    repoName = parts[1].trim();
  }

  // Step 2: Check or Create Repository
  onProgress({
    step: 'checking_repo',
    message: `Checking repository "${owner}/${repoName}" on GitHub...`,
    progress: 15,
    details: { owner, repo: repoName },
  });

  let repoInfoRes = await githubRequest(`/repos/${owner}/${repoName}`, 'GET', token);

  if (repoInfoRes.status === 404) {
    // If repo does not exist and owner is authenticated user, auto-create it!
    if (owner.toLowerCase() === authenticatedUser.toLowerCase()) {
      onProgress({
        step: 'checking_repo',
        message: `Repository "${owner}/${repoName}" does not exist. Automatically creating repository on GitHub...`,
        progress: 18,
        details: { owner, repo: repoName },
      });

      const createRes = await githubRequest('/user/repos', 'POST', token, {
        name: repoName,
        description: 'Adoriva - Boutique Luxury Gifting Maison E-Commerce Web Application',
        private: false,
        auto_init: true,
      });

      if (createRes.status !== 201) {
        throw new Error(`Failed to create repository "${repoName}": ${createRes.data?.message || 'Check token permissions.'}`);
      }

      repoInfoRes = createRes;
      // Brief pause to allow GitHub Git backend to initialize the default branch
      await new Promise((r) => setTimeout(r, 1500));
    } else {
      throw new Error(`Repository "${owner}/${repoName}" not found and cannot be created under another user account.`);
    }
  } else if (repoInfoRes.status !== 200) {
    throw new Error(`Failed to access repository "${owner}/${repoName}" (HTTP ${repoInfoRes.status}): ${repoInfoRes.data?.message || 'Unknown error'}`);
  }

  const repoHtmlUrl = repoInfoRes.data.html_url || `https://github.com/${owner}/${repoName}`;

  // Step 3: Check Existing Git Tree to enable delta / instant updates
  onProgress({
    step: 'checking_repo',
    message: `Fetching existing Git branch "${targetBranch}"...`,
    progress: 25,
    details: { owner, repo: repoName, branch: targetBranch },
  });

  let parentCommitSha: string | null = null;
  const existingFilesMap = new Map<string, string>(); // path -> blob sha

  const refRes = await githubRequest(`/repos/${owner}/${repoName}/git/refs/heads/${targetBranch}`, 'GET', token);
  if (refRes.status === 200 && refRes.data?.object?.sha) {
    parentCommitSha = refRes.data.object.sha;

    // Fetch existing tree recursively
    const treeRes = await githubRequest(`/repos/${owner}/${repoName}/git/trees/${parentCommitSha}?recursive=1`, 'GET', token);
    if (treeRes.status === 200 && Array.isArray(treeRes.data?.tree)) {
      for (const item of treeRes.data.tree) {
        if (item.type === 'blob' && item.path && item.sha) {
          existingFilesMap.set(item.path, item.sha);
        }
      }
    }
  }

  // Step 4: Scan Local Project Files
  onProgress({
    step: 'scanning_files',
    message: 'Scanning local website files, components, and assets...',
    progress: 35,
  });

  const workspaceRoot = process.cwd();
  const localFiles = scanProjectFiles(workspaceRoot);

  if (localFiles.length === 0) {
    throw new Error('No files found in workspace root to deploy.');
  }

  // Step 5: Determine which files need blob upload
  interface FileToDeploy {
    relPath: string;
    absPath: string;
    sha: string;
    buffer: Buffer;
    needsUpload: boolean;
  }

  const filesToDeploy: FileToDeploy[] = [];
  let reusedCount = 0;

  for (const file of localFiles) {
    const buffer = fs.readFileSync(file.absPath);
    const sha = computeGitBlobSha(buffer);
    const existingSha = existingFilesMap.get(file.relPath);

    if (existingSha && existingSha === sha) {
      reusedCount++;
      filesToDeploy.push({
        relPath: file.relPath,
        absPath: file.absPath,
        sha,
        buffer,
        needsUpload: false,
      });
    } else {
      filesToDeploy.push({
        relPath: file.relPath,
        absPath: file.absPath,
        sha,
        buffer,
        needsUpload: true,
      });
    }
  }

  const filesNeedingUpload = filesToDeploy.filter((f) => f.needsUpload);

  onProgress({
    step: 'uploading',
    message: `Ready to deploy ${localFiles.length} files (${reusedCount} already in repo, ${filesNeedingUpload.length} to upload)...`,
    progress: 40,
    details: {
      totalFiles: localFiles.length,
      reusedFiles: reusedCount,
      uploadedFiles: 0,
    },
  });

  // Step 6: Upload Blobs with concurrency pool
  let uploadedCount = 0;
  const CONCURRENCY_LIMIT = 6;

  await asyncPool(CONCURRENCY_LIMIT, filesNeedingUpload, async (file) => {
    let attempts = 0;
    while (attempts < 3) {
      try {
        attempts++;
        const blobRes = await githubRequest(`/repos/${owner}/${repoName}/git/blobs`, 'POST', token, {
          content: file.buffer.toString('base64'),
          encoding: 'base64',
        });

        if (blobRes.status === 201 && blobRes.data?.sha) {
          file.sha = blobRes.data.sha;
          break;
        } else if (blobRes.status === 403) {
          // Secondary rate limit pause
          await new Promise((r) => setTimeout(r, 1000 * attempts));
        } else {
          throw new Error(`Failed to upload ${file.relPath} (HTTP ${blobRes.status}): ${blobRes.data?.message || 'Unknown'}`);
        }
      } catch (err: any) {
        if (attempts >= 3) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, 800 * attempts));
      }
    }

    uploadedCount++;
    const uploadProgress = 40 + Math.floor((uploadedCount / (filesNeedingUpload.length || 1)) * 40);

    onProgress({
      step: 'uploading',
      message: `Uploading files (${uploadedCount}/${filesNeedingUpload.length}): ${file.relPath}`,
      progress: uploadProgress,
      details: {
        currentFile: file.relPath,
        completedFiles: reusedCount + uploadedCount,
        totalFiles: localFiles.length,
        reusedFiles: reusedCount,
        uploadedFiles: uploadedCount,
      },
    });
  });

  // Step 7: Build Complete Git Tree
  onProgress({
    step: 'creating_tree',
    message: 'Building clean Git Tree with full codebase structure...',
    progress: 85,
  });

  const treePayload = filesToDeploy.map((file) => ({
    path: file.relPath,
    mode: '100644',
    type: 'blob',
    sha: file.sha,
  }));

  // Create tree without base_tree so that removed files are pruned automatically
  const treeRes = await githubRequest(`/repos/${owner}/${repoName}/git/trees`, 'POST', token, {
    tree: treePayload,
  });

  if (treeRes.status !== 201 || !treeRes.data?.sha) {
    throw new Error(`Failed to create Git tree on GitHub: ${treeRes.data?.message || 'Unknown error'}`);
  }

  const newTreeSha = treeRes.data.sha;

  // Step 8: Create Git Commit
  onProgress({
    step: 'committing',
    message: `Creating commit on branch "${targetBranch}"...`,
    progress: 92,
  });

  const commitPayload: any = {
    message: commitMsg,
    tree: newTreeSha,
  };
  if (parentCommitSha) {
    commitPayload.parents = [parentCommitSha];
  }

  const commitRes = await githubRequest(`/repos/${owner}/${repoName}/git/commits`, 'POST', token, commitPayload);

  if (commitRes.status !== 201 || !commitRes.data?.sha) {
    throw new Error(`Failed to create Git commit on GitHub: ${commitRes.data?.message || 'Unknown error'}`);
  }

  const newCommitSha = commitRes.data.sha;

  // Step 9: Update Branch Reference
  onProgress({
    step: 'updating_ref',
    message: `Updating branch reference refs/heads/${targetBranch}...`,
    progress: 96,
  });

  let updateRefRes: any;
  if (parentCommitSha) {
    updateRefRes = await githubRequest(`/repos/${owner}/${repoName}/git/refs/heads/${targetBranch}`, 'PATCH', token, {
      sha: newCommitSha,
      force: true,
    });
  } else {
    // If ref didn't exist yet, create it
    updateRefRes = await githubRequest(`/repos/${owner}/${repoName}/git/refs`, 'POST', token, {
      ref: `refs/heads/${targetBranch}`,
      sha: newCommitSha,
    });
  }

  if (updateRefRes.status !== 200 && updateRefRes.status !== 201) {
    throw new Error(`Failed to update branch "${targetBranch}": ${updateRefRes.data?.message || 'Unknown error'}`);
  }

  const commitUrl = `${repoHtmlUrl}/commit/${newCommitSha}`;

  // Step 10: Complete!
  onProgress({
    step: 'completed',
    message: `Deployment complete! All ${localFiles.length} files successfully pushed to GitHub.`,
    progress: 100,
    details: {
      repoUrl: repoHtmlUrl,
      commitUrl,
      commitSha: newCommitSha,
      branch: targetBranch,
      owner,
      repo: repoName,
      totalFiles: localFiles.length,
      uploadedFiles: filesNeedingUpload.length,
      reusedFiles: reusedCount,
    },
  });

  return {
    success: true,
    repoUrl: repoHtmlUrl,
    commitUrl,
    commitSha: newCommitSha,
    branch: targetBranch,
    owner,
    repo: repoName,
    totalFiles: localFiles.length,
    uploadedFiles: filesNeedingUpload.length,
    reusedFiles: reusedCount,
    message: `Successfully pushed ${localFiles.length} files to ${owner}/${repoName} on branch ${targetBranch}.`,
  };
}
