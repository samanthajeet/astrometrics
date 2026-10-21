import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="reviews" className="max-w-xl">
      <TabsList aria-label="GitHub">
        <TabsTrigger value="reviews">
          Review queue
          <Badge tone="accent" count>
            3
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="prs">My PRs</TabsTrigger>
        <TabsTrigger value="issues">Issues</TabsTrigger>
      </TabsList>
      <TabsContent value="reviews">
        <p className="text-sm text-muted">Three pull requests are waiting on your review.</p>
      </TabsContent>
      <TabsContent value="prs">
        <p className="text-sm text-muted">Two open, one with failing checks.</p>
      </TabsContent>
      <TabsContent value="issues">
        <p className="text-sm text-muted">Nothing assigned. Clear skies.</p>
      </TabsContent>
    </Tabs>
  ),
};
