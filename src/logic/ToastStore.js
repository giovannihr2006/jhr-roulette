import { create } from 'zustand'

export const useToastStore = create((set) => ({
    toasts: [],
    addToast: (message, type = 'info', duration = 3000) => {
        const id = Date.now()
        set((state) => ({
            toasts: [...state.toasts, { id, message, type }].slice(-3)
        }))

        if (duration) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id)
                }))
            }, duration)
        }
    },
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
    }))
}))
