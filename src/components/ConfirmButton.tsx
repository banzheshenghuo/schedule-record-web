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
    'min-h-[44px] px-4 rounded-xl text-sm font-medium transition-colors active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100';
  const styles: Record<string, string> = {
    primary: 'bg-brand text-white active:bg-brand-dark',
    ghost: 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 active:bg-gray-200 dark:active:bg-zinc-600',
    danger: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 active:bg-red-100',
  };
  return (
    <button className={[base, styles[variant], className].join(' ')} {...rest}>
      {children}
    </button>
  );
}
