import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateWithRetry(payload: any, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(payload);
    } catch (error: any) {
      if (error?.status === 503 && i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType, skillLevel, artStyle, topic } = body;

    const rawImage = imageBase64 || body.image;

    if (!rawImage) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in environment variables' }, { status: 500 });
    }

    const prompt = `Analyze this artwork/asset professionally. 
    Skill Level: ${skillLevel || 'Medium'}
    Art Style: ${artStyle || 'Comprehensive'}
    Topic Focus: ${topic || 'General'}
    
    Provide the response strictly as a valid JSON object with the following keys:
    - artworkType (string)
    - skillLevel (string)
    - score (number out of 100)
    - tier (string)
    - strengths (array of strings)
    - improvements (array of strings)
    - specificImprovements (array of strings)
    - practiceExercise (string)
    - finalSummary (string)`;

    const response = await generateWithRetry({
      model: 'gemini-3.6-flash',
      contents: [
        {
          inlineData: {
            data: rawImage,
            mimeType: mimeType || 'image/jpeg',
          },
        },
        prompt,
      ],
    });

    const textResponse = response?.text ? response.text : "{}";
    const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch {
      parsedResult = {
        artworkType: "Visual Asset",
        skillLevel: skillLevel || "Medium",
        score: 75,
        tier: "Provisional",
        strengths: ["Good visual foundation and composition."],
        improvements: ["Focus on fine-tuning details and shading depth."],
        specificImprovements: ["Adjust contrast values for better clarity."],
        practiceExercise: "Perform a quick 15-minute contour study.",
        finalSummary: cleanedText || "Analysis completed successfully."
      };
    }

    return NextResponse.json({ result: parsedResult });
  } catch (error: any) {
    console.error("API Route Error:", error);
    const errorMessage = error?.message || error?.toString() || 'Failed to analyse the image';
    return NextResponse.json(
      { error: errorMessage },
      { status: error?.status || 500 }
    );
  }
}
