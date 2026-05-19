// ─── Mood Options ────────────────────────────────────────────────────
export const MOODS = [
  { id: "happy", emoji: "😊", label: "Happy", color: "#F9D4E2" },
  { id: "calm", emoji: "😌", label: "Calm", color: "#D4E2F9" },
  { id: "anxious", emoji: "😰", label: "Anxious", color: "#F9E8D4" },
  { id: "sad", emoji: "😢", label: "Sad", color: "#D4D9F9" },
  { id: "irritable", emoji: "😤", label: "Irritable", color: "#F9D4D4" },
  { id: "energetic", emoji: "⚡", label: "Energetic", color: "#D4F9E8" },
  { id: "tired", emoji: "😴", label: "Tired", color: "#E8D4F9" },
  { id: "loved", emoji: "🥰", label: "Loved", color: "#F9D4EC" },
];

// ─── Symptom Options ─────────────────────────────────────────────────
export const SYMPTOMS = [
  { id: "cramps", icon: "🔥", label: "Cramps" },
  { id: "headache", icon: "🤕", label: "Headache" },
  { id: "bloating", icon: "🫧", label: "Bloating" },
  { id: "backpain", icon: "💆", label: "Back Pain" },
  { id: "fatigue", icon: "😫", label: "Fatigue" },
  { id: "nausea", icon: "🤢", label: "Nausea" },
  { id: "insomnia", icon: "🌙", label: "Insomnia" },
  { id: "cravings", icon: "🍫", label: "Cravings" },
  { id: "acne", icon: "✨", label: "Acne" },
  { id: "breast", icon: "💗", label: "Breast Tenderness" },
];

