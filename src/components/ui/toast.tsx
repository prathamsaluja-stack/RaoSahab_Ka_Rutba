'use client';

import * as React from 'react';
import { Toast as ToastPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: 'neutral' | 'success' | 'urgent';
}

type ToastContextValue = (message: Omit<ToastMessage, 'id'>) => void;

const ToastContext = React.createContext<ToastContextValue | null>(null);

/** Confirmation messages. A toast never replaces a written record. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<ToastMessage[]>([]);

  const push = React.useCallback<ToastContextValue>((message) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setMessages((current) => [...current, { ...message, id }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={push}>
      <ToastPrimitive.Provider swipeDirection="right" duration={6000}>
        {children}
        {messages.map((message) => (
          <ToastPrimitive.Root
            key={message.id}
            onOpenChange={(open) => {
              if (!open) dismiss(message.id);
            }}
            className={cn(
              'flex w-80 items-start gap-3 rounded-[var(--radius-card)] border bg-[var(--surface)] p-4 shadow-[var(--shadow-overlay)]',
              message.tone === 'success' && 'border-[var(--success)]',
              message.tone === 'urgent' && 'border-[var(--urgent)]',
              (message.tone ?? 'neutral') === 'neutral' && 'border-[var(--border)]',
            )}
          >
            <div className="min-w-0 flex-1">
              <ToastPrimitive.Title className="text-sm font-medium text-text">
                {message.title}
              </ToastPrimitive.Title>
              {message.description ? (
                <ToastPrimitive.Description className="mt-1 text-xs text-text-muted">
                  {message.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close
              aria-label="Dismiss"
              className="rounded-[var(--radius-input)] px-1 text-text-muted hover:bg-[var(--surface-muted)]"
            >
              ×
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed right-6 bottom-6 z-50 flex w-80 flex-col gap-3 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}
