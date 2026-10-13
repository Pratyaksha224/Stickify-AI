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
