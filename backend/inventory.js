let inventory = {}

export function addItem(characterId, itemId, quantity = 1) {
  if (!inventory[characterId]) {
    inventory[characterId] = {}
  }

  inventory[characterId][itemId] = (inventory[characterId][itemId] || 0) + quantity

  return true
}

export function removeItem(characterId, itemId, quantity = 1) {
  if (!inventory[characterId]) {
    return false
  }

  if (!inventory[characterId][itemId]) {
    return false
  }

  if (inventory[characterId][itemId] < quantity) {
    return false
  }

  inventory[characterId][itemId] -= quantity

  if (inventory[characterId][itemId] === 0) {
    delete inventory[characterId][itemId]
  }

  return true
}

export function getInventory(characterId) {
  return inventory[characterId] ? {...inventory[characterId]} : {}
}

export function hasItem(characterId, itemId, quantity = 1) {
  if (!inventory[characterId]) {
    return false
  }

  return (inventory[characterId][itemId] || 0) >= quantity
}

export function getItemCount(characterId, itemId) {
  if (!inventory[characterId]) {
    return 0
  }

  return inventory[characterId][itemId] || 0
}

export function clearInventory(characterId) {
  delete inventory[characterId]
}

export function getAllInventories() {
  return inventory
}