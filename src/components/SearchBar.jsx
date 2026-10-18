import React, { useContext, useRef, useState, useEffect } from 'react';
import { NoteContext } from '../context/NoteContext';
import { expandSearchQuery } from '../services/aiService';
import Spinner from '../icons/Spinner';
import { Search, Sparkles } from "lucide-react";

const SearchBar = () => {
    const { searchQuery, setSearchQuery } = useContext(NoteContext);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiKeywords, setAiKeywords] = useState([]);
    const inputRef = useRef(null);
    const typingTimeout = useRef(null);

    // AI Semantic Expansion
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 3) {
            setAiKeywords([]);
            return;
        }

        if (typingTimeout.current) clearTimeout(typingTimeout.current);

        typingTimeout.current = setTimeout(async () => {
            setIsAiLoading(true);
            try {
                const keywords = await expandSearchQuery(searchQuery);
                setAiKeywords(keywords);
                // We'll pass this up via a custom event, or store it in context.
                // For a completely local approach, we can dispatch an event on window.
                window.dispatchEvent(new CustomEvent('ai-search-expanded', { detail: keywords }));
            } catch (err) {
                console.error("AI search failed", err);
            } finally {
                setIsAiLoading(false);
            }
        }, 800); // 800ms debounce
        
        return () => clearTimeout(typingTimeout.current);
    }, [searchQuery]);

    return (
        <div id="search-bar" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}><Search size={16} /></span>
            <input
                ref={inputRef}
                type="text"
                placeholder="Smart AI search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingRight: '30px' }}
            />
            {isAiLoading && (
                <div style={{ position: 'absolute', right: '10px' }}>
                    <Spinner size="16" color="#aaa" />
                </div>
            )}
            {aiKeywords.length > 0 && !isAiLoading && (
                <div 
                  style={{ position: 'absolute', right: '10px', fontSize: '12px', opacity: 0.6 }} 
                  title={`Expanded to: ${aiKeywords.join(', ')}`}
                >
                  <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> AI
                </div>
            )}
        </div>
    );
};

export default SearchBar;
