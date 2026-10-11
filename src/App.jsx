import React from 'react';
import NotesPage from './pages/NotesPage';
import NotesProvider from './context/NoteContext';

function App() {
  return (
    <NotesProvider>
      <NotesPage />
    </NotesProvider>
  );
}

export default App;
