export default function ProfileCard({ profile }) {
  if (!profile) return null;

  // Find the first element with type "text" for the main prompt card
  const firstTextElement = profile.elements.find(e => e.type === "text");
  // The rest (after first prompt and details)
  const remainingElements = profile.elements.filter((e, idx) => e !== firstTextElement);

  return (
    <div className="profile-full-stack">
      {/* Profile name left-aligned above everything */}
      <div className="profile-header-name">
        {profile.name}
      </div>

      {/* Profile photo shown first in its own card */}
      <div className="element-card photo-card">
        <img src={profile.profilePic} alt="Profile" className="profile-photo" />
      </div>

      {/* First prompt with title/subtitle as a card */}
      {firstTextElement && (
        <div className="element-card info-card">
          <div className="element-topic">{firstTextElement.title}</div>
          <div className="element-subtopic">{firstTextElement.subtitle}</div>
        </div>
      )}

      {/* Details card */}
      <div className="element-card info-card">
        <div className="element-topic">Details & Preferences</div>
        <div className="element-subtopic" style={{ whiteSpace: 'pre-line' }}>
          {profile.details}
        </div>
      </div>

      {/* Other elements as cards */}
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