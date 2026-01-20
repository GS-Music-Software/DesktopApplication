import { useState } from 'react'
import { Folder, Music, Check, ChevronRight } from 'lucide-react'

interface Props {
  on_done: () => void
}

export function Setup({ on_done }: Props) {
  const [step, set_step] = useState(1)
  const [path, set_path] = useState('/tmp')
  const [quality, set_quality] = useState('0')

  const finish = () => {
    localStorage.setItem('musicStoragePath', path)
    localStorage.setItem('downloadQuality', quality)
    localStorage.setItem('setupCompleted', 'true')
    on_done()
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">music</h1>
          <p className="text-zinc-500">let's get you set up</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
                <Folder className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">storage location</h2>
                <p className="text-sm text-zinc-500">where should we save your music?</p>
              </div>
              <input
                type="text"
                value={path}
                onChange={(e) => set_path(e.target.value)}
                className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                placeholder="/path/to/music"
              />
              <button
                onClick={() => set_step(2)}
                className="w-full h-11 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
              >
                continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">audio quality</h2>
                <p className="text-sm text-zinc-500">choose your preferred download quality</p>
              </div>
              <div className="space-y-2">
                {[
                  { v: '0', l: 'best quality', d: 'highest fidelity' },
                  { v: '5', l: 'high quality', d: 'balanced' },
                  { v: '9', l: 'medium quality', d: 'smaller files' },
                ].map((o) => (
                  <button
                    key={o.v}
                    onClick={() => set_quality(o.v)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      quality === o.v
                        ? 'bg-zinc-800 border-zinc-600'
                        : 'bg-zinc-800/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{o.l}</p>
                        <p className="text-xs text-zinc-500">{o.d}</p>
                      </div>
                      {quality === o.v && (
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => set_step(1)}
                  className="flex-1 h-11 bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                >
                  back
                </button>
                <button
                  onClick={() => set_step(3)}
                  className="flex-1 h-11 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                >
                  continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">you're all set</h2>
                <p className="text-sm text-zinc-500">ready to start listening</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">storage</span>
                  <span className="text-white font-medium">{path}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">quality</span>
                  <span className="text-white font-medium">
                    {quality === '0' ? 'best' : quality === '5' ? 'high' : 'medium'}
                  </span>
                </div>
              </div>
              <button
                onClick={finish}
                className="w-full h-11 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
              >
                get started
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-white' : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
