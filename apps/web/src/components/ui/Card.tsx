import { cn } from '@/lib/cn';

type Props = {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  as?: 'div' | 'section' | 'article';
};

const padClass = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
} as const;

export function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  as: Tag = 'div',
}: Props) {
  return (
    <Tag
      className={cn(
        'surface-card',
        padClass[padding],
        hover &&
          'transition-[border-color,box-shadow,transform] duration-200 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
