export default function ProfileCard({ profile }) {
  if (!profile) return null;

  const firstTextElement = profile.elements.find(e => e.type === "text");
  const remainingElements = profile.elements.filter(e => e !== firstTextElement);

  const ZODIAC = {
    aries: "♈️", taurus: "♉️", gemini: "♊️", cancer: "♋️", leo: "♌️", virgo: "♍️",
    libra: "♎️", scorpio: "♏️", sagittarius: "♐️", capricorn: "♑️", aquarius: "♒️", pisces: "♓️"
  };

  function getGenderEmoji(word) {
    if(/man|male/i.test(word)) return "👨";
    if(/woman|female/i.test(word)) return "👩";
    return "🧑";
  }
  function getOrientationEmoji(word) {
    if (/straight/i.test(word)) return "🧑‍🤝‍🧑";
    if (/bi/i.test(word)) return "👨‍👩‍👧";
    if (/gay|lesbian/i.test(word)) return "🏳️‍🌈";
    return "";
  }
  function getPetEmoji(word) {
    if (/dog/i.test(word)) return "🐕";
    if (/cat/i.test(word)) return "🐈";
    return "";
  }

  function formatDetails(details) {
    if (!details) return null;
    const lines = details.split('\n').filter(x => x.trim() !== '');
    if (!lines.length) return null;

    // --- Handle the first summary line ---
    const summaryLine = lines[0];
    let tokens = summaryLine.split('\t');
    if (tokens.length <= 1) tokens = summaryLine.split(/ +/);
    tokens = tokens.filter((t) => t.trim() !== '');

    const summary = [];
    tokens.forEach((word, i) => {
      let chunk = word.trim();
      if (!chunk) return;

      // Age
      if (/^\d{2,3}$/.test(chunk)) {
        summary.push(<span key={'age'}>🎂 {chunk} </span>);
        return;
      }
      // Gender
      if (/^(man|male|woman|female)$/i.test(chunk)) {
        summary.push(<span key={'gender'}>{getGenderEmoji(chunk)} {chunk} </span>);
        return;
      }
      // Orientation
      if (/^(straight|bi|gay|lesbian)$/i.test(chunk)) {
        summary.push(<span key={'ori'}>{getOrientationEmoji(chunk)} {chunk} </span>);
        return;
      }
      // Height (e.g. 6’1”)
      if (/^\d{1}([’']|\u2019)\d{1,2}("|”)?$/u.test(chunk) || /^\d{1,3}cm$/.test(chunk)) {
        summary.push(<span key={'height'+i}>📏 {chunk} </span>);
        return;
      }
      // Pet
      if (/^(dog|cat)$/i.test(chunk)) {
        summary.push(<span key={'pet'}>{getPetEmoji(chunk)} {chunk} </span>);
        return;
      }
      // Zodiac
      if (ZODIAC[chunk.toLowerCase()]) {
        summary.push(<span key={'zodiac'}>{ZODIAC[chunk.toLowerCase()]} {chunk} </span>);
        return;
      }
      // Drink
      if (/no\(to drink\)/i.test(chunk)) {
        summary.push(<span key={'drink'}>🍺 no </span>);
        return;
      }
      if (/drink/i.test(chunk)) {
        summary.push(<span key={'drink'}>🍺 yes </span>);
        return;
      }
      // Smoke
      if (/no\(to smoke\)/i.test(chunk)) {
        summary.push(<span key={'smoke'}>🚬 no </span>);
        return;
      }
      if (/smoke/i.test(chunk)) {
        summary.push(<span key={'smoke'}>🚬 yes </span>);
        return;
      }
      // Fallback
      summary.push(<span key={i}>{chunk} </span>);
    });

    return (
      <div>
        <div style={{ fontSize: '0.99em', opacity: 0.85, marginBottom: 6 }}>
          {summary}
        </div>
        {lines.slice(1).map((line, idx) => {
          let l1 = line.trim();
          if (l1.startsWith("Work")) l1 = l1.replace("Work –", "💼");
          else if (l1.startsWith("College")) l1 = l1.replace("College –", "🎓");
          else if (l1.startsWith("Religion")) l1 = l1.replace("Religion –", "🕉️");
          else if (l1.startsWith("Hometown")) l1 = l1.replace("Hometown -", "🏠");
          return <div key={idx + 100} style={{ fontSize: '1.13em', marginBottom: 2 }}>{l1}</div>;
        })}
      </div>
    );
  }

  return (
    <div className="profile-full-stack">
      <div className="profile-header-name">{profile.name}</div>
      <div className="element-card photo-card">
        <img src={profile.profilePic} alt="Profile" className="profile-photo" />
      </div>
      {firstTextElement && (
        <div className="element-card info-card">
          <div className="element-topic">{firstTextElement.title}</div>
          <div className="element-subtopic">{firstTextElement.subtitle}</div>
        </div>
      )}
      <div className="element-card info-card">
        {/* <div className="element-topic">Details & Preferences</div> */}
        <div className="element-subtopic" style={{ whiteSpace: 'pre-line' }}>
          {formatDetails(profile.details)}
        </div>
      </div>
      {remainingElements.map((element, idx) =>
        element.type === "image" ? (
          <div className="element-card photo-card" key={idx}>
            {element.title && <div className="element-topic">{element.title}</div>}
            <img src={element.url} alt={element.title || "Profile"} className="profile-photo" />
            {element.subtitle && <div className="photo-caption">{element.subtitle}</div>}
          </div>
        ) : (
          <div className="element-card info-card" key={idx}>
            <div className="element-topic">{element.title}</div>
            <div className="element-subtopic">{element.subtitle}</div>
          </div>
        )
      )}
    </div>
  );
}