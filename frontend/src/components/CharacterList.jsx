import PropTypes from 'prop-types'

export default function CharacterList({ myCharacter, characters }) {
  const allCharacters = [myCharacter, ...Object.values(characters)]

  return (
    <div className="character-list">
      {allCharacters.map(char => (
        <div key={char.id} className="character-list-item">
          <span className="character-name">{char.name}</span>
          {char.isAi && <span className="character-ai-badge">🤖</span>}
        </div>
      ))}
    </div>
  )
}

CharacterList.propTypes = {
  myCharacter: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isAi: PropTypes.bool.isRequired
  }).isRequired,
  characters: PropTypes.object.isRequired
}