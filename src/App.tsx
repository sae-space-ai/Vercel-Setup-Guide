import { useState, useCallback } from 'react';

interface Step {
  id: string;
  title: string;
  description: string;
  commands: { label: string; code: string }[];
  notes?: string;
  completed: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function CommandBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="mb-3">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <div className="flex items-center bg-gray-900 rounded-lg p-3 border border-gray-700">
        <code className="text-sm text-green-400 font-mono flex-1 break-all">{code}</code>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function StepCard({
  step,
  index,
  onToggle,
  isActive,
}: {
  step: Step;
  index: number;
  onToggle: () => void;
  isActive: boolean;
}) {
  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        isActive
          ? 'border-blue-500 bg-gray-800/80 shadow-lg shadow-blue-500/10'
          : step.completed
          ? 'border-green-500/50 bg-gray-800/50'
          : 'border-gray-700 bg-gray-800/30'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            step.completed
              ? 'bg-green-500 text-white'
              : isActive
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          {step.completed ? '✓' : index + 1}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{step.description}</p>
        </div>
        <div
          className={`text-gray-400 transition-transform ${
            isActive ? 'rotate-180' : ''
          }`}
        >
          ▼
        </div>
      </button>

      {isActive && (
        <div className="px-5 pb-5 border-t border-gray-700 pt-4">
          {step.commands.map((cmd, i) => (
            <CommandBlock key={i} label={cmd.label} code={cmd.code} />
          ))}
          {step.notes && (
            <div className="mt-4 p-3 rounded-lg bg-blue-900/30 border border-blue-700/50">
              <p className="text-sm text-blue-300">
                <span className="font-semibold">ℹ️ Note:</span> {step.notes}
              </p>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              step.completed
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {step.completed ? 'Mark as Incomplete' : 'Mark as Complete ✓'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeStep, setActiveStep] = useState<string | null>('cli-check');
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 'cli-check',
      title: 'Check for existing Vercel CLI',
      description: 'Verify if Vercel CLI is already installed on your system',
      commands: [
        { label: 'Check version', code: 'vercel --version' },
      ],
      notes: 'If this command returns a version number, you can skip to Step 3. If it says "command not found", proceed to Step 2.',
      completed: false,
    },
    {
      id: 'cli-install',
      title: 'Install Vercel CLI',
      description: 'Install the latest version of the Vercel CLI globally',
      commands: [
        { label: 'Install Vercel CLI', code: 'npm install --global vercel@latest' },
        { label: 'Verify installation', code: 'vercel --version' },
      ],
      notes: 'If an update is available, run the same install command again to update.',
      completed: false,
    },
    {
      id: 'cli-auth',
      title: 'Authenticate with Vercel',
      description: 'Sign in to your Vercel account or create a new one',
      commands: [
        { label: 'Check if already authenticated', code: 'vercel whoami' },
        { label: 'Sign up for a new account', code: 'vercel signup' },
        { label: 'Or log in to existing account', code: 'vercel login' },
        { label: 'Verify authentication', code: 'vercel whoami' },
      ],
      notes: 'Pause here while you complete sign-up or sign-in in the browser. Then verify with "vercel whoami".',
      completed: false,
    },
    {
      id: 'plugin-install',
      title: 'Install Vercel Plugin (Preferred)',
      description: 'Add the Vercel plugin for agent guidance (requires Node.js 18+)',
      commands: [
        { label: 'Check Node.js version', code: 'node --version' },
        { label: 'Install Vercel plugin', code: 'npx plugins add vercel/vercel-plugin' },
      ],
      notes: 'Requires Node.js 18+. If the plugin install fails or your agent doesn\'t support plugins, use the standalone skills fallback instead.',
      completed: false,
    },
    {
      id: 'skills-fallback',
      title: 'Install Standalone Skills (Fallback)',
      description: 'Alternative to the plugin - use standalone skills if the plugin can\'t be installed',
      commands: [
        { label: 'List current skills', code: 'npx skills list' },
        { label: 'Add Vercel agent skills globally', code: 'npx skills add vercel-labs/agent-skills --global' },
        { label: 'Verify skills installed', code: 'npx skills list' },
      ],
      notes: 'Choose the current agent if prompted. The standalone pack is smaller than the plugin and does not include its complete command, agent, and automation system.',
      completed: false,
    },
    {
      id: 'mcp-setup',
      title: 'Connect Vercel MCP Server',
      description: 'Set up the shared Vercel MCP endpoint for cross-project access',
      commands: [
        { label: 'For Claude Code', code: 'vercel mcp --clients "Claude Code"' },
        { label: 'For Cursor', code: 'vercel mcp --clients "Cursor"' },
        { label: 'For VS Code with Copilot', code: 'vercel mcp --clients "VS Code with Copilot"' },
      ],
      notes: 'Use the command matching your editor/IDE. This connects the shared endpoint at https://mcp.vercel.com for access to Vercel projects, deployments, logs, and analytics.',
      completed: false,
    },
    {
      id: 'mcp-verify',
      title: 'Verify MCP Connection',
      description: 'Authenticate and verify the MCP server is working',
      commands: [
        { label: 'MCP endpoint URL', code: 'https://mcp.vercel.com' },
        { label: 'Manual fallback (Claude Code)', code: 'claude mcp add --transport http vercel --scope user https://mcp.vercel.com' },
        { label: 'Manual fallback (Cursor) - add to ~/.cursor/mcp.json', code: '{\n  "mcpServers": {\n    "vercel": {\n      "url": "https://mcp.vercel.com"\n    }\n  }\n}' },
      ],
      notes: 'When a browser or consent screen opens, complete the OAuth flow. After authorization, verify by calling search_vercel_documentation and list_teams tools.',
      completed: false,
    },
  ]);

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
    if (activeStep === id) {
      setActiveStep(null);
    } else {
      setActiveStep(id);
    }
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <span className="text-black font-bold text-lg">▲</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Vercel Setup Guide</h1>
              <p className="text-xs text-gray-400">
                Based on vercel.com/get-started.md
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {completedCount}/{steps.length} steps
            </span>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
          <h2 className="text-2xl font-bold mb-2">
            🚀 Set Up Vercel for Your AI Coding Agent
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Follow this interactive guide to install the Vercel CLI, add platform
            guidance, and connect the official Vercel MCP server. Run Section 1
            once per machine, Sections 2–3 once per coding agent.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs rounded-full bg-blue-900/50 text-blue-300 border border-blue-700/50">
              CLI
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50">
              Plugin / Skills
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-green-900/50 text-green-300 border border-green-700/50">
              MCP Server
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs text-white">
                1
              </span>
              Install the Vercel CLI
              <span className="text-xs text-gray-500 font-normal normal-case">
                (once per machine)
              </span>
            </h3>
            <div className="space-y-3">
              {steps.slice(0, 3).map((step, i) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={i}
                  isActive={activeStep === step.id}
                  onToggle={() => toggleStep(step.id)}
                />
              ))}
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-xs text-white">
                2
              </span>
              Add Vercel Guidance
              <span className="text-xs text-gray-500 font-normal normal-case">
                (plugin OR skills — not both)
              </span>
            </h3>
            <div className="space-y-3">
              {steps.slice(3, 5).map((step, i) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={i + 3}
                  isActive={activeStep === step.id}
                  onToggle={() => toggleStep(step.id)}
                />
              ))}
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-green-600 flex items-center justify-center text-xs text-white">
                3
              </span>
              Connect Vercel MCP
              <span className="text-xs text-gray-500 font-normal normal-case">
                (once per agent)
              </span>
            </h3>
            <div className="space-y-3">
              {steps.slice(5).map((step, i) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={i + 5}
                  isActive={activeStep === step.id}
                  onToggle={() => toggleStep(step.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Completion Report */}
        {completedCount === steps.length && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700/50">
            <h3 className="text-xl font-bold text-green-400 mb-4">
              ✅ Vercel Agent Setup Complete!
            </h3>
            <div className="font-mono text-sm text-gray-300 space-y-1">
              <p>▲ Vercel agent setup is ready</p>
              <p>
                CLI: installed &amp; authenticated
              </p>
              <p>
                Guidance: plugin or skills installed
              </p>
              <p>
                MCP: connected, global shared endpoint, https://mcp.vercel.com
              </p>
            </div>
          </div>
        )}

        {/* Resources */}
        <div className="mt-8 p-6 rounded-xl bg-gray-800/50 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">📚 Resources</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a
                href="https://vercel.com/docs/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Vercel CLI Documentation
              </a>
            </li>
            <li>
              <a
                href="https://vercel.com/docs/agent-resources/vercel-plugin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Vercel Plugin Docs
              </a>
            </li>
            <li>
              <a
                href="https://vercel.com/docs/agent-resources/skills"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Standalone Skills Docs
              </a>
            </li>
            <li>
              <a
                href="https://vercel.com/docs/agent-resources/vercel-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Vercel MCP Documentation
              </a>
            </li>
            <li>
              <a
                href="https://vercel.com/docs/cli/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                CLI MCP Configuration
              </a>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          Based on{' '}
          <a
            href="https://vercel.com/get-started.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            vercel.com/get-started.md
          </a>{' '}
          • Interactive setup guide for AI coding agents
        </div>
      </footer>
    </div>
  );
}
