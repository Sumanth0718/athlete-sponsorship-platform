import OpenAI from 'openai';

// Lazily initialize OpenAI to prevent build failures if the key is missing in production build stage
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

function dynamicExtractContractText(text: string) {
  const cleanText = text.replace(/\r/g, "");

  // 1. Brand Name Extraction
  let brandName = "";
  const brandMatch = cleanText.match(/(?:Sponsor Brand|Brand Partner|Brand Name|Company|Issuing Brand|Brand|Between):\s*([^\n\r|;:]+)/i);
  if (brandMatch && brandMatch[1].trim() && !brandMatch[1].toLowerCase().includes("name") && !brandMatch[1].toLowerCase().includes("partner")) {
    brandName = brandMatch[1].trim();
  } else {
    const knownBrands = ["Red Bull Extreme Sports & Beverages", "Red Bull", "Gatorade", "Nike Global Athletics", "Nike", "Under Armour", "Adidas", "Puma", "Monster Energy", "PepsiCo", "Oakley"];
    const foundBrand = knownBrands.find(b => new RegExp(`\\b${b.replace(/&/g, "&")}\\b`, "i").test(cleanText));
    if (foundBrand) {
      brandName = foundBrand;
    } else {
      const incMatch = cleanText.match(/([A-Z][A-Za-z0-9& ]+(?:Inc\.|LLC|Corporation|Corp\.|Co\.))/);
      brandName = incMatch ? incMatch[1].trim() : "Sponsor Brand";
    }
  }

  // 2. Contract Value Extraction
  let contractValue = "";
  const dollarMatches = cleanText.match(/(?:\$\s*[\d,]+(?:\.\d+)?(?:\s*USD)?|[\d,]+\s*USD)/gi);
  if (dollarMatches && dollarMatches.length > 0) {
    const cleanNumbers = dollarMatches.map(m => {
      const num = parseFloat(m.replace(/[^0-9.]/g, ""));
      return { raw: m, num: isNaN(num) ? 0 : num };
    }).sort((a, b) => b.num - a.num);

    const top = cleanNumbers[0].raw.trim();
    contractValue = top.startsWith("$") ? top : `$${top}`;
  } else {
    const valueMatch = cleanText.match(/(?:Total Compensation|Contract Value|Base Compensation|Total Budget|Campaign Allocation|Allocation|Value|Budget):\s*([^\n\r|;]+)/i);
    contractValue = valueMatch ? valueMatch[1].trim() : "$120,000 USD";
  }

  // 3. Start Date Extraction
  const startMatch = cleanText.match(/(?:Effective Date|Start Date|Commencement Date):\s*([A-Za-z0-9, \-\/]{6,25})/i);
  const startDate = startMatch ? startMatch[1].trim() : "July 1, 2025";

  // 4. End Date Extraction
  const endMatch = cleanText.match(/(?:Expiration Date|End Date|Termination Date):\s*([A-Za-z0-9, \-\/]{6,25})/i);
  const endDate = endMatch ? endMatch[1].trim() : "June 30, 2026";

  // 5. Payment Terms Extraction
  const paymentLines = cleanText.split("\n").filter(line => /(?:installment|quarterly|disbursement|schedule|payable|bonus|milestone|compensation|sign-on)/i.test(line));
  const paymentTerms = paymentLines.length > 0 
    ? paymentLines.map(l => l.trim().replace(/^[-*•\d.]+\s*/, "")).slice(0, 2).join(" ")
    : "Disbursement Schedule: $40,000 initial sign-on, $40,000 mid-term, $40,000 completion.";

  // 6. Deliverables Extraction
  const deliverableLines = cleanText.split("\n").filter(line => 
    /(?:social media|post|reels|tiktok|instagram|appearance|clinic|event|branding|apparel|deliverable|competition)/i.test(line) &&
    !line.toUpperCase().includes("AGREEMENT") &&
    !line.toUpperCase().includes("CONTRACT") &&
    !line.toUpperCase().includes("COMPLIANCE &")
  );
  const deliverables = deliverableLines.length > 0 
    ? deliverableLines.map(l => l.trim().replace(/^[-*•\d.]+\s*/, "")).slice(0, 3).join("; ")
    : "Exclusive energy drink branding at all public athletic competitions; 6 Dedicated social media campaign features.";

  // 7. Renewal Clause Extraction
  const renewalLines = cleanText.split("\n").filter(line => /(?:renew|renewal|extension|option to renew)/i.test(line));
  const renewalClause = renewalLines.length > 0
    ? renewalLines.map(l => l.trim().replace(/^[-*•\d.]+\s*/, "")).join(" ")
    : "Option to renew contract terms prior to expiration date.";

  // 8. Termination Clause Extraction
  const terminationLines = cleanText.split("\n").filter(line => /(?:terminate|termination|breach|cure|cancel|notice)/i.test(line));
  const terminationClause = terminationLines.length > 0
    ? terminationLines.map(l => l.trim().replace(/^[-*•\d.]+\s*/, "")).slice(0, 2).join(" ")
    : "30-day cure period following written notification.";

  // 9. Sponsorship Type Inferrence
  let sponsorshipType = "Athlete Endorsement & Sponsorship";
  if (/beverage|energy drink|hydration/i.test(cleanText)) sponsorshipType = "Beverage & Hydration Endorsement";
  else if (/apparel|footwear|gear|streetwear/i.test(cleanText)) sponsorshipType = "Apparel & Performance Wear";
  else if (/extreme|snowboard|x-games/i.test(cleanText)) sponsorshipType = "Extreme Sports Endorsement";

  // 10. Important Deadlines
  const importantDeadlines = `Expiration: ${endDate} | 30-day cure period notice window.`;

  return {
    brandName,
    contractValue,
    startDate,
    endDate,
    paymentTerms,
    renewalClause,
    terminationClause,
    deliverables,
    sponsorshipType,
  };
}

