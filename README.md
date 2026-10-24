# Stickify AI — Intelligent Notes & Knowledge Management Platform

> An AI-powered note-taking application that combines intelligent writing assistance, automatic organization, semantic search, and task extraction with secure per-user workspaces.

🚀 **Live Demo:** [https://stickify-ai.vercel.app](https://stickify-ai.vercel.app)

---

## 🤖 AI Features

- **AI Writing Assistant**: Improve, Summarize, Simplify, Expand, Convert to Bullets, Fix Grammar.
- **AI Title Generation**: Automatically predicts and assigns a relevant title to your notes (e.g., "React Project Ideas").
- **Automatic Note Categorization**: AI organizes your notes into intelligent categories (Shopping, Travel, Meeting, College, Projects, Interview, Personal, Finance, Ideas).
- **AI Action Item Extraction**: Automatically extracts concrete tasks from your notes into actionable checklists.
- **Smart Priority Detection**: AI detects urgency and marks notes as High, Medium, or Low priority.
- **AI Note Summarization**: Generates a concise summary panel at the bottom of long notes.
- **AI Rewrite**: Change note tone to Professional, Formal, Friendly, Concise, or Detailed.
- **Intelligent Search**: AI expands search queries with synonyms and semantic keywords (e.g. "internship" finds "Interview preparation" or "Resume updates").
- **Smart Reminders**: Automatically detects time-sensitive keywords ("tomorrow", "tonight") and sets up local reminder toasts.
- **AI Insights Dashboard**: A dedicated dashboard providing a statistical overview of your notes, completed tasks, and AI usage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Auth | Appwrite (Email/Password + Google OAuth2 Token Flow) |
| Cloud Storage | Appwrite Databases & Storage (Synced cloud collections, secure per-user rules) |
| AI | Groq API (llama-3.1-8b-instant) |
| Animations | Framer Motion |
| Prompting | Custom Prompt Templates & JSON Response Parsing |
| Icons | Lucide React |
| PWA | vite-plugin-pwa |

---

## AI Prompt Design

Stickify AI uses a dedicated `promptTemplates.js` service with purpose-built system prompts for each AI feature rather than a generic chat prompt. This ensures strict, structured JSON outputs for metadata extraction (tasks, priority, category, title) and high-quality tone rewrites.

---

## Architecture

```text
                  Stickify AI
                      React
                         │
                   Node.js API (Client Side execution)
                         │
                ┌────────┴────────┐
                │                 │
           Appwrite          Groq API
                │                 │
         Authentication      AI Assistant
                │                 │
          Appwrite DB       ┌─────┴──────────────┐
                            │                    │
                    Note Rewrite         Title Generator
                            │
                    Action Extraction
                            │
                    Auto Categorization
                            │
                     Summary Generator
                            │
                      Smart Search
                            │
                      React Dashboard
```

---

## Project Structure

```text
src/
  appwrite/
    databases.js             # Appwrite cloud database schema (notes, aiMeta, canvasImages, canvasShapes)
  components/
    AiAssistant.jsx          # AI Actions UI (Improve, Summarize, Rewrite)
    CategoryBadge.jsx        # AI generated category indicator
    PriorityIndicator.jsx    # AI generated priority status
    TaskList.jsx             # AI extracted actionable checklist
    SummaryPanel.jsx         # AI generated note summary
    SmartSearch.jsx          # AI enhanced semantic search
    ReminderToast.jsx        # AI detected upcoming reminders
    NoteCard.jsx             # Integrated canvas note component
  context/
    NoteContext.jsx          # Loads notes, shapes, images, and aiMeta
  pages/
    NotesPage.jsx            # Main workspace
    DashboardPage.jsx        # AI Insights dashboard
  services/
    aiService.js             # Groq LLM client & structured function calls
    promptTemplates.js       # Specialized system instructions
    parser.js                # Safe JSON fallback parsers
```

---

## Setup Instructions

1. Clone the repository.
2. Run `npm install`
3. Create a `.env` file in the root directory:
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
   VITE_DATABASE_ID=your_appwrite_database_id
   VITE_COLLECTION_NOTES_ID=notes
   VITE_COLLECTION_CANVAS_SHAPES_ID=canvasShapes
   VITE_COLLECTION_AIMETA_ID=aiMeta
   VITE_COLLECTION_IMAGES_ID=canvasImages
   VITE_BUCKET_IMAGES_ID=your_appwrite_bucket_id
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```
4. Start the development server on port 5174:
   ```bash
   npm run dev
   ```

---

## License

This project is licensed under the **MIT License**.

## Credits

Made with ❤️ by **Pratyaksha Sharma**
