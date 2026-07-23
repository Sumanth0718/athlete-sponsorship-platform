import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAI() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export async function analyzeContractText(text: string) {
  const openai = getOpenAI();
  
  const systemPrompt = `You are a highly capable legal assistant trained to extract structured data from sponsorship and endorsement contracts.
Analyze the provided contract text and extract the following information. You MUST return your response as valid JSON matching the following schema:
{
  "brandName": "String or null if not found",
  "contractValue": "String (e.g. '$50,000') or null",
  "startDate": "String (e.g. 'YYYY-MM-DD') or null",
  "endDate": "String (e.g. 'YYYY-MM-DD') or null",
  "paymentTerms": "String summarizing payment structure or null",
  "renewalClause": "String summarizing renewal terms or null",
  "terminationClause": "String summarizing termination terms or null",
  "deliverables": "String summarizing expected athlete deliverables or null",
  "sponsorshipType": "String summarizing type of sponsorship (e.g. 'Apparel', 'Beverage') or null",
  "importantDeadlines": "String summarizing key dates or null"
}

If any piece of information is ambiguous or missing, output null for that field. Do not invent information. Keep summaries concise but comprehensive.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Here is the contract text to analyze:\n\n${text}` }
    ],
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate analysis from OpenAI.");
  }

  return JSON.parse(content);
}

export async function generateFollowUpEmail(context: {
  brandName: string;
  dealValue: number;
  amountReceived: number;
  pendingAmount: number;
  expectedPaymentDate: Date;
  notes?: string | null;
  tone?: "friendly" | "professional" | "firm";
  customNote?: string;
  athleteName?: string;
}) {
  const tone = context.tone || "professional";
  const athleteName = context.athleteName || "Alex Johnson";
  const expectedDateStr = new Date(context.expectedPaymentDate).toLocaleDateString();

  const openai = getOpenAI();

  const systemPrompt = `You are an expert sports agent assistant. Draft a context-aware payment reminder email for an athlete to send to a brand.
Tone desired: ${tone.toUpperCase()} (Friendly = polite check-in, Professional = direct formal reminder, Firm = urgent notice for overdue payment).
You MUST return your response as valid JSON matching the following schema:
{
  "subject": "String containing the email subject line",
  "body": "String containing the full email body"
}

Context:
Brand Name: ${context.brandName}
Athlete Name: ${athleteName}
Total Deal Value: $${context.dealValue.toLocaleString()}
Amount Received: $${context.amountReceived.toLocaleString()}
Pending Amount: $${context.pendingAmount.toLocaleString()}
Expected Payment Date: ${expectedDateStr}
Additional Notes: ${context.customNote || context.notes || "None"}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please generate the ${tone} follow-up email now.` }
    ],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate email from OpenAI.");
  }

  return JSON.parse(content);
}
