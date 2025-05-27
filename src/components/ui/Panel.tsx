import React from 'react';
import { cn } from '@/lib/utils';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'h-full w-full rounded-lg shadow-inner overflow-y-auto',
          'bg-panel-bg text-foreground custom-scrollbar',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Panel.displayName = 'Panel';

export { Panel }; 