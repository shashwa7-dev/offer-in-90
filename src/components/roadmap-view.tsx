'use client';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageHeader, Seg, Surface } from './shell/page';
import { RoadmapTimeline } from './roadmap-timeline';
import { RoadmapWeeks } from './roadmap-weeks';
import { RoadmapReference } from './roadmap-reference';
import { useUI, type RoadmapTab } from './ui-state';

const TABS: { value: RoadmapTab; label: string }[] = [
  { value: 'timeline', label: 'Timeline' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'reference', label: 'Reference' },
];

export function RoadmapView() {
  const { roadmapTab: tab, setRoadmapTab } = useUI();
  const label = TABS.find(t => t.value === tab)!.label;
  const phone = useIsMobile(); // the tabs already name the page on phones, so the crumb stays short
  return (
    <div className="pb-16">
      <PageHeader crumbs={phone ? ['Roadmap'] : ['Roadmap', label]} actions={<Seg value={tab} onChange={setRoadmapTab} options={TABS} />} />
      <Surface>
        {tab === 'timeline' && <RoadmapTimeline />}
        {tab === 'weeks' && <RoadmapWeeks />}
        {tab === 'reference' && <RoadmapReference />}
      </Surface>
    </div>
  );
}