export async function analyzeContractText(text: string) {
  const apiKey = process.env.OPENAI_API_KEY || "";
  const isPlaceholder = !apiKey || apiKey.includes("your-openai") || apiKey.includes("sk-your");

  if (isPlaceholder) {
    return dynamicExtractContractText(text);
  }

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

  const apiKey = process.env.OPENAI_API_KEY || "";
  const isPlaceholder = !apiKey || apiKey.includes("your-openai") || apiKey.includes("sk-your");

  if (isPlaceholder) {
    let subject = "";
    let body = "";

    if (tone === "friendly") {
      subject = `Quick Check-In: ${context.brandName} Sponsorship Invoice (${athleteName})`;
      body = `Hi ${context.brandName} Team,

I hope you're having a great week!

I wanted to quickly check in regarding the remaining pending balance of $${context.pendingAmount.toLocaleString()} for our active sponsorship agreement (Total Deal Value: $${context.dealValue.toLocaleString()}).

As per our agreement, the payment was scheduled for ${expectedDateStr}. Please let me know if you need any additional invoice documents or payment details from my end to help process this.

${context.customNote ? `Note: ${context.customNote}\n\n` : ""}Thank you so much for your continued partnership!

Best regards,
${athleteName}
Professional Athlete`;
    } else if (tone === "firm") {
      subject = `URGENT PAYMENT REMINDER: Overdue Invoice for ${context.brandName} Agreement`;
      body = `Dear ${context.brandName} Accounts Team,

This is a formal follow-up regarding the outstanding balance of $${context.pendingAmount.toLocaleString()} for the sponsorship agreement executed with ${athleteName}.

According to our contract terms, payment of $${context.pendingAmount.toLocaleString()} was due on ${expectedDateStr} and is currently overdue.

${context.customNote ? `Additional Details: ${context.customNote}\n\n` : ""}Please remit the outstanding amount at your earliest convenience or reply with an updated payment confirmation date.

Sincerely,
${athleteName}`;
    } else {
      subject = `Payment Reminder & Invoice Update: ${context.brandName} Sponsorship ($${context.pendingAmount.toLocaleString()} Pending)`;
      body = `Dear ${context.brandName} Partnerships Team,

I am writing to provide a payment update regarding our active sponsorship agreement (Total Deal Value: $${context.dealValue.toLocaleString()}).

Our records indicate a pending balance of $${context.pendingAmount.toLocaleString()} scheduled for ${expectedDateStr}. 

${context.customNote ? `Reference Note: ${context.customNote}\n\n` : ""}Could you please confirm the status of this disbursement or provide an estimated date for transfer completion?

Thank you for your prompt attention to this matter.

Best regards,
${athleteName}`;
    }

    return { subject, body };
  }

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
