'use client';

import * as React from 'react';
import { ArrowRight, Bell, Phone, Plus, Trash2 } from 'lucide-react';
import {
  ClockPill,
  ConfidenceLabel,
  ConflictBadge,
  FreshnessMark,
  MergedFromBadge,
  ReasonChip,
  RestrictedBadge,
  SourceChip,
  StatusStepper,
} from '@/components/domain';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Chip,
  DataTable,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  EmptyState,
  IconButton,
  Kbd,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  SegmentedControl,
  Select,
  Sheet,
  SheetContent,
  SheetTrigger,
  Skeleton,
  StatCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  dataTableColumnHelper,
  useToast,
  type DataTableColumns,
  type DataTableDensity,
} from '@/components/ui';

interface QueueRowDemo {
  rank: number;
  member: string;
  reason: string;
  deadline: string;
}

const demoRows: QueueRowDemo[] = [
  {
    rank: 1,
    member: 'Harold Bellweather (fictional)',
    reason: 'Discharged Fri, no contact yet',
    deadline: '2026-11-10T17:00:00-05:00',
  },
  {
    rank: 2,
    member: 'Marcus Okonkwo-Lane (fictional)',
    reason: '5 ED visits / 90 d',
    deadline: '2026-11-10T23:59:00-05:00',
  },
  {
    rank: 3,
    member: 'Eleanor Fairweather (fictional)',
    reason: 'PT approved, start not confirmed',
    deadline: '2026-11-03T17:00:00-05:00',
  },
];

const helper = dataTableColumnHelper<QueueRowDemo>();

const demoColumns: DataTableColumns<QueueRowDemo> = helper.columns([
  helper.accessor('rank', { header: '#', cell: (info) => info.getValue() }),
  helper.accessor('member', {
    header: 'Member',
    cell: (info) => (
      <span className="flex items-center gap-2">
        <Avatar name={info.getValue()} size="sm" />
        {info.getValue()}
      </span>
    ),
  }),
  helper.accessor('reason', {
    header: 'Why today',
    cell: (info) => (
      <ReasonChip
        reason={info.getValue()}
        freshness={{ receivedTime: '2026-11-06T19:30:00-05:00', status: 'source_confirmed' }}
      />
    ),
  }),
  helper.accessor('deadline', {
    header: 'Clock',
    cell: (info) => <ClockPill deadline={info.getValue()} label="Contact window" />,
  }),
]);

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-2xs font-medium tracking-wide text-text-muted uppercase">{title}</h4>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h3 id={id} className="text-base font-semibold text-text">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ToastDemo() {
  const toast = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast({
          title: 'Note signed',
          description: 'Written to the record and the audit log.',
          tone: 'success',
        })
      }
    >
      Show toast
    </Button>
  );
}

/**
 * Every primitive and domain component in one place, in one theme. The
 * /design page renders it twice, once per theme.
 */
