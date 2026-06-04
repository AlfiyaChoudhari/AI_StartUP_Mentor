// AI Service for Groq Integration or Mock Fallback

const getGroqApiKey = () => {
  return localStorage.getItem('VITE_GROQ_API_KEY') || import.meta.env.VITE_GROQ_API_KEY || '';
};

export const isGroqConfigured = () => {
  return !!getGroqApiKey().trim();
};

// Generic fetch completions from Groq
async function fetchGroqChatCompletion(messages, responseFormatJson = false) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Groq API Key is not configured.');
  }

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: messages,
    temperature: 0.7,
    max_tokens: 4000,
  };

  if (responseFormatJson) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Groq API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 1. Idea Validation Engine
export async function validateIdea(title, description) {
  if (!isGroqConfigured()) {
    return simulateIdeaValidation(title, description);
  }

  const systemPrompt = `You are an expert startup incubator director. Evaluate the startup idea provided by the user. 
You MUST respond with a JSON object containing the following keys and strictly structured values:
{
  "score": number (0-100),
  "problemSolutionFit": "Detailed 2-3 sentence analysis of problem-solution fit",
  "marketNeed": "Detailed 2-3 sentence analysis of market size, pain-point severity, and demand",
  "scalability": "Detailed 2-3 sentence analysis of operational and technological scalability",
  "revenuePotential": "Detailed 2-3 sentence analysis of business model, monetization strategies, and unit economics",
  "innovationScore": number (0-100),
  "feedback": ["Constructive recommendation 1", "Constructive recommendation 2", "Constructive recommendation 3"]
}
Do not write any markdown formatting or introductory text. Respond only with raw JSON.`;

  const userPrompt = `Startup Title: ${title}\nStartup Description: ${description}`;

  try {
    const responseText = await fetchGroqChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Groq API error, falling back to mock:", error);
    return simulateIdeaValidation(title, description);
  }
}

// 2. Competitor Analysis
export async function analyzeCompetitors(domain, description) {
  if (!isGroqConfigured()) {
    return simulateCompetitorAnalysis(domain, description);
  }

  const systemPrompt = `You are a top-tier management consultant. Analyze the competitor landscape for the startup domain or idea.
You MUST respond with a JSON object containing the following keys:
{
  "competitors": [
    { "name": "Competitor A", "strengths": "Strength description", "weaknesses": "Weakness description", "pricing": "Pricing model description", "audience": "Target audience description" },
    { "name": "Competitor B", "strengths": "Strength description", "weaknesses": "Weakness description", "pricing": "Pricing model description", "audience": "Target audience description" },
    { "name": "Competitor C", "strengths": "Strength description", "weaknesses": "Weakness description", "pricing": "Pricing model description", "audience": "Target audience description" }
  ],
  "competitiveAdvantage": ["Advantage tip 1", "Advantage tip 2", "Advantage tip 3"]
}
Respond ONLY with a JSON object.`;

  const userPrompt = `Startup Title/Domain: ${domain}\nDescription: ${description}`;

  try {
    const responseText = await fetchGroqChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Groq API error, falling back to mock:", error);
    return simulateCompetitorAnalysis(domain, description);
  }
}

// 3. Business Plan Generator
export async function generateBusinessPlan(title, description) {
  if (!isGroqConfigured()) {
    return simulateBusinessPlan(title, description);
  }

  const systemPrompt = `You are a Venture Builder. Generate a professional business plan based on the startup idea.
You MUST respond with a JSON object containing the following keys:
{
  "executiveSummary": "Paragraph outlining the vision, target, and core thesis",
  "problemStatement": "Clear summary of the specific pain point being addressed",
  "solution": "How the startup solves the problem uniquely",
  "targetMarket": "Market segments, size (TAM/SAM/SOM), and demographics",
  "revenueModel": "Pricing tiers, subscription/transaction models, and channels",
  "marketingStrategy": "Go-to-market, customer acquisition cost considerations, and marketing channels",
  "operationsPlan": "Tech stack, key partners, logistics, and legal requirements",
  "financialPlan": "Projected expenses, funding needed, break-even parameters, and milestones"
}
Respond ONLY with a JSON object.`;

  const userPrompt = `Startup Title: ${title}\nDescription: ${description}`;

  try {
    const responseText = await fetchGroqChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Groq API error, falling back to mock:", error);
    return simulateBusinessPlan(title, description);
  }
}

