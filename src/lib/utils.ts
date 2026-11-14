export { cn } from "cn"

/** "⌘" on Apple devices, "Ctrl " elsewhere, for shortcut hints (client only; the app renders after the store is ready). */
export const modKey = () => (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl ')
