import type { DownloadProgress as DownloadProgressType } from '../types';

interface DownloadProgressProps {
  progress: DownloadProgressType;
}

export function DownloadProgress({ progress }: DownloadProgressProps) {
  return (
    <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-400">{progress.status}</span>
        <span className="text-sm font-medium text-white">{progress.progress.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-300"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
    </div>
  );
}
