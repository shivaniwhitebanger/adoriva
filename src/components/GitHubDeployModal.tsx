import React, { useState, useEffect, useRef } from 'react';
import {
  GitBranch,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  Terminal,
  ShieldCheck,
  X,
  Copy,
  Check,
  FolderGit2,
  Lock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.ts';

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialRepo?: string;
  initialToken?: string;
  inline?: boolean;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({
  isOpen,
  onClose = () => {},
  initialRepo = 'adoriva',
  initialToken = '',
  inline = false,
}) => {
  const [token, setToken] = useState(initialToken);
  const [repo, setRepo] = useState(initialRepo);
  const [showToken, setShowToken] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStepMessage, setCurrentStepMessage] = useState('');
  const [currentStep, setCurrentStep] = useState<string>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deployResult, setDeployResult] = useState<{
    repoUrl: string;
    commitUrl: string;
    commitSha: string;
    branch: string;
    owner: string;
    repo: string;
    totalFiles: number;
    uploadedFiles: number;
    reusedFiles: number;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (!repo) setRepo('adoriva');
      if (initialToken && !token) setToken(initialToken);
    }
  }, [isOpen, initialRepo, initialToken]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp: time, message, type }]);
  };

  const handleStartDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please provide a valid GitHub Personal Access Token.');
      return;
    }
    if (!repo.trim()) {
      setError('Please enter a GitHub Repository Name (e.g. "adoriva" or "username/repository-name").');
      return;
    }

    setIsDeploying(true);
    setError(null);
    setDeployResult(null);
    setProgress(5);
    setLogs([]);
    setCurrentStep('validating');
    setCurrentStepMessage('Initiating automated GitHub deployment...');

    addLog('Starting automated deployment to GitHub...', 'info');

    try {
      const result = await api.deployToGitHub(
        {
          token: token.trim(),
          repo: repo.trim(),
          branch: 'main',
        },
        (event) => {
          if (event.progress !== undefined) {
            setProgress(event.progress);
          }
          if (event.message) {
            setCurrentStepMessage(event.message);
            const logType =
              event.step === 'completed'
                ? 'success'
                : event.step === 'error'
                ? 'error'
                : 'info';
            addLog(event.message, logType);
          }
          if (event.step) {
            setCurrentStep(event.step);
          }
          if (event.step === 'completed' && event.details) {
            setDeployResult(event.details);
          }
        }
      );

      setProgress(100);
      setCurrentStep('completed');
      setCurrentStepMessage('Deployment completed successfully!');
      if (!deployResult && result) {
        setDeployResult(result);
      }
      addLog('All files synced to branch main successfully.', 'success');
    } catch (err: any) {
      const sanitizedError = String(err?.message || 'Deployment failed. Please check token permissions and repository access.').replace(/ghp_[a-zA-Z0-9]+/g, '[REDACTED_TOKEN]');
      setError(sanitizedError);
      setCurrentStep('error');
      addLog(`Error: ${sanitizedError}`, 'error');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const cardContent = (
    <div className={`relative w-full ${inline ? 'max-w-4xl shadow-md' : 'max-w-2xl shadow-2xl max-h-[90vh]'} bg-[#F5F1EE] rounded-2xl border border-[#D4AF7C]/40 overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="bg-[#2A2222] text-[#F5F1EE] px-6 py-4 flex items-center justify-between border-b border-[#D4AF7C]/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#483A38] text-[#D4AF7C] border border-[#D4AF7C]/30">
            <FolderGit2 size={22} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-[#F5F1EE] flex items-center gap-2">
              <span>Automated GitHub Deployment</span>
              <span className="text-[10px] bg-[#D4AF7C]/20 text-[#D4AF7C] px-2 py-0.5 rounded-full border border-[#D4AF7C]/40 uppercase tracking-widest font-sans font-bold">
                REST API
              </span>
            </h3>
            <p className="text-[11px] text-[#E3C5C7]/80 font-light">
              One-click push of complete website source code, assets & configs to GitHub
            </p>
          </div>
        </div>
        {!inline && (
          <button
            onClick={onClose}
            disabled={isDeploying}
            className="p-1.5 rounded-lg text-[#E3C5C7] hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
      </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#483A38]">
          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-[#E3C5C7]/20 border border-[#D4AF7C]/30 flex items-start gap-3">
            <ShieldCheck size={18} className="text-[#D4AF7C] shrink-0 mt-0.5" />
            <div className="text-xs text-[#483A38]/90 leading-relaxed">
              <span className="font-semibold text-[#483A38]">Zero-Leak Token Security:</span> Your GitHub token is sent directly to your secure server-side API endpoint for authentication with the GitHub REST API. It is never stored in browser storage, public files, or logs.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleStartDeploy} className="space-y-4">
            {/* Input 1: GitHub Token */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#483A38] flex items-center gap-1.5">
                  <Lock size={13} className="text-[#D4AF7C]" />
                  <span>GitHub Personal Access Token</span>
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=Adoriva+Deployment"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#D4AF7C] hover:underline flex items-center gap-1"
                >
                  <span>Generate token</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  required
                  disabled={isDeploying}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-white border border-[#E3C5C7] focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] rounded-lg px-3.5 py-2.5 text-xs text-[#483A38] font-mono placeholder-[#9A8582] outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8582] hover:text-[#483A38] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-[#9A8582] mt-1">
                Requires standard <code className="bg-[#E3C5C7]/30 px-1 py-0.5 rounded text-[10px]">repo</code> scope to create commits and push project files.
              </p>
            </div>

            {/* Input 2: Repository Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#483A38] block mb-1.5 flex items-center gap-1.5">
                <GitBranch size={13} className="text-[#D4AF7C]" />
                <span>Repository Name</span>
              </label>
              <input
                type="text"
                required
                disabled={isDeploying}
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="adoriva or username/adoriva"
                className="w-full bg-white border border-[#E3C5C7] focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] rounded-lg px-3.5 py-2.5 text-xs text-[#483A38] font-mono placeholder-[#9A8582] outline-none transition"
              />
              <p className="text-[11px] text-[#9A8582] mt-1">
                You can enter just <code className="bg-[#E3C5C7]/30 px-1 py-0.5 rounded text-[10px]">adoriva</code> or <code className="bg-[#E3C5C7]/30 px-1 py-0.5 rounded text-[10px]">username/adoriva</code>. Uses default branch <code className="bg-[#E3C5C7]/30 px-1 py-0.5 rounded text-[10px]">main</code>.
              </p>
            </div>

            {/* Deploy Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isDeploying || !token.trim() || !repo.trim()}
                className="w-full bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] font-semibold text-xs py-3.5 px-4 rounded-xl transition-all duration-300 btn-luxury-shimmer active:scale-[0.99] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw size={15} className="animate-spin text-[#D4AF7C]" />
                    <span>Deploying to GitHub ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} className="text-[#D4AF7C]" />
                    <span>Deploy Entire Website to GitHub</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Deployment Progress Bar & Status */}
          {isDeploying && (
            <div className="space-y-2 p-4 bg-white rounded-xl border border-[#D4AF7C]/30 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#483A38] flex items-center gap-1.5">
                  <RefreshCw size={13} className="animate-spin text-[#D4AF7C]" />
                  <span>{currentStepMessage || 'Deploying files...'}</span>
                </span>
                <span className="font-mono font-bold text-[#D4AF7C]">{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#F5F1EE] rounded-full overflow-hidden border border-[#E3C5C7]">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF7C] to-[#483A38] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(progress, 5)}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {deployResult && (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Deployment Successful! All files pushed to GitHub.</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-emerald-600 font-medium block">Repository</span>
                  <span className="font-mono font-bold truncate block">{deployResult.owner}/{deployResult.repo}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-emerald-600 font-medium block">Branch</span>
                  <span className="font-mono font-bold block">{deployResult.branch}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-emerald-600 font-medium block">Total Files</span>
                  <span className="font-bold block">{deployResult.totalFiles} files</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-emerald-600 font-medium block">Uploaded</span>
                  <span className="font-bold block">{deployResult.uploadedFiles} new / modified</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <a
                  href={deployResult.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <ExternalLink size={14} />
                  <span>Open Repository on GitHub</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(deployResult.repoUrl)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs bg-white hover:bg-emerald-100/50 text-emerald-800 border border-emerald-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied' : 'Copy Repo Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5 text-xs animate-fadeIn">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Deployment Failed</span>
                <span className="leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          {/* Real-time Live Log Console */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#9A8582]">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal size={13} className="text-[#D4AF7C]" />
                  <span>Deployment Console Logs</span>
                </span>
                <span>{logs.length} events</span>
              </div>
              <div className="bg-[#1F1918] text-[#F5F1EE] rounded-xl p-3.5 font-mono text-[11px] h-40 overflow-y-auto space-y-1 border border-[#D4AF7C]/30 shadow-inner">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`leading-relaxed flex items-start gap-2 ${
                      log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'warning'
                        ? 'text-amber-300'
                        : 'text-[#E3C5C7]'
                    }`}
                  >
                    <span className="text-[#9A8582] select-none">[{log.timestamp}]</span>
                    <span className="flex-1 break-all">{log.message}</span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-[#F5F1EE] px-6 py-3 border-t border-[#E3C5C7] flex items-center justify-between text-[11px] text-[#9A8582] flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#D4AF7C]" />
            <span>GitHub Git Data API (Blobs, Trees, Commits, Refs)</span>
          </div>
          {!inline && (
            <button
              onClick={onClose}
              className="text-xs font-semibold text-[#483A38] hover:text-[#D4AF7C] transition-colors cursor-pointer"
            >
              {deployResult ? 'Done' : 'Close'}
            </button>
          )}
        </div>
      </div>
  );

  if (inline) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {cardContent}
    </div>
  );
};
