import { useState } from 'react';
import { User as UserIcon, LogOut } from 'lucide-react';
import type { User } from '../types';

interface UserMenuProps {
  user: User;
  on_logout: () => void;
  on_open_profile: () => void;
}

export function UserMenu({ user, on_logout, on_open_profile }: UserMenuProps) {
  const [is_open, set_is_open] = useState(false);

  const avatar_url = user.avatar_url || null;

  return (
    <div className="relative">
      <button
        onClick={() => set_is_open(!is_open)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        {avatar_url ? (
          <img
            src={avatar_url}
            alt={user.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-zinc-400" />
          </div>
        )}
      </button>

      {is_open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => set_is_open(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-zinc-900 rounded-lg shadow-2xl border border-zinc-800 overflow-hidden">
            <button
              onClick={() => {
                set_is_open(false);
                on_open_profile();
              }}
              className="w-full p-3 border-b border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {avatar_url ? (
                  <img
                    src={avatar_url}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-zinc-400" />
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{user.username}</p>
                  <p className="text-xs text-zinc-500">View profile</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                set_is_open(false);
                on_logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-white">Sign out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
