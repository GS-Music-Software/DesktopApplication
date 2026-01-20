import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import { X, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface EqualizerProps {
  enabled: boolean;
  preset: string;
  bands: number[];
  presets: { name: string; bands: number[] }[];
  frequencies: number[];
  on_toggle_enabled: () => void;
  on_set_preset: (name: string) => void;
  on_set_band: (index: number, value: number) => void;
  on_reset: () => void;
  on_close: () => void;
}

function format_freq(hz: number): string {
  if (hz >= 1000) return `${hz / 1000}k`;
  return `${hz}`;
}

export function Equalizer({
  enabled,
  preset,
  bands,
  presets,
  frequencies,
  on_toggle_enabled,
  on_set_preset,
  on_set_band,
  on_reset,
  on_close,
}: EqualizerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdrop-enter">
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl border border-zinc-800 animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Equalizer</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={on_reset}
              className="text-sm text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={on_close}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Switch.Root
                checked={enabled}
                onCheckedChange={on_toggle_enabled}
                className={cn(
                  "w-11 h-6 rounded-full relative transition-colors",
                  enabled ? "bg-green-500" : "bg-zinc-700"
                )}
              >
                <Switch.Thumb
                  className={cn(
                    "block w-5 h-5 bg-white rounded-full transition-transform shadow",
                    enabled ? "translate-x-[22px]" : "translate-x-[2px]"
                  )}
                />
              </Switch.Root>
              <span className="text-sm font-medium text-white">{enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Preset:</span>
              <select
                value={preset}
                onChange={(e) => on_set_preset(e.target.value)}
                className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-1.5 border border-zinc-700 focus:outline-none focus:border-zinc-600 [&>option]:bg-zinc-800 [&>option]:text-white"
              >
                {presets.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
                {preset === 'Custom' && <option value="Custom">Custom</option>}
              </select>
            </div>
          </div>

          <div className={cn("transition-opacity", !enabled && "opacity-40 pointer-events-none")}>
            <div className="flex justify-between items-end gap-2 h-48 px-2">
              {bands.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-xs text-zinc-400 font-medium">
                    {value > 0 ? `+${value}` : value}dB
                  </span>
                  <Slider.Root
                    orientation="vertical"
                    value={[value]}
                    min={-12}
                    max={12}
                    step={1}
                    onValueChange={(v) => on_set_band(index, v[0])}
                    className="relative flex items-center justify-center w-4 h-32"
                  >
                    <Slider.Track className="relative w-1 h-full rounded-full bg-zinc-700">
                      <Slider.Range className={cn(
                        "absolute w-full rounded-full",
                        value >= 0 ? "bg-green-500" : "bg-red-500"
                      )} />
                    </Slider.Track>
                    <Slider.Thumb
                      className="block w-4 h-4 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-500/50 hover:scale-110 transition-transform"
                    />
                  </Slider.Root>
                  <span className="text-xs text-zinc-500">{format_freq(frequencies[index])}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Boost
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Cut
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 text-center">
              Quick presets
            </p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {presets.slice(0, 6).map((p) => (
                <button
                  key={p.name}
                  onClick={() => on_set_preset(p.name)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full transition-colors",
                    preset === p.name
                      ? "bg-green-500 text-black font-medium"
                      : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
