import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X, Copy } from 'lucide-react';

export function TitleBar() {
    const [is_maximized, set_is_maximized] = useState(false);

    useEffect(() => {
        const check_maximized = async () => {
            try {
                const win = getCurrentWindow();
                set_is_maximized(await win.isMaximized());
            } catch (e) {
                console.error('Failed to check window state:', e);
            }
        };

        check_maximized();

        const win = getCurrentWindow();
        const unlisten_resize = win.listen('tauri://resize', check_maximized);

        return () => {
            unlisten_resize.then(unlisten => unlisten());
        };
    }, []);

    const handle_minimize = async () => {
        try {
            await getCurrentWindow().minimize();
        } catch (e) {
            console.error('Minimize failed:', e);
        }
    };

    const handle_maximize = async () => {
        try {
            const win = getCurrentWindow();
            await win.toggleMaximize();
            set_is_maximized(await win.isMaximized());
        } catch (e) {
            console.error('Maximize failed:', e);
        }
    };

    const handle_close = async () => {
        try {
            await getCurrentWindow().close();
        } catch (e) {
            console.error('Close failed:', e);
        }
    };

    const handle_drag = async (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        try {
            await getCurrentWindow().startDragging();
        } catch (e) {
            console.error('Start dragging failed:', e);
        }
    };

    return (
        <div
            onMouseDown={handle_drag}
            className="absolute top-0 left-0 right-0 h-10 flex items-start justify-end select-none z-[100] w-full"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

            <div className="flex z-10">
                <button
                    onClick={handle_minimize}
                    className="h-8 w-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none rounded-bl-lg"
                    title="Minimize"
                >
                    <Minus className="w-4 h-4" />
                </button>

                <button
                    onClick={handle_maximize}
                    className="h-8 w-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                    title={is_maximized ? 'Restore' : 'Maximize'}
                >
                    {is_maximized ? (
                        <Copy className="w-3.5 h-3.5 transform rotate-180" />
                    ) : (
                        <Square className="w-3.5 h-3.5" />
                    )}
                </button>

                <button
                    onClick={handle_close}
                    className="h-8 w-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500 transition-colors focus:outline-none"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
