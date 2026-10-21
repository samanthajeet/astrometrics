import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cx } from '../cx';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cx('flex gap-1 overflow-x-auto border-b border-line', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cx(
        '-mb-px inline-flex h-10 cursor-pointer items-center gap-2 border-b-[3px] border-transparent px-3 text-sm font-semibold whitespace-nowrap text-muted transition-colors duration-150 hover:text-fg',
        'data-[state=active]:border-accent data-[state=active]:text-fg',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps) {
  return <TabsPrimitive.Content className={cx('pt-4', className)} {...props} />;
}