export function DesignGallery({ idPrefix }: { idPrefix: string }) {
  const [density, setDensity] = React.useState<DataTableDensity>('comfortable');
  const [checked, setChecked] = React.useState(true);
  const [channel, setChannel] = React.useState('call');

  const id = (suffix: string) => `${idPrefix}-${suffix}`;

  return (
    <div className="flex flex-col gap-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--canvas)] p-6">
      <Section id={id('buttons')} title="Buttons">
        <Row title="Variants">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">
            <Trash2 aria-hidden="true" />
            Dismiss
          </Button>
          <Button variant="link">Why this order</Button>
          <Button disabled>Disabled</Button>
        </Row>
        <Row title="Sizes and icon buttons">
          <Button size="sm">Small</Button>
          <Button size="md">
            <Phone aria-hidden="true" />
            Call now
          </Button>
          <Button size="lg">
            Open member
            <ArrowRight aria-hidden="true" />
          </Button>
          <IconButton label="Notifications">
            <Bell aria-hidden="true" />
          </IconButton>
          <IconButton label="Add task" variant="secondary">
            <Plus aria-hidden="true" />
          </IconButton>
        </Row>
      </Section>

      <Section id={id('badges')} title="Badges and chips">
        <Row title="Badge tones">
          <Badge>Neutral</Badge>
          <Badge tone="brand">Brand</Badge>
          <Badge tone="urgent">Overdue</Badge>
          <Badge tone="warning">Conflict</Badge>
          <Badge tone="info">Informational</Badge>
          <Badge tone="success">Verified</Badge>
        </Row>
        <Row title="Chips, avatar and keyboard keys">
          <Chip tone="brand">Heart failure</Chip>
          <Chip tone="neutral">Medicare Advantage HMO</Chip>
          <Avatar name="Maria Rivera" />
          <Avatar name="Harold Bellweather (fictional)" size="lg" />
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <Kbd>g</Kbd>
            <Kbd>t</Kbd>
            Today
          </span>
        </Row>
      </Section>

      <Section id={id('cards')} title="Cards and stat cards">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader
              title="Card header"
              subtitle="One line of context"
              actions={
                <Button size="sm" variant="secondary">
                  Action
                </Button>
              }
            />
            <CardBody>
              <p className="text-sm text-text-muted">
                Card body on a quiet canvas: hairline border, no drop shadow.
              </p>
            </CardBody>
            <CardFooter>Footer: legend, basis and capacity lines live here.</CardFooter>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Due today" value={4} hint="Hard clock or safety signal" selected />
            <StatCard label="Windows closing" value={2} hint="By end of tomorrow" />
          </div>
        </div>
      </Section>

      <Section id={id('tabs')} title="Tabs, table and density">
        <SegmentedControl
          label="Table density"
          value={density}
          onValueChange={setDensity}
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
        <Tabs defaultValue="due">
          <TabsList>
            <TabsTrigger value="due">Due today · 4</TabsTrigger>
            <TabsTrigger value="risk">At risk · 3</TabsTrigger>
            <TabsTrigger value="waiting">Waiting on others · 6</TabsTrigger>
          </TabsList>
          <TabsContent value="due">
            <Card>
              <DataTable
                columns={demoColumns}
                data={demoRows}
                density={density}
                caption="Example queue rows showing reason chips and clocks"
                getRowId={(row) => String(row.rank)}
              />
            </Card>
          </TabsContent>
          <TabsContent value="risk">
            <EmptyState
              title="Nothing in this demo tab"
              description="The real tabs are built in task 7 from the signals engine."
            />
          </TabsContent>
          <TabsContent value="waiting">
            <EmptyState title="Nothing in this demo tab" />
          </TabsContent>
        </Tabs>
      </Section>

      <Section id={id('overlays')} title="Overlays">
        <Row title="Tooltip, popover, dialog, drawer, toast">
          <Tooltip content="Shadows appear on overlays only.">
            <Button variant="secondary">Hover or focus me</Button>
          </Tooltip>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Why this order</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="text-xs text-text-muted">
                Event tier, then nearest clock, then confidence, then risk score as a tie-break.
              </p>
            </PopoverContent>
          </Popover>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open dialog</Button>
            </DialogTrigger>
            <DialogContent
              title="Reconcile medication list"
              description="Record a decision per conflicting row. Nothing is merged for you."
            >
              <p className="text-sm text-text-muted">
                Dialogs state exactly what will be written before anything is written.
              </p>
              <DialogFooter className="-mx-6 mt-5 -mb-5">
                <Button variant="secondary">Cancel</Button>
                <Button>Save decision</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Open drawer</Button>
            </SheetTrigger>
            <SheetContent title="Raw source record" description="Exactly as received, never edited">
              <pre className="rounded-[var(--radius-input)] bg-[var(--surface-muted)] p-3 font-mono text-2xs text-text">
                {`source       adt
record       ADT-2026-11-06-0042
eventTime    2026-11-06T16:45:00-05:00
receivedTime 2026-11-06T17:02:00-05:00
status       source_confirmed`}
              </pre>
            </SheetContent>
          </Sheet>
          <ToastDemo />
        </Row>
      </Section>

      <Section id={id('forms')} title="Form controls">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Checkbox
              label="Hide dismissed members"
              hint="Dismissals stay in the audit log either way."
              checked={checked}
              onCheckedChange={(value) => setChecked(value === true)}
            />
            <RadioGroup
              label="Channel for the next attempt"
              value={channel}
              onValueChange={setChannel}
              options={[
                { value: 'call', label: 'Call', hint: 'Consent on file' },
                { value: 'text', label: 'Text', hint: 'No text consent on file' },
                { value: 'letter', label: 'Letter' },
              ]}
            />
            <Progress
              value={17}
              max={40}
              label="Assessment fields complete"
              valueText="17 of 40 fields"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Select
              label="Program"
              placeholder="All programs"
              options={[
                { value: 'hf', label: 'Heart failure' },
                { value: 'dm', label: 'Diabetes' },
                { value: 'bh', label: 'Behavioral health' },
              ]}
            />
            <Textarea
              label="Dismissal reason"
              hint="A reason is required; the dismissal is written to the audit log."
              placeholder="Why is this member not worked today?"
            />
            <div className="flex flex-col gap-2">
              <span className="text-2xs font-medium tracking-wide text-text-muted uppercase">
                Skeleton
              </span>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </Section>

      <Section id={id('domain')} title="Domain components">
        <Row title="Freshness marks">
          <FreshnessMark
            receivedTime="2026-11-09T06:00:00-05:00"
            status="source_confirmed"
            subject="PBM fill history"
            showLabel
          />
          <FreshnessMark
            receivedTime="2026-11-06T19:30:00-05:00"
            status="source_confirmed"
            subject="Discharge medication list"
            showLabel
          />
          <FreshnessMark
            receivedTime="2026-11-07T09:00:00-05:00"
            status="member_reported"
            subject="Member-reported dose"
            showLabel
          />
          <FreshnessMark
            receivedTime="2026-04-26T10:00:00-04:00"
            status="source_confirmed"
            subject="Health risk assessment"
            showLabel
          />
        </Row>
        <Row title="Clocks">
          <ClockPill deadline="2026-11-10T17:00:00-05:00" label="Contact window" />
          <ClockPill deadline="2026-11-09T11:00:00-05:00" label="Callback window" />
          <ClockPill deadline="2026-11-09T20:00:00-05:00" label="Same-day callback" />
          <ClockPill deadline="2026-11-03T17:00:00-05:00" label="7-day follow-up" />
        </Row>
        <Row title="Sources, conflicts and confidence">
          <SourceChip
            source="ccd"
            recordId="CCD-2026-11-06-118"
            eventTime="6 Nov 16:45 ET"
            receivedTime="6 Nov 19:30 ET"
          />
          <SourceChip source="pbm" recordId="PBM-88214" receivedTime="8 Nov 23:00 ET" />
          <ConflictBadge reason="Furosemide 80 mg on the discharge list, 40 mg on the last PBM fill (10 Oct)." />
          <ConfidenceLabel confidence="high" basis="structured discharge list" />
          <ConfidenceLabel confidence="medium" basis="extracted, unconfirmed" />
          <ConfidenceLabel confidence="low" basis="fills split across two IDs" />
        </Row>
        <Row title="Reasons, restricted records and merges">
          <ReasonChip
            reason="Discharged Fri 16:45, no contact yet"
            tone="urgent"
            freshness={{ receivedTime: '2026-11-06T17:02:00-05:00', status: 'source_confirmed' }}
          />
          <ReasonChip
            reason="New mobile from ED registration"
            tone="warning"
            freshness={{
              receivedTime: '2026-11-05T22:10:00-05:00',
              status: 'source_confirmed',
              singleSource: true,
            }}
          />
          <RestrictedBadge />
          <MergedFromBadge mergedFrom={['SYN-DM-002', 'SYN-DM-002-OLD']} onUndo={() => undefined} />
        </Row>
        <Row title="Status steppers">
          <div className="flex flex-col gap-4">
            <StatusStepper
              current="approved"
              dates={{ requested: '28 Oct', approved: '29 Oct' }}
              unconfirmedNote="Approved 29 Oct. Start of care not confirmed, 12 days since request."
            />
            <StatusStepper current="completed" dates={{ completed: '2 Nov' }} />
            <StatusStepper current="unknown" />
          </div>
        </Row>
      </Section>
    </div>
  );
}
