import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
}

export default function ConfirmButton({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: Props) {
  const base =
    'min-h-[44px] px-4 rounded-xl text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100';
  const styles: Record<string, string> = {
    primary: 'bg-brand text-ink-950 dark:text-ink-950 font-medium active:bg-brand-dark gk-border-glow',
    ghost: 'bg-ink-50 dark:bg-ink-800 text-ink-600 dark:text-ink-300 active:bg-ink-100 dark:active:bg-ink-700 border border-ink-100 dark:border-ink-700',
    danger: 'bg-accent-coral/10 dark:bg-accent-coral/15 text-accent-coral active:bg-accent-coral/20 border border-accent-coral/30',
  };
  return (
    <button className={[base, styles[variant], className].join(' ')} {...rest}>
      {children}
    </button>
  );
}
