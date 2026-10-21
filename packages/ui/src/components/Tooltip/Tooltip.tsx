import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ReactElement, ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  /** A single focusable element; it becomes the trigger. */
  children: ReactElement;
  side?: TooltipPrimitive.TooltipContentProps['side'];
  defaultOpen?: boolean;
}

export function Tooltip({ content, children, side = 'top', defaultOpen }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root defaultOpen={defaultOpen}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={8}
            className="z-50 max-w-64 rounded-[calc(var(--am-radius-control)-2px)] bg-fg px-2.5 py-1.5 text-xs font-semibold text-surface shadow-2"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-fg" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