// ─── Onboarding Questions ────────────────────────────────────────────
export const ONBOARDING_QUESTIONS = [
  {
    id: "age",
    question: "What's your age range?",
    subtitle: "This helps us personalise your experience",
    options: ["Under 18", "18–35", "35–45", "45–55", "55+"],
  },
  {
    id: "regularity",
    question: "How would you describe your menstrual cycle?",
    subtitle: "No cycle is exactly the same — just your best guess",
    options: ["Regular", "Irregular", "Not sure"],
  },
  {
    id: "pain",
    question: "Do you experience menstrual pain?",
    subtitle: "Be honest — there's no wrong answer",
    options: ["No pain", "Mild pain", "Moderate pain", "Severe pain"],
  },
  {
    id: "management",
    question: "How do you manage period pain?",
    subtitle: "Select what applies most",
    options: ["Pain medication", "Heat therapy", "Exercise", "Rest", "Herbal remedies", "Nothing specific"],
  },
  {
    id: "medication",
    question: "Are you currently on any medication?",
    subtitle: "Including contraceptives or supplements",
    options: ["None", "Contraceptive pill", "IUD", "Supplements", "Other medication"],
  },
  {
    id: "discharge",
    question: "Have you noticed changes in discharge?",
    subtitle: "This can indicate different cycle phases",
    options: ["Yes, regularly", "Sometimes", "Rarely", "I don't track this"],
  },
  {
    id: "bleeding",
    question: "Do you experience bleeding outside your cycle?",
    subtitle: "Spotting or unexpected bleeding",
    options: ["Never", "Rarely", "Sometimes", "Frequently"],
  },
  {
    id: "lastPeriodStart",
    question: "When did your last period start?",
    subtitle: "This helps us predict your next cycle",
    type: "date",
  },
  {
    id: "appUsage",
    question: "Have you ever used any health or period-tracking apps before?",
    subtitle: "Tell us about your experience",
    options: [
      "Yes, I use one regularly",
      "Yes, but I stopped using it",
      "No, but I'm interested in trying one",
      "No, I've never considered it",
    ],
  },
  {
    id: "helpfulFeatures",
    question: "What features would you find most helpful in a women's health app?",
    subtitle: "Select all that apply",
    multiSelect: true,
    options: [
      "Customise period & symptom tracking",
      "Personalised health tips (by age / condition)",
      "Doctor / gynaecologist appointment booking",
      "Anonymous community Q&A space",
      "Medication / reminder alerts",
      "Other",
    ],
  },
  {
    id: "careDelay",
    question: "Have you ever delayed seeking care for a gynaecological issue?",
    subtitle: "Your experience helps us support you better",
    options: [
      "Yes, due to embarrassment / stigma",
      "Yes, due to cost or lack of access",
      "Yes, because I didn't know where to get reliable info",
      "No, I always seek help right away",
      "No, I've never had a gynaecological concern",
    ],
  },
  {
    id: "recordFrequency",
    question: "How often would you be willing to record your health symptoms?",
    subtitle: "Be realistic — consistency matters most",
    options: [
      "Daily",
      "A few times a week",
      "Only when symptoms appear",
      "Only before or during periods",
      "Not sure",
    ],
  },
  {
    id: "safetyFeatures",
    question: "What would make you feel safer using a women's health app?",
    subtitle: "Select all that apply",
    multiSelect: true,
    options: [
      "Strong privacy protection",
      "Anonymous mode",
      "Password or Face ID lock",
      "Clear data privacy policy",
      "Control over data sharing",
    ],
  },
  {
    id: "extraSymptoms",
    question: "What other symptoms would you like to track besides periods?",
    subtitle: "Select all that apply",
    multiSelect: true,
    options: [
      "Mood changes",
      "Sleep quality",
      "Skin changes",
      "Appetite changes",
      "Energy level",
      "Vaginal discharge",
      "Hot flashes",
      "Urinary discomfort",
    ],
  },
  {
    id: "recordDesign",
    question: "What recording design do you prefer for menstrual tracking?",
    subtitle: "Select all that apply",
    multiSelect: true,
    options: [
      "Minimalist one-click recording",
      "Custom symptom tags",
      "Shortcut templates for common combinations",
      "Voice recording",
      "Smart reminders to avoid missing records",
      "Detailed flow & colour tracking",
      "Upload reports & medical records",
    ],
  },
  {
    id: "privacyConcern",
    question: "How concerned are you about the privacy of your health data?",
    subtitle: "1 = not concerned at all · 5 = extremely concerned",
    options: ["1", "2", "3", "4", "5"],
  },
  {
    id: "identity",
    question: "Which best describes you?",
    subtitle: "This helps us tailor content to your life stage",
    options: ["Student", "Working woman", "Full-time mother", "Retiree", "Other"],
  },
  {
    id: "mainPurpose",
    question: "What is your main reason for using a women's health app?",
    subtitle: "Select the one that fits best",
    options: [
      "Track cycle & predict periods / ovulation",
      "Pregnancy preparation or contraception",
      "Long-term gynaecological health tracking",
      "Other",
    ],
  },
  {
    id: "examHabit",
    question: "Do you have a habit of regular physical examinations?",
    subtitle: "Annual check-ups or gynaecological screenings",
    options: [
      "Once a year",
      "Once every two years",
      "Occasionally",
      "Never had a physical examination",
    ],
  },
  {
    id: "longTermFactors",
    question: "What matters most for your long-term use of this app?",
    subtitle: "Select the most important factor for you",
    options: [
      "Absolute privacy — no risk of data leakage",
      "Simple & intuitive — no complex or redundant functions",
      "Full life-cycle compatibility across different life stages",
      "Other",
    ],
  },
];

