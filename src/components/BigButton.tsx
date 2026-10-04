import React from 'react';

interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'coral' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
  children: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
}

export const BigButton: React.FC<BigButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  subtitle,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'coral':
        return 'bg-[#FF7A59] hover:bg-[#F26744] text-white shadow-md shadow-[#FF7A59]/25 border-none';
      case 'secondary':
        return 'bg-white hover:bg-[#F7FAFA] text-[#0F5C5C] border-2 border-[#0F5C5C] shadow-sm';
      case 'danger':
        return 'bg-[#D64545] hover:bg-[#C03939] text-white shadow-md shadow-[#D64545]/25 border-none';
      case 'ghost':
        return 'bg-transparent text-[#0F5C5C] hover:bg-[#E7F3F3] border-none shadow-none';
      case 'primary':
      default:
        return 'bg-[#0F5C5C] hover:bg-[#0C4E4E] text-white shadow-md shadow-[#0F5C5C]/25 border-none';
    }
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`w-full min-h-[64px] py-3.5 px-6 rounded-[22px] flex items-center justify-center gap-3.5 text-center font-bold text-lg md:text-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-4 focus-visible:outline-[#0F5C5C] ${getVariantStyles()} ${className}`}
    >
      {loading ? (
        <span className="inline-block w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="shrink-0 text-2xl">{icon}</span>}
          <div className="flex flex-col items-center">
            <span>{children}</span>
            {subtitle && <span className="text-xs font-normal opacity-90 -mt-0.5">{subtitle}</span>}
          </div>
        </>
      )}
    </button>
  );
};
