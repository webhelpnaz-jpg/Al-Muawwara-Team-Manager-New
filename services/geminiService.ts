
import { GoogleGenAI } from "@google/genai";
import { DashboardStats, Team } from "../types";

// Always initialize the client using the direct process.env.API_KEY in a named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAttendanceInsights = async (stats: DashboardStats, topTeams: Team[]): Promise<string> => {
  // Directly use the GenAI client without manual environment variable checks or logic.
  try {
    const prompt = `
      Analyze the following school sports statistics for Al Munawwara School Teams:
      - Total Players: ${stats.totalPlayers}
      - Active Teams: ${stats.activeTeams}
      - Today's Attendance Check-ins: ${stats.attendanceToday}
      - Upcoming Events: ${stats.upcomingEvents}
      - Top Performing Teams (Activity): ${topTeams.map(t => t.name).join(', ')}

      Provide a 3-sentence executive summary for the Principal highlighting participation trends and one suggestion for improvement. Keep it professional and encouraging.
    `;

    // Use ai.models.generateContent to query with the selected model and content prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // The .text property is a direct property of the response object, not a method.
    return response.text || "No insights available at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights due to a network or configuration error.";
  }
};