// 4. Pitch Deck Generator
export async function generatePitchDeck(title, description) {
  if (!isGroqConfigured()) {
    return simulatePitchDeck(title, description);
  }

  const systemPrompt = `You are an expert VC pitch designer. Create a slide deck draft outline for this startup.
You MUST respond with a JSON object containing the following keys. Keep each slide description highly punchy, professional, and readable (bullet points or short phrases).
{
  "slides": [
    { "slideNumber": 1, "title": "Title Slide", "content": "Startup Name: [Name]. Slogan or brief vision statement." },
    { "slideNumber": 2, "title": "The Problem", "content": "1-3 bullets on the major customer pain point and why it is urgent." },
    { "slideNumber": 3, "title": "The Solution", "content": "1-3 bullets on the unique value proposition and how the product alleviates pain." },
    { "slideNumber": 4, "title": "Market Opportunity", "content": "TAM, SAM, SOM metrics and growth trends of the market." },
    { "slideNumber": 5, "title": "Business Model", "content": "How the business makes money: pricing, transaction fees, LTV expectations." },
    { "slideNumber": 6, "title": "Traction", "content": "Current status: pilot results, user growth, pre-registrations, or milestones reached." },
    { "slideNumber": 7, "title": "Competitor Analysis", "content": "Comparison grid showing how your startup differentiates on key parameters." },
    { "slideNumber": 8, "title": "Financial Projections", "content": "3-year projected revenue, key margins, and time to break-even." },
    { "slideNumber": 9, "title": "The Team", "content": "Core founders' expertise, industry experience, and crucial advisor roles." },
    { "slideNumber": 10, "title": "Funding Ask", "content": "Amount of investment requested, use of proceeds (R&D, marketing, operations)." }
  ]
}
Respond ONLY with a JSON object.`;

  const userPrompt = `Startup Title: ${title}\nDescription: ${description}`;

  try {
    const responseText = await fetchGroqChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Groq API error, falling back to mock:", error);
    return simulatePitchDeck(title, description);
  }
}

// 5. Mentor Chatbot
export async function chatWithMentor(message, history) {
  if (!isGroqConfigured()) {
    return simulateMentorChat(message, history);
  }

  const systemPrompt = `You are a legendary startup mentor (similar to Paul Graham, Marc Andreessen, and Naval Ravikant). 
Provide strategic, clear, actionable, and inspiring guidance. Be direct and avoid generic corporate buzzwords.
Format your response using professional markdown (bullet points, clear paragraphs).`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    })),
    { role: 'user', content: message }
  ];

  try {
    return await fetchGroqChatCompletion(messages, false);
  } catch (error) {
    console.error("Groq API error, falling back to mock:", error);
    return simulateMentorChat(message, history);
  }
}

// 6. Investor Readiness Assessment
export async function assessInvestorReadiness(answers) {
  if (!isGroqConfigured()) {
    return simulateInvestorReadiness(answers);
  }

  const systemPrompt = `You are a venture capitalist evaluating a pre-seed/seed startup. 
Analyze the user's readiness answers.
You MUST respond with a JSON object containing the following keys:
{
  "readinessScore": number (0-100),
  "maturityRating": "Pre-Seed / Seed / Series A Ready / Not Ready",
  "productEvaluation": "Detailed evaluation of their product maturity",
  "marketEvaluation": "Detailed evaluation of their market size & growth potential",
  "revenueEvaluation": "Detailed evaluation of their monetization & business model viability",
  "teamEvaluation": "Detailed evaluation of their team strength",
  "milestones": ["Milestone recommendation 1", "Milestone recommendation 2", "Milestone recommendation 3"]
}
Respond ONLY with a JSON object.`;

  const userPrompt = `Product Stage: ${answers.productStage}
Market Validation: ${answers.marketValidation}
Revenue Model Details: ${answers.revenueModel}
Team Composition: ${answers.teamStrength}
Current Traction: ${answers.currentTraction}`;

  try {
    const responseText = await fetchGroqChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Groq API error, falling back to mock:", error);
    return simulateInvestorReadiness(answers);
  }
}

