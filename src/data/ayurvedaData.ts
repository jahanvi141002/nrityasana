export interface DoshaProfile {
  id: 'vata' | 'pitta' | 'kapha';
  name: string;
  elements: string;
  qualities: string[];
  description: string;
  balancingPractices: string[];
  recommendedFoods: string[];
  foodsToLimit: string[];
  danceAndYogaAdvice: string;
}

export interface DinacharyaStep {
  id: string;
  timeSlot: 'Morning (Brahma Muhurta)' | 'Midday (Solar Peak)' | 'Sunset (Sandhya)' | 'Night (Ratricharya)';
  timeRange: string;
  title: string;
  sanskritName: string;
  description: string;
  benefit: string;
  instructions: string[];
  recommendedPracticeId?: string;
  icon: 'sun' | 'flame' | 'sunset' | 'moon' | 'sparkles' | 'coffee';
}

export interface AyurvedaRecipe {
  id: string;
  name: string;
  sanskritName?: string;
  category: 'Morning Tonic' | 'Digestive Tea' | 'Healing Broth' | 'Night Elixir';
  doshaSuitability: string;
  timeToMake: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  benefits: string;
}

export const AYURVEDA_DOSHAS: Record<'vata' | 'pitta' | 'kapha', DoshaProfile> = {
  vata: {
    id: 'vata',
    name: 'Vata Dosha (Air & Ether)',
    elements: 'Air + Ether (Akasha)',
    qualities: ['Light', 'Cold', 'Dry', 'Mobile', 'Subtle'],
    description: 'Vata governs all biological movement, nerve impulses, dance agility, and creative flow. When balanced, it inspires vibrant creativity and swift musicality; when aggravated, it brings anxiety, joint cracking, and fatigue.',
    balancingPractices: [
      'Gentle, grounding Hatha yoga and long Yin holds',
      'Slow, rhythmic Kathak Tatkar with warm feet',
      'Warm sesame oil Abhyanga self-massage before warm bath',
      'Nadi Shodhana alternate nostril breathing'
    ],
    recommendedFoods: [
      'Warm, cooked, unctuous foods like khichdi and soups',
      'Healthy fats: A2 Cow Ghee, sesame oil, avocados',
      'Sweet, sour, and salty tastes',
      'Warming spices: ginger, cinnamon, cardamom, cumin'
    ],
    foodsToLimit: [
      'Raw, cold salads, iced beverages',
      'Dry crackers, dry beans, raw cruciferous vegetables',
      'Excess bitter, pungent, and astringent tastes'
    ],
    danceAndYogaAdvice: 'Always perform slow ankle warmups and grounded foot strikes to prevent joint stiffness; conclude sessions with grounding Savasana covered with a warm shawl.'
  },
  pitta: {
    id: 'pitta',
    name: 'Pitta Dosha (Fire & Water)',
    elements: 'Fire (Agni) + Water (Jala)',
    qualities: ['Hot', 'Sharp', 'Light', 'Oily', 'Spreading'],
    description: 'Pitta governs metabolism, digestion, visual clarity, stage presence, and precision. When balanced, it provides charismatic leadership and flawless choreography execution; when elevated, it causes inflammation and perfectionist stress.',
    balancingPractices: [
      'Cooling Moon Salutations (Chandra Namaskar)',
      'Sheetali and Sheetkari cooling pranayama',
      'Flowing semi-classical and graceful lyrical choreography',
      'Meditation in tranquil natural surroundings or twilight'
    ],
    recommendedFoods: [
      'Naturally cooling foods: cucumber, coconut water, coriander',
      'Sweet, bitter, and astringent tastes',
      'Ghee, sweet fruits (melons, grapes, dates)',
      'Mint, fennel, coriander, cardamom teas'
    ],
    foodsToLimit: [
      'Deep-fried, extremely spicy chillies, pungent mustard',
      'Sour fermented foods, alcohol, excessive coffee',
      'Salty packaged snacks'
    ],
    danceAndYogaAdvice: 'Avoid overheating during high-intensity Zumba or rapid Chakkars. Cool down immediately with hydrating coconut water and release competitive ego through devotional bhav.'
  },
  kapha: {
    id: 'kapha',
    name: 'Kapha Dosha (Earth & Water)',
    elements: 'Earth (Prithvi) + Water (Jala)',
    qualities: ['Heavy', 'Slow', 'Cool', 'Oily', 'Stable'],
    description: 'Kapha governs bodily structure, joint lubrication, endurance, stamina, and emotional loyalty. When balanced, it yields supreme dance stamina and calmness; when elevated, it causes lethargy, weight gain, and attachment.',
    balancingPractices: [
      'Vigorous Bolly-Zumba cardio intervals and rapid Kathak Tatkar',
      'Dynamic Surya Namaskars and Ashtanga Primary series',
      'Kapalabhati shining skull breathwork',
      'Invigorating dry brushing (Garshana) before practice'
    ],
    recommendedFoods: [
      'Light, warm, freshly cooked meals with minimal oil',
      'Pungent, bitter, and astringent tastes',
      'Abundant steamed greens, legumes (moong, lentils)',
      'Black pepper, ginger, fenugreek, turmeric, cloves'
    ],
    foodsToLimit: [
      'Heavy dairy, cheeses, cold milk desserts',
      'Sweet, sour, and overly salty heavy meals',
      'Deep-fried greasy foods, excess refined sugars'
    ],
    danceAndYogaAdvice: 'Push beyond comfortable limits with sweat-inducing dance intervals and high-energy jump choreography to stimulate circulation and lymphatic vitality.'
  }
};

