'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'sm';

type Common = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
};

type ButtonAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = Common & {
  href: string;
  disabled?: boolean;
};

const variantClass: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-strong)] focus-visible:outline-[var(--accent)]',
  secondary:
    'bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-3)] focus-visible:outline-[var(--accent)]',
  ghost:
    'bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-2)] focus-visible:outline-[var(--accent)]',
  danger: 'bg-[var(--danger)] text-white hover:opacity-90 focus-visible:outline-[var(--danger)]',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  fullWidth,
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    variantClass[variant],
    sizeClass[size],
    fullWidth && 'w-full',
    className,
  );

  if ('href' in props && props.href) {
    const { href, disabled, ...rest } = props;
    if (disabled) {
      return (
        <span className={classes} aria-disabled="true">
          {children}
        </span>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button type={buttonProps.type ?? 'button'} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