// 7. SWOT Analysis Generator
export async function generateSWOT(title, description) {
  if (!isGroqConfigured()) {
    return simulateSWOT(title, description);
  }

  const systemPrompt = `You are a strategic startup auditor. Create a detailed SWOT analysis.
You MUST respond with a JSON object containing the following keys:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "threats": ["Threat 1", "Threat 2", "Threat 3"]
}
Respond ONLY with a JSON object.`;

  const userPrompt = `Startup Title: ${title}\nDescription: ${description}`;

  try {
    const responseText = await fetchGroqChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Groq API error, falling back to mock:", error);
    return simulateSWOT(title, description);
  }
}


// --- SMART MOCK SIMULATIONS FOR SANDBOX MODE ---

function simulateIdeaValidation(title, description) {
  // Deterministic scores based on character lengths to make it feel reactive
  const baseScore = Math.min(95, Math.max(45, 60 + (description.length % 35)));
  const innovation = Math.min(98, Math.max(50, 55 + (title.length % 40)));
  
  return {
    score: baseScore,
    problemSolutionFit: `The idea "${title}" addresses a clear user friction point. The described solution fits well by targeting the immediate symptoms, though long-term engagement requires deeper structural lock-in.`,
    marketNeed: `Strong indicators of organic demand. Similar markets show active willingness-to-pay, though target customer segmentation needs refinement to lower customer acquisition costs.`,
    scalability: `High operational scalability as a digital service. Unit economics will improve rapidly as user base scales, provided technology infrastructure is built modularly.`,
    revenuePotential: `Healthy margin potential. Monetization is plausible through SaaS subscriptions or transaction-based models, yielding recurring revenue options.`,
    innovationScore: innovation,
    feedback: [
      `Define user persona segments and start with a tight, localized MVP launch.`,
      `Develop a low-cost distribution channel or content loop to bypass high ad-spend.`,
      `Build a clear customer onboarding pathway to validate first-week engagement metrics.`
    ]
  };
}

function simulateCompetitorAnalysis(domain, description) {
  return {
    competitors: [
      {
        name: "Incumbents (Legacy Players)",
        strengths: "Large market share, high capital reserves, recognized brands.",
        weaknesses: "Slow execution cycles, bloated legacy codebases, expensive enterprise pricing.",
        pricing: "High enterprise-tier subscription with long-term contracts.",
        audience: "Enterprise executives, large-scale corporations."
      },
      {
        name: "Niche Startups",
        strengths: "Fast feature releases, modern developer UX, cheap starting tiers.",
        weaknesses: "Poor security credentials, limited features, unstable runway/support.",
        pricing: "$15 - $49 / user / month.",
        audience: "Individual creators, SMBs, agile startup tech teams."
      },
      {
        name: "Do-It-Yourself (DIY) Workflows",
        strengths: "No software cost, built exactly to specific user workflows.",
        weaknesses: "High maintenance time, lack of automated features, poor cross-team collaboration.",
        pricing: "Free (internal build costs).",
        audience: "Developers, technical founders, solo operators."
      }
    ],
    competitiveAdvantage: [
      `Integrate key automation workflows that remove 90% of manual configuration tasks.`,
      `Introduce a free/freemium self-serve tier to drive rapid organic developer adoption.`,
      `Provide visual analytics that are directly exportable, which competitors lock behind enterprise tiers.`
    ]
  };
}

