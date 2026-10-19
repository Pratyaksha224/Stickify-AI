import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import NotesPage from "./pages/NotesPage";
import DashboardPage from "./pages/DashboardPage";
import NotesProvider from "./context/NoteContext";

function App() {
  return (
    <Router>
      <NotesProvider>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<NotesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </AnimatePresence>
      </NotesProvider>
    </Router>
  );
}

export default App;
