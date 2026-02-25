import { useState } from 'react'
import { socket } from '../socket'

export function useCharacter(initialCharacter) {
  const [characters, setCharacters] = useState({})

  const updateCharacter = (characterId, updatedData) => {
    setCharacters(prev => ({
      ...prev,
      [characterId]: { ...prev[characterId], ...updatedData }
    }))
  }

  const addCharacter = (character) => {
    setCharacters(prev => ({
      ...prev,
      [character.id]: character
    }))
  }

  const removeCharacter = (characterId) => {
    setCharacters(prev => {
      const newChars = { ...prev }
      delete newChars[characterId]
      return newChars
    })
  }

  const moveCharacter = (characterId, x, y) => {
    setCharacters(prev => ({
      ...prev,
      [characterId]: { ...prev[characterId], x, y }
    }))
    socket.emit('move', { id: characterId, x, y })
  }

  return {
    characters,
    updateCharacter,
    addCharacter,
    removeCharacter,
    moveCharacter
  }
}