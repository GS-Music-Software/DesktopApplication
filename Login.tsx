import { useState } from 'react'
import { User, UserPlus, ChevronRight, AlertCircle } from 'lucide-react'

interface Props {
  on_login: (u: string, p: string) => Promise<boolean>
  on_register: (u: string, p: string, k: string) => Promise<boolean>
  error: string | null
  is_loading: boolean
  clear_error: () => void
}

export function Login({ on_login, on_register, error, is_loading, clear_error }: Props) {
  const [mode, set_mode] = useState<'login' | 'register'>('login')
  const [user, set_user] = useState('')
  const [pass, set_pass] = useState('')
  const [pass2, set_pass2] = useState('')
  const [key, set_key] = useState('')
  const [err, set_err] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    set_err(null)
    clear_error()

    if (mode === 'register' && pass !== pass2) {
      set_err('passwords do not match')
      return
    }

    if (mode === 'login') {
      await on_login(user, pass)
    } else {
      await on_register(user, pass, key)
    }
  }

  const flip = () => {
    set_mode(mode === 'login' ? 'register' : 'login')
    set_err(null)
    clear_error()
    set_pass('')
    set_pass2('')
    set_key('')
  }

  const msg = err || error

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">GS-Music</h1>
          <p className="text-zinc-500">
            {mode === 'login' ? 'welcome back' : 'create your account'}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
              {mode === 'login' ? (
                <User className="w-6 h-6 text-zinc-400" />
              ) : (
                <UserPlus className="w-6 h-6 text-zinc-400" />
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-1">
                {mode === 'login' ? 'sign in' : 'sign up'}
              </h2>
              <p className="text-sm text-zinc-500">
                {mode === 'login'
                  ? 'enter your credentials to continue'
                  : 'create an account to get started'}
              </p>
            </div>

            {msg && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{msg}</p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <input
                  type="text"
                  value={key}
                  onChange={(e) => set_key(e.target.value.toUpperCase())}
                  className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 font-mono"
                  placeholder="invite key"
                  required
                />
              )}

              <input
                type="text"
                value={user}
                onChange={(e) => set_user(e.target.value)}
                className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                placeholder="username"
                required
                minLength={3}
                autoComplete="username"
              />

              <input
                type="password"
                value={pass}
                onChange={(e) => set_pass(e.target.value)}
                className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                placeholder="password"
                required
                minLength={4}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />

              {mode === 'register' && (
                <input
                  type="password"
                  value={pass2}
                  onChange={(e) => set_pass2(e.target.value)}
                  className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  placeholder="confirm password"
                  required
                  minLength={4}
                  autoComplete="new-password"
                />
              )}

              <button
                type="submit"
                disabled={is_loading}
                className="w-full h-11 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {is_loading ? (
                  'loading...'
                ) : (
                  <>
                    {mode === 'login' ? 'sign in' : 'create account'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={flip}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {mode === 'login'
                  ? "don't have an account? sign up"
                  : 'already have an account? sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
