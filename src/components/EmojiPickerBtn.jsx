import { useEffect, useRef, useState, useMemo } from 'react';

// Full Unicode emoji dataset organized by category
const EMOJI_DATA = {
  'Smileys & People': [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇',
    '🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝',
    '🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄',
    '😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧',
    '🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟',
    '🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢',
    '😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬',
    '😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺',
    '😸','😹','😻','😼','😽','🙀','😿','😾','👋','🤚','🖐️','✋','🖖',
    '👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇',
    '☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏',
    '✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁',
    '🧠','🦷','🦴','👀','👁️','👅','👄','💋','👶','🧒','👦','👧','🧑',
    '👱','👨','🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋',
    '🧏','🙇','🤦','🤷','👮','🕵️','💂','🥷','👷','🤴','👸','👲','🧕',
  ],
  'Animals & Nature': [
    '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷',
    '🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥',
    '🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞',
    '🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐',
    '🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆',
    '🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃',
    '🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺',
    '🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝',
    '🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔','🌵','🎄','🌲','🌳',
    '🌴','🪵','🌱','🌿','☘️','🍀','🎍','🪴','🎋','🍃','🍂','🍁','🍄',
    '🐚','🪸','🌾','💐','🌷','🌹','🥀','🪷','🌺','🌸','🌼','🌻','🌞',
    '🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙',
    '🌟','⭐','🌠','🌌','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️',
    '🌨️','❄️','☃️','⛄','🌬️','💨','💧','💦','🌊','🌈','🌂','☂️','🌫️',
  ],
  'Food & Drink': [
    '🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭',
    '🍍','🥥','🥝','🍅','🍆','🥑','🫒','🥦','🥬','🥒','🌶️','🫑','🥑',
    '🌽','🥕','🫛','🧄','🧅','🥔','🍠','🫘','🥜','🌰','🍞','🥐','🥖',
    '🫓','🥨','🥯','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖',
    '🦴','🌭','🍔','🍟','🍕','🫔','🌮','🌯','🥙','🧆','🥚','🍜','🍝',
    '🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🧁',
    '🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🧃',
    '🥤','🧋','🍵','☕','🫖','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉',
    '🍾','🧊','🥄','🍴','🍽️','🥢','🧂','🫙','🥡','🫕',
  ],
  'Travel & Places': [
    '🚀','🛸','🛩️','✈️','🚁','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉',
    '🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕',
    '🚖','🚗','🚘','🚙','🛻','🚚','🚛','🚜','🏎️','🏍️','🛵','🛺','🚲',
    '🛴','🛹','🛼','🚏','🛣️','🛤️','⛽','🚧','⚓','⛵','🚤','🛥️','🛳️',
    '⛴️','🚢','🗺️','🧭','🏔️','⛰️','🌋','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️',
    '🏛️','🏗️','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩',
    '🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍',
    '⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','♨️',
    '🎠','🎡','🎢','💈','🎪','🗾','🎑','🌐','🗿','🗺️','🧳','🌍','🌎','🌏',
  ],
  'Activities': [
    '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒',
    '🏑','🥍','🏏','🪃','🥅','⛳','🎣','🤿','🥊','🥋','🎽','🛹','🛷',
    '⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🤾','🏌️',
    '🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉',
    '🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🎨','🖼️','🎰','🎲',
    '♟️','🎯','🎳','🎮','🎲','🎸','🎹','🎺','🎻','🥁','🪘','🎷','🎤',
    '🎧','📻','🎼','🎵','🎶','🎙️','🎚️','🎛️','📯','🔔','🔕','🎴','🃏',
    '🀄','🎭','🎪','🎨','🖌️','🖍️','📝','✏️',
  ],
  'Objects': [
    '⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾',
    '💿','📀','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺',
    '📻','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🪫','🔌','💡',
    '🔦','🕯️','🪔','🧯','🛢️','💰','💴','💵','💶','💷','🪙','💸','💳',
    '🪪','💹','📈','📉','📊','📋','🗒️','🗓️','📆','📅','📇','🗃️','🗳️',
    '🗄️','🗑️','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘',
    '📙','📚','📖','🔖','🏷️','💰','🔑','🗝️','🔨','🪓','⛏️','⚒️','🛠️',
    '🗡️','⚔️','🛡️','🔧','🪛','🔩','⚙️','🗜️','🔗','⛓️','🪝','🧲','🔫',
    '💊','🩺','🩹','🩻','🧬','🦠','🧪','🧫','🌡️','🧹','🧺','🧻','🚽',
    '🚿','🛁','🧴','🧷','🧸','🪆','🖼️','🧧','🎁','🎀','🎊','🎉','🎈',
  ],
  'Symbols': [
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞',
    '💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯',
    '🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐',
    '♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸',
    '🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️',
    '🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢',
    '♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️',
    '⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹',
    '❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈂️',
    '🛂','🛃','🛄','🛅','🚹','🚺','🚼','🚻','🚮','🎦','📶','🈁','🔣',
    'ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣',
    '3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','▶️',
    '⏸️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️',
    '⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️',
    '🔀','🔁','🔂','🔃','🎵','🎶','➕','➖','➗','✖️','♾️','💲','💱','™️',
    '©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔜','🔝','✔️','☑️','🔘',
    '🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔷','🔶',
    '🔹','🔸','▪️','▫️','◾','◽','◼️','◻️','⬛','⬜','🟥','🟧','🟨',
    '🟩','🟦','🟪','⭐','🌟','💫','✨','🌈','🔆','🎆','🎇','🧨','🎑',
  ],
  'Flags': [
    '🏳️','🏴','🏴‍☠️','🏳️‍🌈','🏳️‍⚧️','🚩','🏁','🎌','🏴󠁧󠁢󠁥󠁮󠁧󠁿','🏴󠁧󠁢󠁳󠁣󠁴󠁿','🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    '🇦🇫','🇦🇱','🇩🇿','🇦🇩','🇦🇴','🇦🇬','🇦🇷','🇦🇲','🇦🇺','🇦🇹','🇦🇿','🇧🇸',
    '🇧🇭','🇧🇩','🇧🇧','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷',
    '🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇨🇻','🇰🇭','🇨🇲','🇨🇦','🇨🇫','🇹🇩','🇨🇱','🇨🇳',
    '🇨🇴','🇰🇲','🇨🇩','🇨🇬','🇨🇷','🇨🇮','🇭🇷','🇨🇺','🇨🇾','🇨🇿','🇩🇰','🇩🇯',
    '🇩🇲','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇸🇿','🇪🇹','🇫🇯','🇫🇮',
    '🇫🇷','🇬🇦','🇬🇲','🇬🇪','🇩🇪','🇬🇭','🇬🇷','🇬🇩','🇬🇹','🇬🇳','🇬🇼','🇬🇾',
    '🇭🇹','🇭🇳','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇱','🇮🇹','🇯🇲',
    '🇯🇵','🇯🇴','🇰🇿','🇰🇪','🇰🇮','🇽🇰','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸',
    '🇱🇷','🇱🇾','🇱🇮','🇱🇹','🇱🇺','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇭',
    '🇲🇷','🇲🇺','🇲🇽','🇫🇲','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇦','🇲🇿','🇲🇲','🇳🇦',
    '🇳🇷','🇳🇵','🇳🇱','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇳🇴','🇴🇲','🇵🇰','🇵🇼','🇵🇸',
    '🇵🇦','🇵🇬','🇵🇾','🇵🇪','🇵🇭','🇵🇱','🇵🇹','🇶🇦','🇷🇴','🇷🇺','🇷🇼','🇰🇳',
    '🇱🇨','🇻🇨','🇼🇸','🇸🇲','🇸🇹','🇸🇦','🇸🇳','🇷🇸','🇸🇨','🇸🇱','🇸🇬','🇸🇰',
    '🇸🇮','🇸🇧','🇸🇴','🇿🇦','🇸🇸','🇪🇸','🇱🇰','🇸🇩','🇸🇷','🇸🇪','🇨🇭','🇸🇾',
    '🇹🇼','🇹🇯','🇹🇿','🇹🇭','🇹🇱','🇹🇬','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇺🇬',
    '🇺🇦','🇦🇪','🇬🇧','🇺🇸','🇺🇾','🇺🇿','🇻🇺','🇻🇪','🇻🇳','🇾🇪','🇿🇲','🇿🇼',
  ],
};