export const DINACHARYA_ROUTINES: DinacharyaStep[] = [
  {
    id: 'dina-1',
    timeSlot: 'Morning (Brahma Muhurta)',
    timeRange: '05:30 AM – 06:30 AM',
    title: 'Sacred Awakening & Oral Purification',
    sanskritName: 'Brahma Muhurta & Mukha Prakshalana',
    description: 'Waking up before sunrise when the atmosphere is charged with pure sattvic prana and universal peace.',
    benefit: 'Enhances cognitive intuition, eliminates nighttime mucosal toxins (Ama), and resets circadian rhythms.',
    instructions: [
      'Open eyes gently and look into your open palms, reciting a short shloka of gratitude for the gift of dance and life.',
      'Scrape tongue 7–10 times from back to front using a pure copper tongue scraper to remove Ama coat.',
      'Swish 1 tablespoon of warm virgin sesame oil or virgin coconut oil in mouth for 3–5 minutes (Gandusha / Oil Pulling), then spit and rinse with warm salt water.',
      'Sip a tall glass of lukewarm copper-infused water (Ushapan) with a squeeze of fresh lemon.'
    ],
    icon: 'sun'
  },
  {
    id: 'dina-2',
    timeSlot: 'Morning (Brahma Muhurta)',
    timeRange: '06:30 AM – 07:30 AM',
    title: 'Nourishing Self-Massage & Morning Movement',
    sanskritName: 'Abhyanga & Vyayama',
    description: 'Massaging joints and limbs with warm herb-infused oil followed by yoga asanas and classical dance rehearsal.',
    benefit: 'Lubricates synovial joint fluid, strengthens ligaments for foot stamps, and tones muscles.',
    instructions: [
      'Warm sesame or almond oil between palms; apply in circular motions over joints (shoulders, elbows, knees, ankles) and long strokes over long bones.',
      'Allow oil to absorb for 15 minutes, then take a warm therapeutic shower.',
      'Roll out your mat for Surya Namaskar or Tatkar footwork warmup while muscles are warm and supple.'
    ],
    recommendedPracticeId: 'y-surya-flow',
    icon: 'sparkles'
  },
  {
    id: 'dina-3',
    timeSlot: 'Midday (Solar Peak)',
    timeRange: '12:00 PM – 01:30 PM',
    title: 'Solar Peak Digestion & Grounding Feast',
    sanskritName: 'Jatharagni Madhyahna Bhojan',
    description: 'Eating the largest and most wholesome meal of the day when the sun is directly overhead and digestive fire (Agni) is at peak potency.',
    benefit: 'Maximizes nutrient absorption, prevents post-meal bloating, and supplies sustained stamina for afternoon creative sessions.',
    instructions: [
      'Eat in a peaceful, seated posture without digital screens or multitasking.',
      'Incorporate all 6 Ayurvedic tastes (Sweet, Sour, Salty, Pungent, Bitter, Astringent).',
      'Avoid iced beverages; sip warm ginger-cumin tea during or after the meal.',
      'Take 100 gentle steps (Shatapadi) after eating to stimulate healthy peristalsis.'
    ],
    icon: 'flame'
  },
  {
    id: 'dina-4',
    timeSlot: 'Sunset (Sandhya)',
    timeRange: '05:30 PM – 06:45 PM',
    title: 'Twilight Sandhya Transition & Creative Expression',
    sanskritName: 'Sandhyavandanam & Nritta',
    description: 'The sacred transition between daytime activity and nighttime introspection — optimal for music, dance abhinaya, and chanting.',
    benefit: 'Transitions the sympathetic nervous system into parasympathetic relaxation while retaining creative clarity.',
    instructions: [
      'Light an oil lamp (Diya) with sesame oil or ghee to clear ambient energy.',
      'Practice expressive classical Hastak mudras, Kathak chakkars, or calming Yin yoga.',
      'Engage in 10 minutes of Nadi Shodhana alternate nostril breathing to clear mental chatter.'
    ],
    recommendedPracticeId: 'k-hastak-mudras',
    icon: 'sunset'
  },
  {
    id: 'dina-5',
    timeSlot: 'Night (Ratricharya)',
    timeRange: '09:00 PM – 10:30 PM',
    title: 'Nocturnal Digital Detox & Golden Milk Elixir',
    sanskritName: 'Ratricharya & Haridra Ksheeram',
    description: 'Preparing the mind and tissues for cellular deep repair through restorative psychic stillness and warming herbal milk.',
    benefit: 'Suppresses inflammation from physical rehearsals, boosts growth hormone, and induces deep slow-wave REM sleep.',
    instructions: [
      'Turn off all mobile screens, bright LEDs, and work notifications by 09:30 PM.',
      'Sip warm Golden Turmeric Milk brewed with A2 milk (or oat milk), turmeric, black pepper, nutmeg, and cardamom.',
      'Massage the soles of your feet with warm ghee or castor oil (Pada Abhyanga) to pull heat downward from the brain.',
      'Lie down in Savasana for 10 minutes of Yoga Nidra before drifting into peaceful sleep by 10:30 PM.'
    ],
    recommendedPracticeId: 'm-yoga-nidra',
    icon: 'moon'
  }
];

