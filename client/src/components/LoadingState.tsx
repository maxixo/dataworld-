import React from 'react';

interface LoadingStateProps {
    label?: string;
    description?: string;
    variant?: 'page' | 'section' | 'inline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const shellByVariant: Record<NonNullable<LoadingStateProps['variant']>, string> = {
    page: 'min-h-screen bg-gray-50 dark:bg-gray-900 hero-gradient',
    section: 'py-12',
    inline: '',
};

const layoutByVariant: Record<NonNullable<LoadingStateProps['variant']>, string> = {
    page: 'flex min-h-screen flex-col items-center justify-center px-6',
    section: 'flex flex-col items-center justify-center',
    inline: 'flex items-center gap-3',
};

const orbBySize: Record<NonNullable<LoadingStateProps['size']>, string> = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
};

const textBySize: Record<NonNullable<LoadingStateProps['size']>, string> = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
};

export const LoadingState: React.FC<LoadingStateProps> = ({
    label = 'Loading',
    description,
    variant = 'section',
    size = 'md',
    className = '',
}) => {
    const isInline = variant === 'inline';

    return (
        <div className={`${shellByVariant[variant]} ${className}`.trim()}>
            <div className={layoutByVariant[variant]}>
                <div className={`loader-cluster ${orbBySize[size]} ${isInline ? 'shrink-0' : ''}`}>
                    <div className="loader-glow" />
                    <div className="loader-ring" />
                    <div className="loader-ring loader-ring-delayed" />
                    <div className="loader-core" />
                </div>

                <div className={isInline ? '' : 'mt-5 text-center'}>
                    <div className={`font-medium text-gray-900 dark:text-white ${textBySize[size]}`}>
                        {label}
                        <span className="ml-1 inline-flex" aria-hidden="true">
                            <span className="loader-dot">.</span>
                            <span className="loader-dot loader-dot-delay-1">.</span>
                            <span className="loader-dot loader-dot-delay-2">.</span>
                        </span>
                    </div>
                    {description && !isInline && (
                        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