const CATEGORIES = Object.keys(EMOJI_DATA);
const CATEGORY_ICONS = {
  'Smileys & People': '😊',
  'Animals & Nature': '🐶',
  'Food & Drink': '🍎',
  'Travel & Places': '🚀',
  'Activities': '⚽',
  'Objects': '💡',
  'Symbols': '❤️',
  'Flags': '🏳️',
};

const EmojiPickerBtn = ({ onSelect, toolbarColor }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const containerRef = useRef(null);
  const savedRangeRef = useRef(null); // saves cursor position before picker opens

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filteredEmojis = useMemo(() => {
    if (!search.trim()) return null; // null means show by category
    const q = search.toLowerCase();
    // Simple search: just show all emojis and filter (we don't have names, so return all from matching category name or all)
    return Object.entries(EMOJI_DATA).flatMap(([cat, emojis]) =>
      cat.toLowerCase().includes(q) ? emojis : []
    ).slice(0, 80);
  }, [search]);

  const displayEmojis = filteredEmojis || EMOJI_DATA[activeCategory] || [];

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        title="Insert Emoji"
        onMouseDown={e => {
          e.preventDefault(); // keep editor focus
          // Save the current selection BEFORE the picker opens / focus shifts
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
          }
        }}
        onClick={() => setOpen(v => !v)}
        style={{
          background: open ? 'rgba(140,100,255,0.2)' : 'transparent',
          border: open ? '1px solid rgba(140,100,255,0.5)' : '1px solid transparent',
          borderRadius: '6px',
          padding: '2px 6px',
          cursor: 'pointer',
          fontSize: '14px',
          color: toolbarColor || 'inherit',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          lineHeight: 1.2,
          transition: 'all 0.15s',
        }}
      >
        😊 Emoji
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            zIndex: 9999,
            width: '320px',
            background: '#1e1e2e',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          // Prevent ANY click inside picker from stealing editor focus
          onMouseDown={e => e.preventDefault()}
        >
          {/* Search */}
          <div style={{ padding: '10px 10px 4px' }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search emojis..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '7px 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Category tabs */}
          {!search && (
            <div style={{
              display: 'flex',
              gap: '2px',
              padding: '4px 8px',
              overflowX: 'auto',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  title={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    background: activeCategory === cat ? 'rgba(140,100,255,0.35)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '4px 6px',
                    cursor: 'pointer',
                    fontSize: '17px',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {CATEGORY_ICONS[cat]}
                </button>
              ))}
            </div>
          )}

          {/* Emoji grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '2px',
            padding: '8px',
            maxHeight: '240px',
            overflowY: 'auto',
          }}>
            {displayEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => { onSelect(emoji, savedRangeRef.current); setOpen(false); }}
                title={emoji}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '4px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  lineHeight: 1,
                  transition: 'background 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {emoji}
              </button>
            ))}
            {search && displayEmojis.length === 0 && (
              <div style={{ gridColumn: '1/-1', color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                No emojis found for "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPickerBtn;
