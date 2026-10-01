import yogaDemoImg from '../assets/images/yoga_ai_guide_1790419009678.jpg';
import kathakDemoImg from '../assets/images/kathak_ai_guide_1790419025376.jpg';
import danceDemoImg from '../assets/images/dance_ai_guide_1790419041535.jpg';
import meditDemoImg from '../assets/images/medit_ai_guide_1790419060352.jpg';
import { Practice, DisciplineType } from '../types';

export interface AiVisualDemoData {
  imageUrl: string;
  demonstratorName: string;
  poseName: string;
  discipline: DisciplineType;
  alignmentScore: number;
  postureCheckpoints: {
    label: string;
    description: string;
    status: 'optimal' | 'good' | 'guided';
  }[];
  biomechanics: {
    spineAxisAngle: string;
    drishtiFocalPoint: string;
    weightDistribution: string;
    breathCadence: string;
  };
  keyInstructions: string[];
}

export const AI_DEMOS_BY_DISCIPLINE: Record<DisciplineType, AiVisualDemoData> = {
  Yoga: {
    imageUrl: yogaDemoImg,
    demonstratorName: 'Acharya Ananya',
    poseName: 'Virabhadrasana II & Spine Extension',
    discipline: 'Yoga',
    alignmentScore: 98,
    postureCheckpoints: [
      {
        label: 'Front Knee Stacked',
        description: 'Right knee positioned perpendicular at 90° directly above the ankle joint.',
        status: 'optimal',
      },
      {
        label: 'Torso Neutral Axis',
        description: 'Shoulders stacked over pelvic bowl without leaning forward.',
        status: 'optimal',
      },
      {
        label: 'Drishti Gaze',
        description: 'Steady eye level focus over front fingertips calming sympathetic drive.',
        status: 'good',
      },
      {
        label: 'Back Foot Arch Lift',
        description: 'Outer edge of back foot rooted with inner longitudinal arch activated.',
        status: 'optimal',
      },
    ],
    biomechanics: {
      spineAxisAngle: '90° vertical',
      drishtiFocalPoint: 'Front middle finger',
      weightDistribution: '50% front / 50% rear',
      breathCadence: 'Ujjayi (4s in / 4s out)',
    },
    keyInstructions: [
      'Square hips gently toward the side wall while externally rotating front thigh.',
      'Soften trapezius muscles downward away from ears; broaden clavicles.',
      'Engage lower core to protect lumbar curve throughout the static hold.',
    ],
  },
  Kathak: {
    imageUrl: kathakDemoImg,
    demonstratorName: 'Guru Radhika',
    poseName: 'Classical Thaat & Pataka Hastak',
    discipline: 'Kathak',
    alignmentScore: 99,
    postureCheckpoints: [
      {
        label: 'Angahar & Kasak Balance',
        description: 'Subtle rhythmic micro-sway of torso aligning with the Sam of Teentaal.',
        status: 'optimal',
      },
      {
        label: 'Pataka Mudra Extension',
        description: 'Fingers held straight with thumb gently tucked; wrist flexed at 45° line.',
        status: 'optimal',
      },
      {
        label: 'Ghungroo Foot Anchor',
        description: 'Base foot firmly planted for precise sound clarity (chhand & padant).',
        status: 'optimal',
      },
      {
        label: 'Eyeline & Greeva Bheda',
        description: 'Gaze following the trajectory of the lead hand (Yato Hasta Tato Drishti).',
        status: 'good',
      },
    ],
    biomechanics: {
      spineAxisAngle: '92° graceful upright',
      drishtiFocalPoint: 'Upper Mudra apex',
      weightDistribution: '60% lead foot / 40% pivot',
      breathCadence: 'Sync to 16-beat Teentaal',
    },
    keyInstructions: [
      'Keep elbows elevated parallel to chest level without letting elbows droop.',
      'Maintain continuous spine elongation as ghungroos strike the ground.',
      'Coordinate eyebrow and neck movement with the terminal beat (Tihai).',
    ],
  },
  Bollywood: {
    imageUrl: danceDemoImg,
    demonstratorName: 'Pooja Varma',
    poseName: 'Dynamic Lyrical Spin & Alapadma Mudra',
    discipline: 'Bollywood',
    alignmentScore: 96,
    postureCheckpoints: [
      {
        label: 'Spin Axis Spotting',
        description: 'Head snaps quickly to primary front focal point to maintain balance.',
        status: 'optimal',
      },
      {
        label: 'Fluid Arm Arc',
        description: 'Arms trace wide cinematic arcs to maximize visual expression and grace.',
        status: 'good',
      },
      {
        label: 'Rhythm Accentuation',
        description: 'Foot strikes accentuate the syncopated dholak downbeats.',
        status: 'optimal',
      },
      {
        label: 'Facial Abhinaya',
        description: 'Vibrant joyful smile radiating energy through every movement phrase.',
        status: 'optimal',
      },
    ],
    biomechanics: {
      spineAxisAngle: 'Dynamic rotational axis',
      drishtiFocalPoint: 'Dynamic front spotting',
      weightDistribution: 'Dynamic weight shifting',
      breathCadence: 'Rhythmic aerobic breathing',
    },
    keyInstructions: [
      'Spot a fixed object during fast turns to eliminate dizziness.',
      'Use arm momentum to initiate spins cleanly from the core.',
      'Stay light on the balls of your feet for effortless transitions.',
    ],
  },
  'Semi-Classical': {
    imageUrl: danceDemoImg,
    demonstratorName: 'Meera Devi',
    poseName: 'Semi-Classical Lyrical Devotion Stance',
    discipline: 'Semi-Classical',
    alignmentScore: 97,
    postureCheckpoints: [
      {
        label: 'Hasta Mudra Precision',
        description: 'Refined classical finger mudras flowing effortlessly into modern lines.',
        status: 'optimal',
      },
      {
        label: 'Thoracic Cambré',
        description: 'Upper back arches with deep emotive resonance while keeping lower back long.',
        status: 'optimal',
      },
      {
        label: 'Weight Suspension',
        description: 'Transitions appear floating and featherweight between rhythmic cycles.',
        status: 'good',
      },
      {
        label: 'Bhav Expression',
        description: 'Eyes and subtle facial muscles convey the poignant poetry of the raga.',
        status: 'optimal',
      },
    ],
    biomechanics: {
      spineAxisAngle: 'Curvilinear fluid spine',
      drishtiFocalPoint: 'Diagonal upward skyward',
      weightDistribution: 'Demi-plié balance',
      breathCadence: 'Lyrical slow phrasing',
    },
    keyInstructions: [
      'Connect each hand gesture to your breath for seamless transitions.',
      'Ground your feet through the floor before initiating any torso elevation.',
      'Let your gaze precede your hand movements for dramatic classical storytelling.',
    ],
  },
  Zumba: {
    imageUrl: danceDemoImg,
    demonstratorName: 'Pooja Varma',
    poseName: 'High-Energy Cardio Dance Stance',
    discipline: 'Zumba',
    alignmentScore: 95,
    postureCheckpoints: [
      {
        label: 'Athletic Stance',
        description: 'Slight knee bend and springy calves protecting knees during high impact.',
        status: 'optimal',
      },
      {
        label: 'Pelvic Isolation',
        description: 'Active hip rolls engaging obliques without strain on the lower spine.',
        status: 'good',
      },
      {
        label: 'Shoulder Relaxation',
        description: 'Pumping arms synchronized with upbeat 130 BPM tempo.',
        status: 'optimal',
      },
      {
        label: 'Cardio Stamina',
        description: 'Sustained heart rate in aerobic conditioning zone.',
        status: 'optimal',
      },
    ],
    biomechanics: {
      spineAxisAngle: 'Slight athletic forward hinge',
      drishtiFocalPoint: 'Center forward mirror',
      weightDistribution: 'Balls of feet active',
      breathCadence: 'Continuous aerobic pacing',
    },
    keyInstructions: [
      'Land softly on the balls of your feet to cushion joint impact.',
      'Engage your abdominal core continuously to stabilize your hips.',
      'Hydrate periodically and keep energy high throughout the beat changes.',
    ],
  },
  Meditation: {
    imageUrl: meditDemoImg,
    demonstratorName: 'Yogini Priya',
    poseName: 'Padmasana & Chin Mudra Alignment',
    discipline: 'Meditation',
    alignmentScore: 99,
    postureCheckpoints: [
      {
        label: 'Pelvic Seat Grounding',
        description: 'Ischial tuberosities (sit bones) rooted equally on cushion or mat.',
        status: 'optimal',
      },
      {
        label: 'Chin Mudra Circuit',
        description: 'Thumb and index fingertips lightly touching, completing energetic nadi circuit.',
        status: 'optimal',
      },
      {
        label: 'Cranial Extension',
        description: 'Crown of head reaching skyward with chin slightly retracted (Jalandhara).',
        status: 'optimal',
      },
      {
        label: 'Diaphragmatic Expansion',
        description: 'Rhythmic belly expansion on inhalation; complete relaxation on exhalation.',
        status: 'optimal',
      },
    ],
    biomechanics: {
      spineAxisAngle: '90° plumb-line spine',
      drishtiFocalPoint: 'Ajna Chakra (Third Eye) internal',
      weightDistribution: 'Triangular stable base',
      breathCadence: 'Deep 4-7-8 Pranayama',
    },
    keyInstructions: [
      'Allow shoulders to melt downward away from your neck and collarbones.',
      'Relax tongue against the roof of the mouth and soften the jaw muscles.',
      'Whenever thoughts arise, gently bring attention back to the breath at the nostrils.',
    ],
  },
  Dance: {
    imageUrl: danceDemoImg,
    demonstratorName: 'Meera Devi',
    poseName: 'Graceful Classical Dance Pose',
    discipline: 'Dance',
    alignmentScore: 97,
    postureCheckpoints: [
      {
        label: 'Posture Integrity',
        description: 'Upright spine with lifted sternum reflecting royal dignity.',
        status: 'optimal',
      },
      {
        label: 'Hand Mudra Sculpting',
        description: 'Expressive mudra clarity visible from all visual perspectives.',
        status: 'optimal',
      },
      {
        label: 'Foot Rhythm Alignment',
        description: 'Precise ground strikes matching musical tala subdivisions.',
        status: 'good',
      },
      {
        label: 'Artistic Abhinaya',
        description: 'Emotional radiance conveying rasas and lyrical poetry.',
        status: 'optimal',
      },
    ],
    biomechanics: {
      spineAxisAngle: '90° regal upright',
      drishtiFocalPoint: 'Forward audience focal plane',
      weightDistribution: 'Even balance across soles',
      breathCadence: 'Synchronized to Tala meter',
    },
    keyInstructions: [
      'Maintain an open chest and expansive wingspan during arm extensions.',
      'Keep knees soft and spring-loaded during complex rhythmic sequences.',
      'Incorporate emotional expression into every mudra and transition.',
    ],
  },
};

/**
 * Returns comprehensive visual demonstration metadata for any practice
 */
export function getPracticeAiVisualDemo(practice: Practice): AiVisualDemoData {
  const disciplineKey = practice.discipline || 'Yoga';
  const base = AI_DEMOS_BY_DISCIPLINE[disciplineKey] || AI_DEMOS_BY_DISCIPLINE.Yoga;

  // If practice has custom title or instructions, personalize the pose name
  return {
    ...base,
    poseName: practice.aiDemoPose || `${practice.title} • AI Visual Guide`,
    alignmentScore: practice.aiAlignmentScore || base.alignmentScore,
    keyInstructions: practice.instructions && practice.instructions.length > 0
      ? practice.instructions.slice(0, 4)
      : base.keyInstructions,
  };
}
