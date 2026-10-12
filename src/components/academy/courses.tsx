"use client";

import {
  BellRing,
  Building2,
  ClipboardCheck,
  Droplets,
  FireExtinguisher,
  Flame,
  Gauge,
  ListOrdered,
  Route,
  ScanSearch,
  Siren,
  Thermometer,
  Zap,
} from "lucide-react";
import type { LevelProps } from "./ui";
import Anatomy from "./levels/Anatomy";
import HotHead from "./levels/HotHead";
import FollowWater from "./levels/FollowWater";
import Inspector from "./levels/Inspector";
import MythOrFact from "./levels/MythOrFact";
import { AlarmAnatomy, AlarmDetectors, AlarmInspector, AlarmMyths, AlarmSignals } from "./content/alarms";
import { ExtCheck, ExtClasses, ExtMyths, ExtPass, ExtPick } from "./content/extinguishers";

export type Level = {
  /** Saved progress is keyed by this id, so never rename one. */
  id: string;
  title: string;
  blurb: string;
  minutes: number;
  icon: React.ElementType;
  Component: React.ComponentType<LevelProps>;
};

export type CourseId = "sprinklers" | "alarms" | "extinguishers";

export type Course = {
  id: CourseId;
  /** URL hash that opens this course, e.g. /academy#fire-alarms */
  hash: string;
  name: string;
  tagline: string;
  icon: React.ElementType;
  levels: Level[];
};

export const COURSES: Course[] = [
  {
    id: "sprinklers",
    hash: "sprinklers",
    name: "Fire Sprinklers",
    tagline: "How a sprinkler system actually works, from the city main to the head.",
    icon: Droplets,
    levels: [
      {
        id: "anatomy",
        title: "Anatomy of a Sprinkler",
        blurb: "Tap the parts of a sprinkler head and learn what each one does.",
        minutes: 2,
        icon: ScanSearch,
        Component: Anatomy,
      },
      {
        id: "hot-head",
        title: "Only the Hot One Opens",
        blurb: "Watch a fire start, predict which heads open, and crack the bulb color code.",
        minutes: 2,
        icon: Thermometer,
        Component: HotHead,
      },
      {
        id: "follow-water",
        title: "Follow the Water",
        blurb: "Build the system from the city main to the sprinkler head, in order.",
        minutes: 2,
        icon: Route,
        Component: FollowWater,
      },
      {
        id: "inspector",
        title: "Inspector Mode",
        blurb: "Find 6 fire code violations in a back room before the clock runs out.",
        minutes: 2,
        icon: ClipboardCheck,
        Component: Inspector,
      },
      {
        id: "myth-fact",
        title: "Myth or Fact",
        blurb: "Rapid fire: ten things people say about sprinklers. True or not?",
        minutes: 2,
        icon: Zap,
        Component: MythOrFact,
      },
    ],
  },
  {
    id: "alarms",
    hash: "fire-alarms",
    name: "Fire Alarms",
    tagline: "Detectors, pull stations, horns and strobes, and what the panel is telling you.",
    icon: BellRing,
    levels: [
      {
        id: "alarm-anatomy",
        title: "Parts of a Fire Alarm",
        blurb: "Find the panel, detectors, pull station, and horn/strobe in a lobby.",
        minutes: 2,
        icon: ScanSearch,
        Component: AlarmAnatomy,
      },
      {
        id: "alarm-signals",
        title: "Alarm, Supervisory, or Trouble?",
        blurb: "Read the panel and sort each signal. Only one of them means evacuate.",
        minutes: 2,
        icon: Siren,
        Component: AlarmSignals,
      },
      {
        id: "alarm-detectors",
        title: "Pick the Right Detector",
        blurb: "Smoke, heat, or beam? Match the detector to the room.",
        minutes: 2,
        icon: Building2,
        Component: AlarmDetectors,
      },
      {
        id: "alarm-inspector",
        title: "Alarm Walkthrough",
        blurb: "Find 5 fire alarm problems in an office before time runs out.",
        minutes: 2,
        icon: ClipboardCheck,
        Component: AlarmInspector,
      },
      {
        id: "alarm-myths",
        title: "Alarm Myth or Fact",
        blurb: "Ten things people believe about fire alarms. True or not?",
        minutes: 2,
        icon: Zap,
        Component: AlarmMyths,
      },
    ],
  },
  {
    id: "extinguishers",
    hash: "extinguishers",
    name: "Fire Extinguishers",
    tagline: "Classes of fire, how to use one with P.A.S.S., and the monthly check.",
    icon: FireExtinguisher,
    levels: [
      {
        id: "ext-classes",
        title: "Classes of Fire",
        blurb: "A, B, C, D, or K? Sort eight fires by what's burning.",
        minutes: 2,
        icon: Flame,
        Component: ExtClasses,
      },
      {
        id: "ext-pass",
        title: "P.A.S.S.",
        blurb: "Pull, aim, squeeze, sweep. Put out a fire, then learn when not to.",
        minutes: 2,
        icon: ListOrdered,
        Component: ExtPass,
      },
      {
        id: "ext-check",
        title: "Monthly Check",
        blurb: "Read the gauge, pin, seal, hose, and tag. Pass or fail?",
        minutes: 2,
        icon: Gauge,
        Component: ExtCheck,
      },
      {
        id: "ext-pick",
        title: "Right Tool, Right Place",
        blurb: "Choose the extinguisher for each room, then get the mounting rules right.",
        minutes: 2,
        icon: Building2,
        Component: ExtPick,
      },
      {
        id: "ext-myths",
        title: "Extinguisher Myth or Fact",
        blurb: "Ten things people say about extinguishers. True or not?",
        minutes: 2,
        icon: Zap,
        Component: ExtMyths,
      },
    ],
  },
];

export function findLevel(id: string) {
  for (const course of COURSES) {
    const index = course.levels.findIndex((l) => l.id === id);
    if (index !== -1) return { course, level: course.levels[index], index };
  }
  return null;
}
