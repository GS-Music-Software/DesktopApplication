import { Disc } from 'lucide-react';
import type { AlbumMetadata } from '../types';

interface AlbumCardProps {
  album: AlbumMetadata;
  onClick: () => void;
  animation_index?: number;
}

export function AlbumCard({ album, onClick, animation_index }: AlbumCardProps) {
  return (
    <button
      onClick={onClick}
      className="group text-left p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 transition-all duration-200 animate-fade-in-up"
      style={animation_index !== undefined ? { animationDelay: `${animation_index * 30}ms` } : undefined}
    >
      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-zinc-800">
        {album.cover_url ? (
          <img
            src={album.cover_url}
            alt={album.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <Disc className="w-12 h-12 text-zinc-600" />
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm text-white truncate mb-1">{album.title}</h3>
      <p className="text-xs text-zinc-500 truncate">{album.artist}</p>
      {album.release_date && (
        <p className="text-xs text-zinc-600 truncate">{album.release_date.substring(0, 4)}</p>
      )}
    </button>
  );
}
