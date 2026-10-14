/**
 * parser.js
 * Helpers for parsing AI JSON responses robustly.
 */

export const parseJsonSafe = (rawText, defaultFallback = {}) => {
  if (!rawText) return defaultFallback;
  
  try {
    // Attempt direct parse first
    return JSON.parse(rawText);
  } catch (err) {
    // If that fails, try to extract JSON from markdown code blocks
    try {
      const match = rawText.match(/```(?:json)?\n([\s\S]*?)\n```/i);
      if (match && match[1]) {
        return JSON.parse(match[1]);
      }
      
      // Try to find anything that looks like { ... }
      const curlyMatch = rawText.match(/\{[\s\S]*\}/);
      if (curlyMatch && curlyMatch[0]) {
        return JSON.parse(curlyMatch[0]);
      }
    } catch (fallbackErr) {
      console.warn("Failed to parse AI JSON response:", rawText);
    }
  }
  
  return defaultFallback;
};
