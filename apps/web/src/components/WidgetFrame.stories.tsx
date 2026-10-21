import { clientWidgets } from '@astrometrics/widgets/client';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DragHandle, WidgetFrame } from './WidgetFrame';
import {
  ErrorNotice,
  MissingCredentialNotice,
  StaleNotice,
  UnknownWidgetNotice,
} from './WidgetNotices';

const stardate = clientWidgets.stardate!.views;
const main = <stardate.Main settings={{}} data={undefined} />;
const compact = <stardate.Compact settings={{}} data={undefined} />;

const mainColumn: Decorator = (Story) => (
  <div className="w-[640px] max-w-full">
    <Story />
  </div>
);

const sideColumn: Decorator = (Story) => (
  <div className="w-[360px] max-w-full">
    <Story />
  </div>
);

const meta = {
  title: 'App/Widget frame',
  component: WidgetFrame,
  args: {
    title: 'Stardate',
    handle: <DragHandle label="Move Stardate" />,
    onRemove: fn(),
    children: main,
  },
} satisfies Meta<typeof WidgetFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MainColumn: Story = { decorators: [mainColumn] };

export const SideColumn: Story = {
  args: { children: compact },
  decorators: [sideColumn],
};

/** The column decides the view: Main in the main column, Compact in the side column. */
export const ColumnRule: Story = {
  render: (args) => (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <WidgetFrame {...args}>{main}</WidgetFrame>
      <WidgetFrame {...args}>{compact}</WidgetFrame>
    </div>
  ),
  parameters: { layout: 'fullscreen' },
};

export const Dragging: Story = { args: { dimmed: true }, decorators: [mainColumn] };

export const MissingCredential: Story = {
  args: {
    title: 'Upcoming releases',
    handle: <DragHandle label="Move Upcoming releases" />,
    children: <MissingCredentialNotice provider="tmdb" onOpenSettings={fn()} />,
  },
  decorators: [sideColumn],
};

export const Stale: Story = {
  args: {
    children: (
      <>
        {compact}
        <StaleNotice message="fetch failed: network offline" />
      </>
    ),
  },
  decorators: [sideColumn],
};

export const FetchError: Story = {
  args: {
    title: 'New episodes',
    handle: <DragHandle label="Move New episodes" />,
    children: <ErrorNotice message="TVmaze responded with 503 Service Unavailable" />,
  },
  decorators: [sideColumn],
};

export const UnknownType: Story = {
  args: {
    title: 'retired-widget',
    handle: <DragHandle label="Move retired-widget" />,
    children: <UnknownWidgetNotice type="retired-widget" />,
  },
  decorators: [sideColumn],
};