function simulateBusinessPlan(title, description) {
  return {
    executiveSummary: `"${title}" is a disruptive venture designed to solve critical inefficiencies in its target industry. By building a modern, user-friendly software solution, we aim to capture early market share within the first 12 months.`,
    problemStatement: `Current solutions are slow, overly manual, and fragmented. Users waste valuable hours switching between platforms and manually consolidating data.`,
    solution: `Our platform integrates AI automation with a unified database, reducing workflow completion time by up to 70% and providing instant executive summaries.`,
    targetMarket: `The primary target market includes small to medium-sized business owners, operators, and startup teams. The global TAM is estimated at $12B, with a CAGR of 14.5%.`,
    revenueModel: `A classic tiered SaaS model ($29/mo Starter, $79/mo Professional) combined with API credit usage fees for heavy data operations.`,
    marketingStrategy: `Organic content marketing, product-led growth (PLG) mechanics via viral reporting sharing, and targeted developer relations sponsorships.`,
    operationsPlan: `Developed with a lean team using serverless infrastructure, React frontend, and robust microservices. Customer support will be semi-automated with an AI help desk.`,
    financialPlan: `Targeting break-even in month 14. Seed funding of $500k will be allocated 50% to engineering, 30% to growth/marketing, and 20% to operational runway.`
  };
}

function simulatePitchDeck(title, description) {
  return {
    slides: [
      { slideNumber: 1, title: "Title Slide", content: `${title}: Empowering founders to build the future with automated insights.` },
      { slideNumber: 2, title: "The Problem", content: "• High customer acquisition cost due to fragmented legacy platforms.\n• Manual work hours spent on data coordination.\n• Lack of real-time insights for early-stage operators." },
      { slideNumber: 3, title: "The Solution", content: "• A consolidated dashboard that automates SaaS onboarding.\n• Real-time AI recommendations that act as virtual board advisors.\n• Dynamic, exportable reports that impress partners instantly." },
      { slideNumber: 4, title: "Market Opportunity", "content": "• TAM: $15B global SaaS market size.\n• SAM: $4.5B targeting tech startups and digital-first agencies.\n• SOM: $300M attainable in the first 3 years of operations." },
      { slideNumber: 5, title: "Business Model", content: "• Product-led growth freemium funnel.\n• Subscription plans starting at $29/month.\n• Enterprise custom licensing contracts." },
      { slideNumber: 6, title: "Traction", content: "• 2,500+ waitlist signups in 3 weeks.\n• 15 pilot companies currently testing the beta release.\n• 40% weekly increase in user session times." },
      { slideNumber: 7, title: "Competitor Analysis", content: "• Competitors: Legacy spreadsheet models and manual consultants.\n• Our advantage: 10x faster report generation, 1/100th of the cost, fully collaborative." },
      { slideNumber: 8, title: "Financial Projections", content: "• Year 1: $120k ARR.\n• Year 2: $850k ARR.\n• Year 3: $3.2M ARR with 82% gross margins." },
      { slideNumber: 9, title: "The Team", content: "• CEO: Former product manager at a scaleup.\n• CTO: Full-stack engineer with 8 years of SaaS experience.\n• Advisors: 2 venture-backed founders." },
      { slideNumber: 10, title: "Funding Ask", content: "• Raising $750k Seed round.\n• Use of funds: 60% engineering hires, 25% marketing and growth, 15% operations." }
    ]
  };
}

