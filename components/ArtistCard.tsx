import { User } from 'lucide-react';
import type { ArtistMetadata } from '../types';

interface ArtistCardProps {
  artist: ArtistMetadata;
  on_click: () => void;
  animation_index?: number;
}

export function ArtistCard({ artist, on_click, animation_index }: ArtistCardProps) {
  return (
    <button
      onClick={on_click}
      className="group text-left p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 transition-all duration-200 animate-fade-in-up"
      style={animation_index !== undefined ? { animationDelay: `${animation_index * 30}ms` } : undefined}
    >
      <div className="relative aspect-square mb-3 rounded-full overflow-hidden bg-zinc-800">
        {artist.picture_url ? (
          <img
            src={artist.picture_url}
            alt={artist.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <User className="w-12 h-12 text-zinc-600" />
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm text-white truncate text-center">{artist.name}</h3>
      <p className="text-xs text-zinc-500 truncate text-center">Artist</p>
    </button>
  );
}
