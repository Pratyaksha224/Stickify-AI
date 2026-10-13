/**
 * promptTemplates.js
 * Dedicated, purpose-built prompts for each AI feature.
 * Each function returns { system, user } ready for the AI client.
 */

export const writingAssistantPrompt = (text, action) => {
  const instructions = {
    improve:   'Improve the writing. Make it clearer, more engaging, and better structured.',
    summarize: 'Summarize this text concisely into 3-5 bullet points.',
    simplify:  'Simplify this text so it is easy to understand. Use plain, everyday language.',
    expand:    'Expand this text with more detail, context, and examples.',
    bullets:   'Convert this text into a clean, structured bullet point list.',
    grammar:   'Fix all grammatical errors and typos. Keep the original meaning completely intact.',
    rewrite:   'Rewrite this text to make it cleaner and more professional.',
  };
  return {
    system: `You are an expert writing assistant. ${instructions[action] || instructions.improve}
Respond ONLY with the result text. No explanations, no preamble, no "Here is..." intro.`,
    user: text,
  };
};

export const titleGeneratorPrompt = (text) => ({
  system: `You are a smart note-title generator. Generate one short, specific, descriptive title (3-7 words) for the given note.
Good examples: "HyperVerge Interview Preparation", "React Project Ideas", "July Sprint Meeting Notes", "Buy Groceries This Week".
Respond with ONLY the title — no quotes, no punctuation at the end, no explanation.`,
  user: text.slice(0, 800), // limit input length
});

export const categorizerPrompt = (text) => ({
  system: `Classify this note into exactly ONE category from this list:
Shopping, Travel, Meeting, College, Projects, Interview, Personal, Finance, Ideas, Health, Work, Learning, Other.
Respond with a JSON object only: {"category": "CategoryName", "confidence": 0.9}`,
  user: text.slice(0, 600),
});

export const taskExtractorPrompt = (text) => ({
  system: `Extract all actionable tasks from this note. Each task must be a clear, concrete action item.
Respond with a JSON object only: {"tasks": ["task description 1", "task description 2"]}
If no actionable tasks are found, return: {"tasks": []}
Do NOT include vague or descriptive phrases, only concrete actions.`,
  user: text.slice(0, 800),
});

export const priorityDetectorPrompt = (text) => ({
  system: `Analyze the urgency and priority of this note.
Consider: explicit deadlines, urgency words (tonight, ASAP, urgent, deadline, immediately), time sensitivity, importance.
Respond with a JSON object only: {"priority": "HIGH" | "MEDIUM" | "LOW", "reason": "one sentence reason"}`,
  user: text.slice(0, 600),
});

export const rewriteTonePrompt = (text, tone) => {
  const tones = {
    professional: 'professional and business-appropriate',
    formal:       'formal and polished, suitable for official communication',
    friendly:     'warm, conversational, and friendly in tone',
    concise:      'extremely concise — remove all filler words, keep only essential information',
    detailed:     'detailed and comprehensive, adding relevant context and explanation',
  };
  return {
    system: `Rewrite the following text in a ${tones[tone] || tones.professional} style.
Respond ONLY with the rewritten text. No intro, no explanation.`,
    user: text,
  };
};

export const smartSearchPrompt = (query) => ({
  system: `You help users find notes by expanding their search query.
Given a search term, return 6-8 related keywords, synonyms, and associated concepts.
Respond with a JSON object only: {"keywords": ["keyword1", "keyword2", ...]}`,
  user: query,
});

export const reminderDetectorPrompt = (text) => ({
  system: `Detect if this note contains a time-sensitive reminder, deadline, or scheduled event.
Look for: specific times, "tomorrow", "tonight", "today", "this week", exact dates, meeting schedules, deadlines.
Respond with JSON only:
{"hasReminder": true/false, "reminderText": "brief description of the reminder", "timeHint": "today|tomorrow|tonight|this week|null"}`,
  user: text.slice(0, 600),
});