function simulateMentorChat(message, history) {
  const lowercase = message.toLowerCase();
  
  if (lowercase.includes('marketing') || lowercase.includes('grow') || lowercase.includes('customer')) {
    return `### 💡 Mentor Growth Advice

To get your first 100 customers, focus on **doing things that don't scale**. Don't spend money on Google or Facebook Ads yet—you don't have the data to optimize them.

Here is what you need to do:
1. **Cold Outbound:** Identify 50 high-potential prospects on LinkedIn. Write them personalized messages highlighting *their* pain point, not *your* product.
2. **Online Communities:** Be active on Reddit, IndieHackers, and Discord where your users hang out. Answer questions helpfully without pitching, and mention your startup only when highly relevant.
3. **Build in Public:** Share your journey, struggles, and metrics on Twitter/X or LinkedIn. It builds an organic trust engine.`;
  }
  
  if (lowercase.includes('fund') || lowercase.includes('investor') || lowercase.includes('raise') || lowercase.includes('pitch')) {
    return `### 💰 Mentor Funding Strategy

Raising capital is a sales funnel. Before you pitch a single VC, you must establish **leverage**:

- **Traction first:** Investors care about numbers. 20% month-over-month user growth beats a perfect slide deck every time.
- **Warm introductions:** Cold emails to VCs have a <1% conversion rate. Find mutual connections on LinkedIn or ask other founders they have invested in for an intro.
- **The "Ask" clarity:** Be crystal clear about how much you need, how long it gives you (aim for 18 months of runway), and exactly what milestones it unlocks (e.g., reaching $50k MRR).`;
  }

  if (lowercase.includes('price') || lowercase.includes('monetize') || lowercase.includes('revenue')) {
    return `### 💸 Mentor Pricing Recommendation

Most founders undercharge because of imposter syndrome. 
1. **Avoid the race to the bottom:** Charging $5/month means you need thousands of customers to survive. Charge a premium and support those customers exceptionally.
2. **Value-based pricing:** Price based on the money or time you save the customer. If you save an employee 10 hours a week ($300 value), charging $49/month is a no-brainer.
3. **Keep it simple:** Start with 2 clear tiers: a self-serve tier for single users, and an team tier with collaboration features.`;
  }

  return `### 👋 Hello Founder!

Building a startup is about finding **truth** in the market. Most startups fail because they build something nobody actually wants.

Here are three rules to follow this week:
- **Talk to users:** Spend at least 5 hours talking directly to people in your target market. Ask them about their daily workflows and what they hate doing.
- **Build fast:** Launch an MVP that does *one thing* exceptionally well. Don't build a massive dashboard if they just need a simple tool.
- **Measure behavior:** Don't ask users "would you buy this?" Ask them to sign up, input data, or pay a pre-order fee. Actions speak louder than surveys.

What specific problem are you trying to tackle right now? Let's narrow it down.`;
}

function simulateInvestorReadiness(answers) {
  const stageMap = { ideation: 20, mvp: 45, launch: 65, growth: 85 };
  const validationMap = { none: 10, surveys: 30, pilots: 60, revenue: 85 };
  
  const stageScore = stageMap[answers.productStage] || 30;
  const validationScore = validationMap[answers.marketValidation] || 35;
  const rawScore = Math.round((stageScore + validationScore + 50) / 2);
  const readinessScore = Math.min(95, Math.max(15, rawScore));

  let rating = "Not Ready";
  if (readinessScore > 75) rating = "Series A Ready";
  else if (readinessScore > 55) rating = "Seed Ready";
  else if (readinessScore > 35) rating = "Pre-Seed Ready";

  return {
    readinessScore,
    maturityRating: rating,
    productEvaluation: `Product is in the "${answers.productStage}" stage. To attract institutional capital, focus on stabilizing core features, reducing load latency, and establishing a clear roadmap of customer-driven feature requests.`,
    marketEvaluation: `Market validation relies on "${answers.marketValidation}". Standard survey data is soft; VCs will want to see letters of intent (LOIs), active pilot engagements, or growing transactional revenue.`,
    revenueEvaluation: `Revenue strategy is set to "${answers.revenueModel}". This model has good scalability, but you must define the Unit Economics (LTV/CAC ratio) and target a high gross margin (>70%).`,
    teamEvaluation: `Team composition is described as "${answers.teamStrength}". Ensure you have a clear split of technical execution capability and sales/growth ownership to reduce execution risk.`,
    milestones: [
      `Secure at least 3 formal pilot customers or letters of intent (LOIs).`,
      `Document a repeatable customer acquisition channel with clear cost metrics.`,
      `Finalize a clickable MVP prototype showing a completed core user journey.`
    ]
  };
}

function simulateSWOT(title, description) {
  return {
    strengths: [
      "Agile team structure enabling fast shipping speed.",
      "Lower operational costs compared to bulky legacy competitors.",
      "Clear focus on an underserved market niche."
    ],
    weaknesses: [
      "Low initial brand recognition in a busy space.",
      "Limited marketing budget for high-volume customer acquisition.",
      "High dependency on external API provider infrastructure."
    ],
    opportunities: [
      "Emerging regulatory/market shifts demanding automated reporting tools.",
      "Potential partnerships with startup accelerators or SaaS hubs.",
      "Expansion into adjacent vertical workflows as users mature."
    ],
    threats: [
      "Rapid feature duplication by large, well-funded incumbents.",
      "Increases in standard developer hosting or third-party API costs.",
      "Economic downturn forcing target SMB clients to cut tool budgets."
    ]
  };
}
