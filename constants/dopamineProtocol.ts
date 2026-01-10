// Dopamine Protocol constants for Knarr

import {
  Sun,
  Brain,
  Utensils,
  Moon,
  AlertTriangle,
} from 'lucide-react'

// Dopamine Routine Types
export type RoutinePhase = 'morning' | 'deepwork' | 'dinner' | 'sleep' | 'rescue'

export interface SupplementItem {
  id: string
  name: string
  dosage: string
  measurement?: string
  effect: string
  details: string
  warning?: string
  optional?: boolean
  substituteFor?: string
}

export interface RoutinePhaseData {
  id: RoutinePhase
  title: string
  subtitle: string
  time: string
  goal: string
  icon: typeof Sun
  color: string
  bgColor: string
  items: SupplementItem[]
  protocolRule?: string
  environment?: string[]
  trigger?: string
  limit?: string
}

// Dopamine Routine Data
export const DOPAMINE_ROUTINE: RoutinePhaseData[] = [
  {
    id: 'morning',
    title: 'Morning Activation',
    subtitle: 'Phase 1',
    time: '15–30 min post-waking',
    goal: 'Wake up brain without spiking anxiety',
    icon: Sun,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/20',
    protocolRule: 'No phone/screens for the first 60 minutes',
    items: [
      {
        id: 'whey',
        name: 'Whey Protein',
        dosage: '1 Scoop',
        measurement: '~3 Heaping Tablespoons if no scoop',
        effect: 'Stabilizes blood sugar',
        details: 'Mix in shaker with water/milk as part of the Neuro-Breakfast Shake. Provides sustained energy and prevents blood sugar crashes that can trigger anxiety.',
      },
      {
        id: 'creatine',
        name: 'Creatine',
        dosage: '5g',
        measurement: '1 Full Teaspoon',
        effect: 'Mental endurance',
        details: 'Add to shake. Creatine supports ATP production in the brain, enhancing cognitive function and mental stamina throughout the day.',
      },
      {
        id: 'taurine-morning',
        name: 'Taurine',
        dosage: '1g',
        measurement: '1/4 Teaspoon (tip of spoon)',
        effect: 'Calms nervous system startle response',
        details: 'Add to shake. Taurine is an amino acid that helps regulate GABA, reducing the "jumpy" feeling and nervous system over-reactivity.',
      },
      {
        id: 'alcar',
        name: 'ALCAR (Acetyl L-Carnitine)',
        dosage: '1 Capsule (500mg)',
        effect: 'Clears brain fog & scattered thoughts',
        details: 'Take with shake. ALCAR crosses the blood-brain barrier and supports acetylcholine production, the neurotransmitter responsible for focus and memory.',
      },
      {
        id: 'rhodiola',
        name: 'Rhodiola Rosea',
        dosage: '1 Capsule',
        effect: 'Prevents burnout & fatigue',
        details: 'Adaptogenic herb that helps the body resist physical, chemical, and biological stressors. Particularly effective for preventing the afternoon crash.',
        optional: true,
      },
    ],
  },
  {
    id: 'deepwork',
    title: 'Deep Work Block',
    subtitle: 'Phase 2',
    time: '90 min post-waking',
    goal: 'Achieve flow state',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    environment: ['Phone in another room', 'Earplugs in (if noisy)'],
    items: [
      {
        id: 'taurine-work',
        name: 'Taurine (Optional Booster)',
        dosage: '0.5g – 1g',
        measurement: 'Sip in water',
        effect: 'Reduces physical anxiety',
        details: 'Use if you feel physical anxiety or "chest buzzing" during work. Taurine helps calm the physical manifestations of stress without sedating you.',
        optional: true,
      },
    ],
  },
  {
    id: 'dinner',
    title: 'Cortisol Cutoff',
    subtitle: 'Phase 3',
    time: 'With dinner (last meal)',
    goal: 'Blunt stress response for sleep prep',
    icon: Utensils,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
    items: [
      {
        id: 'phosphatidylserine',
        name: 'Phosphatidylserine',
        dosage: '1 Capsule (150mg)',
        effect: 'Blunts physical stress & cortisol spikes',
        details: 'Take with dinner. PS is a phospholipid that helps regulate cortisol, particularly effective at reducing elevated evening cortisol that can interfere with sleep.',
      },
      {
        id: 'ashwagandha',
        name: 'Ashwagandha',
        dosage: '1 Capsule',
        effect: 'Lowers serum cortisol',
        details: 'Take with dinner. This adaptogenic herb has been shown to reduce cortisol levels by up to 30%. If you have Stress Care bottle, take that INSTEAD.',
        warning: 'If you have the Stress Care bottle, take that INSTEAD of Ashwagandha.',
      },
    ],
  },
  {
    id: 'sleep',
    title: 'GABA Restoration',
    subtitle: 'Phase 4',
    time: '45 min before sleep',
    goal: 'Deep sleep & temperature regulation',
    icon: Moon,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/20',
    protocolRule: 'No screens 90 minutes before bed',
    items: [
      {
        id: 'magnesium',
        name: 'Magnesium Bisglycinate',
        dosage: '~400mg elemental',
        measurement: '1/2 Flat Teaspoon (Silver Bag)',
        effect: 'Relaxation & temperature regulation',
        details: 'Mix in small cup of water as "Sleep Mocktail". Magnesium glycinate is the most bioavailable form and promotes GABA activity for calming effects.',
      },
      {
        id: 'glycine',
        name: 'Glycine',
        dosage: '3g–5g',
        measurement: '1 Heaping Teaspoon',
        effect: 'Enhances sleep quality',
        details: 'Add to Sleep Mocktail. Glycine lowers core body temperature and increases time spent in REM sleep. Also supports liver detoxification overnight.',
      },
      {
        id: 'apigenin',
        name: 'Apigenin',
        dosage: '1 Capsule',
        effect: 'Natural sedative from chamomile',
        details: 'Take with Sleep Mocktail. Apigenin binds to GABA receptors similarly to benzodiazepines but without the side effects or dependency risk.',
        optional: true,
      },
    ],
  },
  {
    id: 'rescue',
    title: 'Rescue Protocols',
    subtitle: 'Non-Daily',
    time: 'As needed',
    goal: 'Emergency sedation for panic/insomnia',
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    trigger: 'Physical shaking, severe anxiety, or "wired but tired" crash',
    limit: 'Max 2x per week for Valerian',
    items: [
      {
        id: 'valerian',
        name: 'Valerian Root (Panic Button)',
        dosage: '1 Capsule',
        effect: 'Emergency sedation',
        details: 'Take 1 hour before bed when experiencing severe anxiety or panic. Valerian works on GABA receptors to produce a strong calming effect.',
        warning: 'Do not drive. Do not combine with alcohol. Max 2x per week.',
      },
      {
        id: 'chelated-mag',
        name: 'Chelated Magnesium (Travel Backup)',
        dosage: '2–3 Capsules',
        effect: 'Substitute for powder when traveling',
        details: 'Use when traveling or too tired to mix powders. The black bottle capsules are a convenient alternative to the powder form.',
        substituteFor: 'Magnesium Powder',
      },
    ],
  },
]
