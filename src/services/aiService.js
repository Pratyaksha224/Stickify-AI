import { parseJsonSafe } from './parser';
import { 
  writingAssistantPrompt, 
  titleGeneratorPrompt, 
  categorizerPrompt,
  priorityDetectorPrompt, 
  rewriteTonePrompt 
} from './promptTemplates';

export const callGroq = async (systemInstruction, userPrompt, jsonMode = false) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error("Please add your Groq API key to the .env file.");
    }

    try {
        const bodyPayload = {
            model: "openai/gpt-oss-20b",
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: userPrompt }
            ],
            temperature: jsonMode ? 0.2 : 0.7,
        };

        if (jsonMode) {
            bodyPayload.response_format = { type: "json_object" };
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyPayload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Failed to fetch from Groq API");
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("AI Error:", error);
        throw error;
    }
};

// --- Writing Actions ---
export const improveWriting = async (text, action = 'improve') => {
    const { system, user } = writingAssistantPrompt(text, action);
    return await callGroq(system, user, false);
};

export const rewriteNote = async (text, tone = 'professional') => {
    const { system, user } = rewriteTonePrompt(text, tone);
    return await callGroq(system, user, false);
};

export const generateTitle = async (text) => {
    const { system, user } = titleGeneratorPrompt(text);
    const raw = await callGroq(system, user, false);
    return raw.trim().replace(/^"|"$/g, '');
};

export const categorizeNote = async (text) => {
    const { system, user } = categorizerPrompt(text);
    const raw = await callGroq(system, user, true);
    const data = parseJsonSafe(raw, { category: 'Other', confidence: 0 });
    return data.category || 'Other';
};

export const detectPriority = async (text) => {
    const { system, user } = priorityDetectorPrompt(text);
    const raw = await callGroq(system, user, true);
    const data = parseJsonSafe(raw, { priority: 'LOW', reason: '' });
    return data;
};
