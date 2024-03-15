import { cn } from '@/utils';
import { ComponentProps, FC, PropsWithChildren, forwardRef } from 'react';

type ButtonProps = PropsWithChildren<
  {
    className?: string;
    disabled?: boolean;

    // loading state
    isLoading?: boolean;
    loadingText?: string;
  } & ComponentProps<'button'>
>;

const ButtonComponent: FC<ButtonProps> = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ children, onClick, disabled, isLoading, loadingText, className }, ref) => {
  return (
    <button
      className={cn(
        'flex h-[36px] items-center justify-center rounded-full border border-gray-700 bg-gray-800 px-4 text-base font-medium text-white',
        'hover:bg-gray-700 hover:text-white',
        'focus:bg-gray-700 focus:text-white focus:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      onClick={onClick}
      ref={ref}
      disabled={isLoading || disabled}
    >
      {isLoading ? loadingText : children}
    </button>
  );
});

ButtonComponent.displayName = 'Button';

export const Button = ButtonComponent;