// ─── Community Posts ─────────────────────────────────────────────────
export const COMMUNITY_POSTS = [
  {
    id: 1,
    author: "Moonflower",
    avatar: "🌸",
    time: "2h ago",
    text: "Does anyone else get really intense cravings the week before? I just ate an entire jar of pickles and I'm not even sorry 😅",
    likes: 24,
    comments: 2,
    commentsList: [
      { id: 101, author: "SunriseYogi", avatar: "🧘", text: "YES! Chocolate and salty snacks for me every single month 😂", time: "1h ago" },
      { id: 102, author: "WildRose", avatar: "🌹", text: "The cravings are so real. I've read it's linked to progesterone!", time: "45m ago" },
    ],
    hasImage: false,
  },
  {
    id: 2,
    author: "SunriseYogi",
    avatar: "🧘",
    time: "4h ago",
    text: "Started tracking my moods this month and I'm amazed at how clearly they correlate with my cycle. Knowledge is power!",
    likes: 42,
    comments: 1,
    commentsList: [
      { id: 201, author: "CozyNest", avatar: "🦋", text: "Same! I finally understood why I get weepy every 3rd week 💜", time: "3h ago" },
    ],
    hasImage: false,
  },
  {
    id: 3,
    author: "WildRose",
    avatar: "🌹",
    time: "6h ago",
    text: "My heating pad is my best friend this week. Also discovered that raspberry leaf tea actually helps with cramps!",
    likes: 31,
    comments: 0,
    commentsList: [],
    hasImage: false,
  },
  {
    id: 4,
    author: "CozyNest",
    avatar: "🦋",
    time: "1d ago",
    text: "Gentle reminder: it's okay to cancel plans when your body needs rest. Self-care isn't selfish. 💜",
    likes: 89,
    comments: 0,
    commentsList: [],
    hasImage: false,
  },
];

// ─── Cycle Phases ────────────────────────────────────────────────────
export const CYCLE_PHASES = [
  { name: "Menstrual", color: "#E8A0B8", days: "Day 1–5", icon: "🌺" },
  { name: "Follicular", color: "#A0C8E8", days: "Day 6–13", icon: "🌱" },
  { name: "Ovulation", color: "#E8D4A0", days: "Day 14–16", icon: "🌕" },
  { name: "Luteal", color: "#C8A0E8", days: "Day 17–28", icon: "🍂" },
];

// ─── AI Chat Responses ───────────────────────────────────────────────
export const AI_RESPONSES = {
  default:
    "I'm here to help you understand your body better. You can ask me about your symptoms, emotions, cycle phases, or general wellness tips. What's on your mind?",
  cramps:
    "Cramps can be really uncomfortable. Based on your cycle phase, here are some things that might help:\n\n🫖 Warm herbal tea (chamomile or ginger)\n🔥 A heating pad on your lower abdomen\n🧘 Gentle stretching or yoga\n💊 If needed, ibuprofen can help with inflammation\n\nWould you like me to suggest specific exercises?",
  anxiety:
    "Feeling anxious is very common, especially during the luteal phase when progesterone levels shift. Here are some grounding techniques:\n\n🫁 Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s\n🚶 A short walk outdoors can help reset your nervous system\n📝 Journaling your thoughts can provide clarity\n\nRemember, these feelings are temporary and valid.",
  sleep:
    "Sleep can be disrupted by hormonal changes throughout your cycle. Some tips:\n\n🌙 Keep a consistent bedtime routine\n📱 Reduce screen time 1 hour before bed\n🫖 Try magnesium-rich foods or chamomile tea\n🧊 Keep your room cool (65–68°F / 18–20°C)\n\nWould you like tips specific to your current cycle phase?",
  mood:
    "Mood changes are completely normal throughout your cycle. During the luteal phase, dropping estrogen levels can shift your emotional baseline. Here's what might help:\n\n🎵 Listening to calming music\n📝 Journaling for 5 minutes\n🫂 Reaching out to a friend\n🚶 A gentle walk in nature\n\nYour feelings are valid. Would you like specific tips for your current phase?",
};

// ─── Gallery Images (simulated) ──────────────────────────────────────
export const GALLERY_IMAGES = ["🌸", "🌿", "☕", "🧘", "🌅", "📖", "🫖", "🍵", "🧸"];

export const GALLERY_COLORS = [
  "#F9D4E2", "#D4F0D8", "#F5EEDF", "#E8D4F9",
  "#F9E8D4", "#D4E2F9", "#E8D4F9", "#D4F0D8", "#F9D4E2",
];
