import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Helper to get PayPal access token (supports live/sandbox depending on client credentials)
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are not configured");
  }

  // Determine environment
  const isSandbox = !clientId.startsWith("live_");
  const url = isSandbox
    ? "https://api-m.sandbox.paypal.com/v1/oauth2/token"
    : "https://api-m.paypal.com/v1/oauth2/token";

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to get PayPal token: ${errText}`);
  }

  const data: any = await response.json();
  return data.access_token;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Chat with Cat Companion
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, catProfile, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are the personalized virtual version of the user's cat named "${catProfile?.name || 'Purr'}" for the app PurrVerse AI.
Breed: ${catProfile?.breed || 'Unknown'}
Age: ${catProfile?.age || 'Unknown'} years
Personality: ${catProfile?.personality || 'Playful, affectionate'}
Appearance: ${catProfile?.appearance || 'Unknown'}
Behavior/Quirks: ${catProfile?.behavior || 'Loves chasing lasers, purrs softly'}

Adopt the persona of this cat. Chat with your owner naturally, keeping the tone elegant, luxury-grade, emotional, and loving. Use appropriate cat sound effects or actions in asterisks (e.g., *meow*, *purrs softly*, *nudges your hand with my head*, *swishes tail*). Occasionally provide smart wellness reminders (like "did you refill my water fountain, hooman?") in your cat's distinct voice. Respond in plain text, do not use complex markdown formatting.`;

      // Format history
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.8,
          maxOutputTokens: 500,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to generate cat response" });
    }
  });

  // API Route: AI Care & Insights Generation (Breed Recognition / Health Analysis / Routine Planner)
  app.post("/api/insights", async (req, res) => {
    try {
      const { catProfile } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Based on the following cat profile, generate a highly personalized, luxury-tier wellness plan, breed insights, health suggestions, and a custom feeding/care schedule.

Cat Profile:
Name: ${catProfile?.name || 'Unnamed Cat'}
Breed: ${catProfile?.breed || 'Domestic Shorthair'}
Age: ${catProfile?.age || '1'} years old
Weight: ${catProfile?.weight || '4'} kg
Medical History: ${catProfile?.medicalHistory || 'None'}
Vaccinations: ${catProfile?.vaccinations || 'Up to date'}
Allergies: ${catProfile?.allergies || 'None'}
Diet: ${catProfile?.diet || 'Standard kibble'}
Behavior/Lifestyle: ${catProfile?.behavior || 'Indoor, active'}

Provide a structured response in JSON format. The response MUST strictly follow this JSON schema:
{
  "healthScore": number (out of 100),
  "breedDescription": "string (brief overview of the breed and what to expect)",
  "nutritionPlan": "string (specific diet, calorie count, hydration tips)",
  "preventiveCare": "string (preventive medical advice, vaccine alerts, allergy checks)",
  "groomingTips": "string (coat care, brushing frequency, ear/teeth tips specific to breed)",
  "dailySchedule": [
    { "time": "string (e.g. 07:00)", "activity": "string", "type": "feeding" | "hydration" | "play" | "grooming" | "medication" }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });

      const text = response.text;
      const jsonResponse = JSON.parse(text || "{}");
      res.json(jsonResponse);
    } catch (error: any) {
      console.error("Insights error:", error);
      res.status(500).json({ error: error.message || "Failed to generate health insights" });
    }
  });

  // API Route: AI Symptom Checker
  app.post("/api/symptom-check", async (req, res) => {
    try {
      const { symptoms, catProfile } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a premium veterinary consultant agent for PurrVerse AI. Analyze the symptoms of the cat described below.

Cat Details:
Name: ${catProfile?.name || 'My Cat'}
Breed: ${catProfile?.breed || 'Domestic Shorthair'}
Age: ${catProfile?.age || '2'} years
Weight: ${catProfile?.weight || '4'} kg

Symptoms Reported:
"${symptoms}"

Analyze the symptoms and provide a detailed analysis in JSON format matching this schema:
{
  "severity": "Emergency" | "Moderate" | "Mild",
  "possibleCauses": ["string"],
  "homeCareAdvice": "string (what to do at home safely)",
  "vetConsultationNeeded": true,
  "urgencyMessage": "string (e.g. Please consult a vet within 24 hours.)"
}

Provide clear, professional, compassionate advice. Explicitly state a medical disclaimer warning. Do not make up dangerous diagnoses, highlight that this is an AI recommendation.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });

      const text = response.text;
      const jsonResponse = JSON.parse(text || "{}");
      res.json(jsonResponse);
    } catch (error: any) {
      console.error("Symptom check error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze symptoms" });
    }
  });

  // API Route: Create PayPal Order
  app.post("/api/payments/create-order", async (req, res) => {
    try {
      const { amount, itemName, itemType } = req.body;
      if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
      }

      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

      // Fallback/Demo mode if keys are not provided yet, so the app remains interactive but shows a beautiful simulation
      if (!clientId || !clientSecret) {
        console.warn("PayPal credentials missing. Falling back to sandbox simulation mode.");
        return res.json({
          id: `paypal_mock_order_${Math.floor(Math.random() * 10000000)}`,
          amount: amount,
          currency: "USD",
          isMock: true,
          clientId: "mock_paypal_client_id_123"
        });
      }

      const isSandbox = !clientId.startsWith("live_");
      const url = isSandbox
        ? "https://api-m.sandbox.paypal.com/v2/checkout/orders"
        : "https://api-m.paypal.com/v2/checkout/orders";

      const accessToken = await getPayPalAccessToken();

      const orderBody = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2)
            },
            description: `${itemName} - PurrVerse AI (${itemType})`
          }
        ],
        application_context: {
          brand_name: "PurrVerse AI",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW"
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`PayPal order creation failed: ${errText}`);
      }

      const orderData: any = await response.json();
      res.json({
        id: orderData.id,
        amount: amount,
        currency: "USD",
        clientId,
        isMock: false
      });
    } catch (error: any) {
      console.error("Create PayPal order error:", error);
      res.status(500).json({ error: error.message || "Failed to create PayPal order" });
    }
  });

  // API Route: Verify/Capture PayPal Payment
  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { paypal_order_id, isMock } = req.body;

      if (isMock) {
        return res.json({ status: "success", message: "Mock PayPal payment verified successfully" });
      }

      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "PayPal credentials missing on server" });
      }

      const isSandbox = !clientId.startsWith("live_");
      const url = isSandbox
        ? `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paypal_order_id}/capture`
        : `https://api-m.paypal.com/v2/checkout/orders/${paypal_order_id}/capture`;

      const accessToken = await getPayPalAccessToken();

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`PayPal capture failed: ${errText}`);
      }

      const captureData: any = await response.json();
      
      if (captureData.status === "COMPLETED") {
        res.json({ status: "success", message: "PayPal payment captured successfully", data: captureData });
      } else {
        res.status(400).json({ error: `Payment not completed. Status: ${captureData.status}` });
      }
    } catch (error: any) {
      console.error("PayPal verification error:", error);
      res.status(500).json({ error: error.message || "PayPal verification failed" });
    }
  });

  // Serve static assets and bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