export const AYURVEDIC_ELIXIRS: AyurvedaRecipe[] = [
  {
    id: 'elixir-ccf',
    name: 'CCF Sacred Digestive Tea',
    sanskritName: 'Jeeraka-Dhanyaka-Mishreya Kwatha',
    category: 'Digestive Tea',
    doshaSuitability: 'Tridoshic (Balances Vata, Pitta & Kapha)',
    timeToMake: '8 mins',
    description: 'The quintessential Ayurvedic debloating and metabolic tonic made with equal parts whole cumin, coriander, and fennel seeds.',
    ingredients: [
      '1/2 tsp whole cumin seeds (Jeera)',
      '1/2 tsp whole coriander seeds (Dhaniya)',
      '1/2 tsp whole fennel seeds (Saunf)',
      '3 cups fresh filtered water',
      'Few drops of lime juice (optional)'
    ],
    instructions: [
      'Bring water to a rolling boil in a stainless steel saucepan.',
      'Add cumin, coriander, and fennel seeds.',
      'Reduce heat to low-medium and simmer gently for 5–7 minutes until water reduces slightly and turns golden amber.',
      'Strain into a thermos or mug and sip warm throughout the day between meals.'
    ],
    benefits: 'Gently rekindles digestive fire without overheating Pitta, flushes lymphatic fluid, and prevents heavy bloating before dance rehearsals.'
  },
  {
    id: 'elixir-golden-milk',
    name: 'Restorative Golden Turmeric Milk',
    sanskritName: 'Haridra Ksheeram',
    category: 'Night Elixir',
    doshaSuitability: 'Especially soothing for Vata and Pitta',
    timeToMake: '6 mins',
    description: 'An ancient soothing nighttime drink formulated with organic turmeric, crushed black pepper for curcumin bioavailability, and relaxing nutmeg.',
    ingredients: [
      '1 cup warm organic A2 cow milk (or oat/almond milk)',
      '1/2 tsp organic ground Lakadong turmeric',
      'Pinch of freshly cracked black pepper (essential for bioavailability)',
      '1/4 tsp crushed cardamom pods',
      'Pinch of freshly grated nutmeg (natural sleep inducer)',
      '1/2 tsp raw honey or pure jaggery'
    ],
    instructions: [
      'Gently heat milk in a pan on medium-low.',
      'Whisk in turmeric, black pepper, cardamom, and nutmeg.',
      'Simmer gently for 3 minutes without boiling over.',
      'Remove from heat. Allow to cool slightly to drinking temperature before stirring in raw honey or jaggery.',
      'Sip slowly 45 minutes before sleep.'
    ],
    benefits: 'Powerful natural anti-inflammatory for dancer knees, ankles, and spinal joints; calms the nervous system and deepens restorative sleep.'
  },
  {
    id: 'elixir-amla-morning',
    name: 'Amla, Ginger & Mint Prana Booster',
    sanskritName: 'Amalaki Rasayana',
    category: 'Morning Tonic',
    doshaSuitability: 'Balances all three Doshas, rejuvenates Ojas',
    timeToMake: '5 mins',
    description: 'Vitamin C-rich Ayurvedic morning booster crafted with fresh Indian gooseberry (Amla), ginger, and fresh mint leaves.',
    ingredients: [
      '1 fresh Amla (deseeded and chopped) or 1 tbsp pure Amla juice',
      '1/2 inch fresh ginger root',
      '6-8 fresh garden mint leaves',
      '1 cup lukewarm water',
      '1/4 tsp pink Himalayan rock salt'
    ],
    instructions: [
      'Blend chopped Amla, ginger, and mint leaves with 1/2 cup water until smooth.',
      'Strain through a fine mesh sieve into a glass.',
      'Top with remaining lukewarm water and pink rock salt.',
      'Drink immediately on an empty stomach after morning oral hygiene.'
    ],
    benefits: 'Boosts immune resistance, purifies blood, enhances skin radiance, and provides crisp mental clarity for morning choreography.'
  }
];
