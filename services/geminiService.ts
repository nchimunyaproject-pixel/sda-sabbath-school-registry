import { GoogleGenAI } from "@google/genai";
import { Announcement } from "../types";

const getApiKey = (): string => {
  return (import.meta.env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && process.env?.API_KEY) || '') as string;
};

/**
 * Summarizes church class announcements using Gemini.
 */
export const summarizeAnnouncements = async (announcements: Announcement[]): Promise<string> => {
  if (announcements.length === 0) return "No announcements submitted for this Sabbath.";

  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const prompt = `
      You are the Church Clerk's assistant for an SDA church. 
      Please compile the following class reports into a professional, concise summary for the pulpit.
      
      Requirements:
      1. Group by class name.
      2. Highlight testimonies, prayer requests, and visitor welcomes.
      3. Use a tone of spiritual encouragement.
      4. If visitors are mentioned, ensure they are specifically noted for a warm welcome.

      Submissions:
      ${announcements.map(a => `[${a.className} - Teacher ${a.teacherName}]: ${a.content}`).join('\n')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert administrative assistant for a Seventh-day Adventist Church. Your goal is to summarize diverse class reports into a single, cohesive pulpit report for the Church Clerk.",
      }
    });

    return response.text || "The summary was generated but appeared empty. Please review raw submissions.";
  } catch (error) {
    console.error("Gemini Summarization Error:", error);
    return "The AI summary service is currently adjusting. Please use the raw 'Teacher Submissions' list below for the report.";
  }
};

/**
 * Generates leadership insights based on attendance and visitor trends.
 */
export const generateAttendanceInsight = async (stats: {
  totalRecords: number;
  averageAttendance: number;
  lessonParticipation: number;
  visitorEngagement: number;
}): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const prompt = `
      Analyze this Sabbath session data and provide 2 bullet points of spiritual insight or strategic encouragement.
      
      Current Stats:
      - Average Attendance: ${(stats.averageAttendance * 100).toFixed(1)}%
      - Lesson Study Participation: ${stats.lessonParticipation.toFixed(1)}%
      - Visitors Today: ${stats.visitorEngagement}

      Focus on growth, visitor retention, and spiritual depth. Keep it brief.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return response.text || "Continue the good work in the vineyard.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Attendance data is recorded. Focus on nurturing the flock and welcoming guests.";
  }
};