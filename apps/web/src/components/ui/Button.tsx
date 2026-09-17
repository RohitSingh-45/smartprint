'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'sm';

type Common = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
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
    'bg-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-xs)] hover:bg-[var(--accent-strong)] hover:shadow-[var(--shadow-sm)]',
  secondary:
    'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] shadow-[var(--shadow-xs)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)]',
  ghost:
    'bg-transparent text-[var(--muted-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
  danger: 'bg-[var(--danger)] text-white shadow-[var(--shadow-xs)] hover:opacity-90',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-[var(--radius-md)]',
  md: 'h-10 px-4 text-sm gap-2 rounded-[var(--radius-md)]',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-[var(--radius-lg)]',
};

const iconSize: Record<Size, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  fullWidth,
  icon: Icon,
  iconRight: IconRight,
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = cn(
    'pressable inline-flex items-center justify-center font-medium',
    'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
    'disabled:pointer-events-none disabled:opacity-45',
    variantClass[variant],
    sizeClass[size],
    fullWidth && 'w-full',
    className,
  );

  const content = (
    <>
      {Icon ? <Icon className={iconSize[size]} strokeWidth={1.85} aria-hidden /> : null}
      {children}
      {IconRight ? <IconRight className={iconSize[size]} strokeWidth={1.85} aria-hidden /> : null}
    </>
  );

  if ('href' in props && props.href) {
    const { href, disabled, ...rest } = props;
    if (disabled) {
      return (
        <span className={classes} aria-disabled="true">
          {content}
        </span>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button type={buttonProps.type ?? 'button'} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
