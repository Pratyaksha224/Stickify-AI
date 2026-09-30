import React, { useState } from 'react';
import { fakeData } from './assets/fakeData';
import NoteCard from './components/NoteCard';

function App() {
  const [notes, setNotes] = useState(fakeData);

  return (
    <div id="app">
      {notes.map(note => (
        <NoteCard key={note.$id} note={note} />
      ))}
    </div>
  );
}

export default App;
