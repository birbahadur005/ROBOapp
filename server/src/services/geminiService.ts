import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../prisma/client';
import { config } from '../config';

export class GeminiService {
  private static genAI: GoogleGenerativeAI | null = config.geminiApiKey
    ? new GoogleGenerativeAI(config.geminiApiKey)
    : null;

  /**
   * Fetches real-time college data to ground the AI model with 100% accurate facts
   */
  private static async getCollegeContext(): Promise<string> {
    const settings = await prisma.applicationSettings.findUnique({
      where: { id: 'default' }
    });

    const departments = await prisma.department.findMany({
      include: {
        authorities: {
          select: {
            name: true,
            designation: true,
            officeLocation: true,
            visitingHours: true,
            isAcceptingAppointments: true
          }
        }
      }
    });

    const info = await prisma.collegeInformation.findMany({
      where: { isActive: true }
    });

    const locations = await prisma.campusLocation.findMany();

    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      take: 5
    });

    let context = `COLLEGE IDENTITY:
- College Name: ${settings?.collegeName || config.defaultCollegeName}
- Tagline: ${settings?.tagline || config.defaultTagline}

DEPARTMENTS & AUTHORITIES:
`;

    for (const d of departments) {
      context += `- Department: ${d.name} (${d.code}). Office: ${d.officeLocation || 'Main Block'}, Contact: ${d.contactPhone || 'N/A'}, Email: ${d.contactEmail || 'N/A'}\n`;
      if (d.authorities.length > 0) {
        context += `  Authorities in ${d.name}:\n`;
        for (const a of d.authorities) {
          context += `    * ${a.name} (${a.designation}) - Office: ${a.officeLocation} - Status: ${a.isAcceptingAppointments ? 'Accepting Appointments' : 'Unavailable'}\n`;
        }
      }
    }

    context += `\nCOLLEGE KNOWLEDGE BASE & NOTICES:\n`;
    for (const item of info) {
      context += `[${item.category}] ${item.title}: (EN) ${item.contentEn} | (HI) ${item.contentHi}\n`;
    }

    context += `\nCAMPUS LOCATIONS & ROOMS:\n`;
    for (const loc of locations) {
      context += `- ${loc.name} (${loc.category}): Code ${loc.locationCode}, Floor/Room: ${loc.floorInfo || 'Ground Floor'}, Details: ${loc.description || 'N/A'}\n`;
    }

    if (announcements.length > 0) {
      context += `\nACTIVE ANNOUNCEMENTS:\n`;
      for (const ann of announcements) {
        context += `- [${ann.priority}] ${ann.title}: ${ann.description}\n`;
      }
    }

    return context;
  }

  /**
   * Responds to user queries grounded strictly on the college knowledge base
   */
  public static async askAssistant(userQuery: string, preferredLanguage = 'en'): Promise<string> {
    const fallbackMessage = preferredLanguage === 'hi'
      ? 'माफ़ कीजिए, मेरे पास यह जानकारी उपलब्ध नहीं है। कृपया मुख्य रिसेप्शन डेस्क से संपर्क करें।'
      : 'I am sorry, I do not have that information. Please contact the main reception desk.';

    if (!config.geminiApiKey || !this.genAI) {
      // Intelligent local keyword search fallback if GEMINI_API_KEY is not configured yet
      return this.localSearchFallback(userQuery, preferredLanguage);
    }

    try {
      const collegeContext = await this.getCollegeContext();
      const model = this.genAI.getGenerativeModel({ model: config.geminiModel || 'gemini-1.5-flash' });

      const systemPrompt = `You are the official digital AI Receptionist for the college.
Strict Instructions:
1. ONLY answer questions using the provided COLLEGE DATA below.
2. DO NOT hallucinate, guess, or fabricate any facts, people, phone numbers, or locations.
3. If the user asks something not covered in the data, strictly reply with: "${fallbackMessage}"
4. If a visitor says they want to meet an authority (e.g. "I want to meet the Director" or "Principal se milna hai"), guide them clearly to click the "Meet an Authority" button on the screen to request an appointment.
5. Support English, Hindi, and Hinglish naturally based on what language the visitor speaks.
6. Keep your answers concise, warm, helpful, and polite suitable for a receptionist display.

COLLEGE DATA:
${collegeContext}`;

      const chat = model.startChat({
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemPrompt }]
        }
      });

      const result = await chat.sendMessage(userQuery);
      const responseText = result.response.text();
      return responseText.trim();
    } catch (err: any) {
      console.error('Gemini API query error:', err.message);
      return this.localSearchFallback(userQuery, preferredLanguage);
    }
  }

  /**
   * Local rule-based fallback when offline or no API key is provided
   */
  private static async localSearchFallback(query: string, lang = 'en'): Promise<string> {
    const q = query.toLowerCase();

    if (q.includes('meet') || q.includes('milna') || q.includes('appointment') || q.includes('principal') || q.includes('director')) {
      return lang === 'hi'
        ? 'किसी अधिकारी से मिलने के लिए कृपया मुख्य स्क्रीन पर "अधिकारी से मिलें" (Meet an Authority) बटन दबाएँ और अपना अपॉइंटमेंट दर्ज करें।'
        : 'To meet an authority or schedule a visit, please click on the "Meet an Authority" button on the main screen.';
    }

    if (q.includes('admission') || q.includes('दाखिला')) {
      const item = await prisma.collegeInformation.findFirst({
        where: { category: 'ADMISSION', isActive: true }
      });
      if (item) {
        return lang === 'hi' ? item.contentHi : item.contentEn;
      }
    }

    if (q.includes('exam') || q.includes('परीक्षा')) {
      const item = await prisma.collegeInformation.findFirst({
        where: { category: 'EXAMINATION', isActive: true }
      });
      if (item) {
        return lang === 'hi' ? item.contentHi : item.contentEn;
      }
    }

    return lang === 'hi'
      ? 'माफ़ कीजिए, मेरे पास यह जानकारी उपलब्ध नहीं है। कृपया मुख्य रिसेप्शन डेस्क से संपर्क करें।'
      : 'I am sorry, I do not have that information. Please contact the main reception desk.';
  }
}
