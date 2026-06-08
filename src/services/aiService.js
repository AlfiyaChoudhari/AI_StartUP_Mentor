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

  const systemPrompt = `You are a friendly startup mentor and business advisor. Evaluate the startup idea provided by the user.
Explain everything in very simple English that a 15-year-old student can easily understand.
Rules:
- Use simple and easy words only.
- Use short sentences.
- Avoid all business, startup, financial, and technical jargon.
- Never use words like: monetization, scalability, unit economics, TAM, SAM, SOM, customer acquisition cost, venture capital, institutional capital, gross margin, market segmentation, operational efficiency, leverage, runway, traction, ecosystem, disruption, paradigm, optimization.
- Replace difficult terms with simple explanations.
- Give a score out of 100 with a simple reason.

You MUST respond with a JSON object containing the following keys and strictly structured values:
{
  "score": number (0-100),
  "problemSolutionFit": "Clearly explain what is good about the idea and how it solves the user's problem in 2 simple sentences.",
  "marketNeed": "Explain who will use this and why they need it in 2 simple sentences.",
  "scalability": "Explain if it is easy to grow this business or make it bigger in 2 simple sentences.",
  "revenuePotential": "Explain how the business can earn money in 2 simple sentences.",
  "innovationScore": number (0-100),
  "feedback": ["Practical suggestion for improvement 1", "Practical suggestion for improvement 2", "Practical suggestion for improvement 3"]
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

  const systemPrompt = `You are a friendly startup mentor and business advisor. Analyze the competitor landscape for the startup domain or idea.
Explain everything in very simple English that a 15-year-old student can easily understand.
Rules:
- Use simple and easy words only.
- Use short sentences.
- Avoid all business, startup, financial, and technical jargon.
- Never use words like: monetization, scalability, unit economics, TAM, SAM, SOM, customer acquisition cost, venture capital, institutional capital, gross margin, market segmentation, operational efficiency, leverage, runway, traction, ecosystem, disruption, paradigm, optimization.
- Compare competitors using simple points.
- Explain strengths and weaknesses in plain language.

You MUST respond with a JSON object containing the following keys:
{
  "competitors": [
    { "name": "Competitor A", "strengths": "Strength description in simple terms", "weaknesses": "Weakness description in simple terms", "pricing": "How much they charge in simple terms", "audience": "Who uses them in simple terms" },
    { "name": "Competitor B", "strengths": "Strength description in simple terms", "weaknesses": "Weakness description in simple terms", "pricing": "How much they charge in simple terms", "audience": "Who uses them in simple terms" },
    { "name": "Competitor C", "strengths": "Strength description in simple terms", "weaknesses": "Weakness description in simple terms", "pricing": "How much they charge in simple terms", "audience": "Who uses them in simple terms" }
  ],
  "competitiveAdvantage": ["How to stand out tip 1 in simple terms", "How to stand out tip 2", "How to stand out tip 3"]
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

  const systemPrompt = `You are a friendly startup mentor and business advisor. Generate a simple business plan based on the startup idea.
Explain everything in very simple English that a 15-year-old student can easily understand.
Rules:
- Use simple and easy words only.
- Use short sentences.
- Avoid all business, startup, financial, and technical jargon.
- Never use words like: monetization, scalability, unit economics, TAM, SAM, SOM, customer acquisition cost, venture capital, institutional capital, gross margin, market segmentation, operational efficiency, leverage, runway, traction, ecosystem, disruption, paradigm, optimization.

You MUST respond with a JSON object containing the following keys:
{
  "executiveSummary": "A short summary of what the business does in plain language",
  "problemStatement": "Explain the main problem in plain language",
  "solution": "Explain the solution in plain language",
  "targetMarket": "Explain who will use it in plain language",
  "revenueModel": "Explain how it can earn money in plain language",
  "marketingStrategy": "Explain how to tell people about it in plain language",
  "operationsPlan": "Explain how to build and run it in plain language",
  "financialPlan": "Explain how much money is needed and what it will be spent on in plain language"
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

  const systemPrompt = `You are a friendly startup mentor and business advisor. Create a slide deck draft outline for this startup.
Explain everything in very simple English that a 15-year-old student can easily understand.
Rules:
- Use simple and easy words only.
- Use short sentences.
- Avoid all business, startup, financial, and technical jargon.
- Never use words like: monetization, scalability, unit economics, TAM, SAM, SOM, customer acquisition cost, venture capital, institutional capital, gross margin, market segmentation, operational efficiency, leverage, runway, traction, ecosystem, disruption, paradigm, optimization.

You MUST respond with a JSON object containing the following keys. Keep each slide description highly simple, clear, and readable (bullet points or short phrases).
{
  "slides": [
    { "slideNumber": 1, "title": "Title Slide", "content": "Startup Name: [Name]. Simple description of what it does." },
    { "slideNumber": 2, "title": "The Problem", "content": "1-3 bullets on the simple problem being solved." },
    { "slideNumber": 3, "title": "The Solution", "content": "1-3 bullets on how the product makes life easier." },
    { "slideNumber": 4, "title": "Who Will Use It", "content": "Who are the customers and how many there are." },
    { "slideNumber": 5, "title": "How to Earn Money", "content": "How the business will charge customers or earn money." },
    { "slideNumber": 6, "title": "How it is Going", "content": "Where the project is right now (e.g. prototype, test users)." },
    { "slideNumber": 7, "title": "Other Similar Services", "content": "Who else does something similar and how this is better." },
    { "slideNumber": 8, "title": "Money Needed", "content": "Simple explanation of how much money is needed and what it will buy." },
    { "slideNumber": 9, "title": "The Team", "content": "Who is building it and what they are good at." },
    { "slideNumber": 10, "title": "Next Steps", "content": "What the team needs to do next to launch." }
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

  const systemPrompt = `You are a friendly startup mentor and business advisor.
Your job is to explain everything in very simple English that any common person, college student, or beginner can easily understand.
Rules:
- Act like a supportive, warm mentor.
- Give direct and practical advice.
- Avoid motivational speeches unless asked.
- Use simple and easy words only.
- Use short sentences.
- Avoid business, startup, financial, and technical jargon.
- If a difficult term is necessary, explain it in one simple sentence.
- Write as if you are talking to a 15-year-old student.
- Give practical examples whenever possible.
- Use bullet points for better readability.
- Never use complex consultant-style language.
- Never use words like: monetization, scalability, unit economics, TAM, SAM, SOM, customer acquisition cost, venture capital, institutional capital, gross margin, market segmentation, operational efficiency, leverage, runway, traction, ecosystem, disruption, paradigm, optimization.
- Replace difficult terms with simple explanations.
- Focus on clarity over professionalism.
- Every answer should be easy to understand within 30 seconds.
Format your response using simple markdown (bullet points, short clear paragraphs).`;

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

  const systemPrompt = `You are a friendly startup mentor and business advisor. Evaluate the user's readiness answers.
Explain everything in very simple English that a 15-year-old student can easily understand.
Rules:
- Use simple and easy words only.
- Use short sentences.
- Avoid all business, startup, financial, and technical jargon.
- Never use words like: monetization, scalability, unit economics, TAM, SAM, SOM, customer acquisition cost, venture capital, institutional capital, gross margin, market segmentation, operational efficiency, leverage, runway, traction, ecosystem, disruption, paradigm, optimization.

You MUST respond with a JSON object containing the following keys:
{
  "readinessScore": number (0-100),
  "maturityRating": "Just Starting / Has Prototype / Ready to Sell / Growing",
  "productEvaluation": "Evaluation of their product maturity in simple words",
  "marketEvaluation": "Evaluation of who will buy it in simple words",
  "revenueEvaluation": "Evaluation of how they will make money in simple words",
  "teamEvaluation": "Evaluation of their team strength in simple words",
  "milestones": ["Simple recommendation 1", "Simple recommendation 2", "Simple recommendation 3"]
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

  const systemPrompt = `You are a friendly startup mentor and business advisor. Create a detailed strengths, weaknesses, opportunities, and threats analysis.
Explain everything in very simple English that a 15-year-old student can easily understand.
Rules:
- Use simple and easy words only.
- Use short sentences.
- Avoid all business, startup, financial, and technical jargon.
- Never use words like: monetization, scalability, unit economics, TAM, SAM, SOM, customer acquisition cost, venture capital, institutional capital, gross margin, market segmentation, operational efficiency, leverage, runway, traction, ecosystem, disruption, paradigm, optimization.

You MUST respond with a JSON object containing the following keys:
{
  "strengths": ["Simple Strength 1", "Simple Strength 2", "Simple Strength 3"],
  "weaknesses": ["Simple Weakness 1", "Simple Weakness 2", "Simple Weakness 3"],
  "opportunities": ["Simple Opportunity 1", "Simple Opportunity 2", "Simple Opportunity 3"],
  "threats": ["Simple Threat 1", "Simple Threat 2", "Simple Threat 3"]
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
    problemSolutionFit: `The idea "${title}" solves a real problem that people face every day. Your solution directly addresses this need, making it very helpful for users.`,
    marketNeed: `There is a good group of people who really want this. Similar services show that people are happy to pay for help, but you need to define exactly who your first users will be.`,
    scalability: `It is easy to make this business grow because it is online. You can serve more users without spending a lot of extra money.`,
    revenuePotential: `You can earn money by charging a simple monthly fee. This is a simple and proven way to make steady money.`,
    innovationScore: innovation,
    feedback: [
      `Find a small group of users first and test your product with them.`,
      `Share your idea on free forums or social media to find people who need it.`,
      `Make a simple version of your product first to see if people like it.`
    ]
  };
}

function simulateCompetitorAnalysis(domain, description) {
  return {
    competitors: [
      {
        name: "Big Old Companies",
        strengths: "They have a lot of money and many people know their name.",
        weaknesses: "They are very slow to make changes and charge a lot of money.",
        pricing: "Very high prices with long contracts.",
        audience: "Big corporations and offices."
      },
      {
        name: "New Small Apps",
        strengths: "They build new things fast and are cheap to start.",
        weaknesses: "They have few features and might not have good support.",
        pricing: "$15 to $49 every month.",
        audience: "Regular people, students, and small tech teams."
      },
      {
        name: "Doing It Yourself",
        strengths: "It is free and built exactly how the person wants.",
        weaknesses: "It takes a lot of time to build and keep working.",
        pricing: "Free, but takes your time.",
        audience: "People who know how to build things themselves."
      }
    ],
    competitiveAdvantage: [
      `Make your app automatic so users do not have to do things by hand.`,
      `Offer a free version so people can try it without paying first.`,
      `Show clear, simple charts that other apps charge extra for.`
    ]
  };
}

function simulateBusinessPlan(title, description) {
  return {
    executiveSummary: `"${title}" is a simple service designed to solve an everyday problem. By making a simple website or app, we can help people save time and make their lives easier.`,
    problemStatement: `The current way of doing things is slow and takes too much manual work. People waste a lot of time doing things by hand.`,
    solution: `Our simple tool makes these tasks automatic, saving people hours of hard work every week.`,
    targetMarket: `Our first users will be small business owners, students, and busy teams who need to save time.`,
    revenueModel: `We will charge a simple monthly fee of $29 for the basic version and $79 for the advanced version.`,
    marketingStrategy: `We will write helpful posts online and share our tool in forums where our users ask for help.`,
    operationsPlan: `We will build a simple website. We only need a small team of developers and one helper for user questions.`,
    financialPlan: `We need some starting money to pay for building the website and telling people about it.`
  };
}

function simulatePitchDeck(title, description) {
  return {
    slides: [
      { slideNumber: 1, title: "Title Slide", content: `${title}: Helping people save time with simple automatic tools.` },
      { slideNumber: 2, title: "The Problem", content: "• People waste too many hours doing tasks by hand.\n• Other tools are too hard to use.\n• It is hard to see your progress in real time." },
      { slideNumber: 3, title: "The Solution", content: "• A simple page that does the work for you.\n• Easy tips that guide you step by step.\n• Simple reports you can share with others." },
      { slideNumber: 4, title: "Who Will Use It", content: "• There are millions of small businesses that need this.\n• We are starting with young business owners and students." },
      { slideNumber: 5, title: "How to Earn Money", content: "• Users can try it for free.\n• They pay a simple fee starting at $29/month for extra features." },
      { slideNumber: 6, title: "How it is Going", content: "• Over 2,000 people are waiting to try it.\n• 15 small teams are testing the early version right now." },
      { slideNumber: 7, title: "Other Similar Services", content: "• Other choices are slow and cost too much money.\n• Our tool is 10 times faster and much cheaper." },
      { slideNumber: 8, title: "Money Needed", content: "• We need some money to hire helpers and pay for the servers." },
      { slideNumber: 9, title: "The Team", content: "• Two founders who love building simple tools that help others." },
      { slideNumber: 10, title: "Next Steps", content: "• Launch the first version and listen to what our users say." }
    ]
  };
}

function simulateMentorChat(message, history) {
  const lowercase = message.toLowerCase();
  
  if (lowercase.includes('marketing') || lowercase.includes('grow') || lowercase.includes('customer')) {
    return `### 💡 How to find your first users
    
To get your first 100 users, you should talk to people one by one. Do not spend money on online ads yet. You do not need ads to start.

Here is what you can do:
- **Send direct messages:** Find 50 people on social media or LinkedIn who might need your help. Write them a friendly, personal note. Ask about their problems, do not just sell your product.
- **Join online groups:** Go to groups on Reddit or Discord where your users talk. Answer their questions nicely. Only talk about your product if it really helps them.
- **Share your story:** Write about how you are building your business. People love to support real founders who share their journey.`;
  }
  
  if (lowercase.includes('fund') || lowercase.includes('investor') || lowercase.includes('raise') || lowercase.includes('pitch')) {
    return `### 💰 How to get help with money
    
Before you ask anyone for money, you need to show that people want what you are building.

Here is a simple plan:
- **Show progress first:** People want to help businesses that are already growing. Having 20 new users every week is better than having a perfect slide show.
- **Ask for introductions:** Cold emails rarely work. Find friends or other founders who can introduce you to people with money.
- **Be clear about the money:** Know exactly how much money you need, how long it will last (aim for 18 months), and what you will build with it.`;
  }

  if (lowercase.includes('price') || lowercase.includes('monetize') || lowercase.includes('revenue')) {
    return `### 💸 How to set your prices
    
Many beginners set their prices too low because they are shy.
- **Do not charge too little:** Charging $5 a month means you need thousands of customers to make a living. It is better to charge a fair price and give great help.
- **Price based on value:** Think about how much time or money you save the user. If you save them 10 hours a week, charging $49 a month is a great deal for them.
- **Keep it simple:** Start with just two choices: one for single users and one for teams.`;
  }

  return `### 👋 Hello!
  
Building a startup is about finding out what people really need. Most new projects fail because they build something that nobody actually wants to use.

Here are three simple things to do this week:
- **Talk to users:** Spend at least 5 hours talking to your target users. Ask them what they do every day and what they dislike about it.
- **Build a simple test:** Make a very basic version of your tool that does just one thing really well. Do not build a huge app yet.
- **Watch what they do:** Do not ask them "would you use this?" Ask them to sign up or give you a small amount of money. Actions are real, words are just promises.

What specific problem are you working on right now? Let's talk about it!`;
}

function simulateInvestorReadiness(answers) {
  const stageMap = { ideation: 20, mvp: 45, launch: 65, growth: 85 };
  const validationMap = { none: 10, surveys: 30, pilots: 60, revenue: 85 };
  
  const stageScore = stageMap[answers.productStage] || 30;
  const validationScore = validationMap[answers.marketValidation] || 35;
  const rawScore = Math.round((stageScore + validationScore + 50) / 2);
  const readinessScore = Math.min(95, Math.max(15, rawScore));

  let rating = "Just Starting";
  if (readinessScore > 75) rating = "Growing";
  else if (readinessScore > 55) rating = "Ready to Sell";
  else if (readinessScore > 35) rating = "Has Prototype";

  return {
    readinessScore,
    maturityRating: rating,
    productEvaluation: `Your product is in the "${answers.productStage}" stage. Focus on making the main features work smoothly and fixing any errors before you try to sell it to more people.`,
    marketEvaluation: `You checked interest using "${answers.marketValidation}". Surveys are a good start, but it is much better to have real users who are testing your prototype or paying money.`,
    revenueEvaluation: `You chose the "${answers.revenueModel}" model. This is a good way to earn money, but you must make sure it costs less to build and sell than what customers pay.`,
    teamEvaluation: `Your team setup is "${answers.teamStrength}". Make sure you have one person to build the tool and one person to talk to users and sell it.`,
    milestones: [
      `Get at least 3 test users who promise to use your product regularly.`,
      `Find one free way to tell people about your product without paying for ads.`,
      `Make a simple working version of your product that users can click and try.`
    ]
  };
}

function simulateSWOT(title, description) {
  return {
    strengths: [
      "You can make changes very fast because your team is small.",
      "It costs you very little money to run this business right now.",
      "You are focusing on a clear, simple problem that big apps ignore."
    ],
    weaknesses: [
      "People do not know your brand name yet.",
      "You do not have a lot of money to spend on marketing.",
      "You depend on other systems to make your product work."
    ],
    opportunities: [
      "New changes in the market make people look for simple tools.",
      "You can partner with student groups or local communities.",
      "You can add more features as your users grow."
    ],
    threats: [
      "Big companies might copy your simple features if they see you succeed.",
      "Other tools might lower their prices to compete with you.",
      "Users might stop paying if they need to cut their personal budgets."
    ]
  };
}
