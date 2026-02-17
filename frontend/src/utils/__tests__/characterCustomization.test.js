import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getCustomization,
  saveCustomization,
  resetCustomization,
  updateCustomization,
  getOptionName,
  getOptionDescription,
  getOptionEmoji,
  getColorHex,
  getAllOptions,
  getCategories,
  getEmojiCombination
} from '../characterCustomization'
import {
  CUSTOMIZATION_CATEGORIES,
  HAIR_STYLES,
  CLOTHING_COLORS,
  ACCESSORIES
} from '../../data/customizationOptions'

describe('characterCustomization', () => {
  beforeEach(() => {
    // localStorage Mock 설정
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }
    global.localStorage = localStorageMock

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getCustomization', () => {
    it('should return default customization when no saved data', () => {
      localStorage.getItem.mockReturnValue(null)

      const customization = getCustomization()

      expect(customization).toHaveProperty('hairStyle', 'short')
      expect(customization).toHaveProperty('clothingColor', 'blue')
      expect(customization).toHaveProperty('accessory', 'none')
    })

    it('should return saved customization when available', () => {
      const savedData = {
        hairStyle: 'long',
        clothingColor: 'red',
        accessory: 'glasses'
      }
      localStorage.getItem.mockReturnValue(JSON.stringify(savedData))

      const customization = getCustomization()

      expect(customization.hairStyle).toBe('long')
      expect(customization.clothingColor).toBe('red')
      expect(customization.accessory).toBe('glasses')
    })

    it('should merge saved data with defaults', () => {
      const savedData = {
        hairStyle: 'medium'
      }
      localStorage.getItem.mockReturnValue(JSON.stringify(savedData))

      const customization = getCustomization()

      expect(customization.hairStyle).toBe('medium')
      expect(customization.clothingColor).toBe('blue') // 기본값 유지
      expect(customization.accessory).toBe('none') // 기본값 유지
    })

    it('should handle JSON parse error', () => {
      localStorage.getItem.mockReturnValue('invalid json')

      const customization = getCustomization()

      expect(customization).toHaveProperty('hairStyle', 'short')
      expect(customization).toHaveProperty('clothingColor', 'blue')
      expect(customization).toHaveProperty('accessory', 'none')
    })
  })

  describe('saveCustomization', () => {
    it('should save customization to localStorage', () => {
      const customization = {
        hairStyle: 'long',
        clothingColor: 'purple',
        accessory: 'hat'
      }

      saveCustomization(customization)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'character-customization',
        JSON.stringify(customization)
      )
    })

    it('should handle save error', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const customization = { hairStyle: 'long' }

      expect(() => saveCustomization(customization)).not.toThrow()
    })
  })

  describe('resetCustomization', () => {
    it('should remove customization from localStorage', () => {
      resetCustomization()

      expect(localStorage.removeItem).toHaveBeenCalledWith('character-customization')
    })

    it('should handle reset error', () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => resetCustomization()).not.toThrow()
    })
  })

  describe('updateCustomization', () => {
    it('should update hair style', () => {
      const current = {
        hairStyle: 'short',
        clothingColor: 'blue',
        accessory: 'none'
      }

      const updated = updateCustomization(
        current,
        CUSTOMIZATION_CATEGORIES.HAIR_STYLES,
        'long'
      )

      expect(updated.hairStyle).toBe('long')
      expect(updated.clothingColor).toBe('blue') // 변경되지 않음
      expect(updated.accessory).toBe('none') // 변경되지 않음
    })

    it('should update clothing color', () => {
      const current = {
        hairStyle: 'short',
        clothingColor: 'blue',
        accessory: 'none'
      }

      const updated = updateCustomization(
        current,
        CUSTOMIZATION_CATEGORIES.CLOTHING_COLORS,
        'red'
      )

      expect(updated.clothingColor).toBe('red')
    })

    it('should update accessory', () => {
      const current = {
        hairStyle: 'short',
        clothingColor: 'blue',
        accessory: 'none'
      }

      const updated = updateCustomization(
        current,
        CUSTOMIZATION_CATEGORIES.ACCESSORIES,
        'glasses'
      )

      expect(updated.accessory).toBe('glasses')
    })

    it('should return original customization for invalid category', () => {
      const current = {
        hairStyle: 'short',
        clothingColor: 'blue',
        accessory: 'none'
      }

      const updated = updateCustomization(current, 'invalid', 'long')

      expect(updated).toEqual(current)
    })

    it('should return original customization for invalid option ID', () => {
      const current = {
        hairStyle: 'short',
        clothingColor: 'blue',
        accessory: 'none'
      }

      const updated = updateCustomization(
        current,
        CUSTOMIZATION_CATEGORIES.HAIR_STYLES,
        'invalid'
      )

      expect(updated).toEqual(current)
    })
  })

  describe('getOptionName', () => {
    it('should return option name', () => {
      const name = getOptionName(
        CUSTOMIZATION_CATEGORIES.HAIR_STYLES,
        'short'
      )

      expect(name).toBe('짧은 머리')
    })

    it('should return empty string for invalid option', () => {
      const name = getOptionName(
        CUSTOMIZATION_CATEGORIES.HAIR_STYLES,
        'invalid'
      )

      expect(name).toBe('')
    })
  })

  describe('getOptionDescription', () => {
    it('should return option description', () => {
      const description = getOptionDescription(
        CUSTOMIZATION_CATEGORIES.HAIR_STYLES,
        'long'
      )

      expect(description).toBe('허리까지 내려오는 긴 머리')
    })

    it('should return empty string for invalid option', () => {
      const description = getOptionDescription(
        CUSTOMIZATION_CATEGORIES.HAIR_STYLES,
        'invalid'
      )

      expect(description).toBe('')
    })
  })

  describe('getOptionEmoji', () => {
    it('should return option emoji', () => {
      const emoji = getOptionEmoji(
        CUSTOMIZATION_CATEGORIES.ACCESSORIES,
        'glasses'
      )

      expect(emoji).toBe('👓')
    })

    it('should return empty string for no accessory', () => {
      const emoji = getOptionEmoji(
        CUSTOMIZATION_CATEGORIES.ACCESSORIES,
        'none'
      )

      expect(emoji).toBe('')
    })

    it('should return empty string for invalid option', () => {
      const emoji = getOptionEmoji(
        CUSTOMIZATION_CATEGORIES.ACCESSORIES,
        'invalid'
      )

      expect(emoji).toBe('')
    })
  })

  describe('getColorHex', () => {
    it('should return color hex value', () => {
      const hex = getColorHex('red')

      expect(hex).toBe('#F44336')
    })

    it('should return default color for invalid ID', () => {
      const hex = getColorHex('invalid')

      expect(hex).toBe('#4CAF50')
    })
  })

  describe('getAllOptions', () => {
    it('should return all options', () => {
      const options = getAllOptions()

      expect(options).toHaveProperty('hairStyles')
      expect(options).toHaveProperty('clothingColors')
      expect(options).toHaveProperty('accessories')
    })

    it('should return options indexed by ID', () => {
      const options = getAllOptions()

      // 옵션은 ID로 인덱싱되어 있음 (소문자)
      expect(options.hairStyles.short).toEqual(HAIR_STYLES.SHORT)
      expect(options.hairStyles.long).toEqual(HAIR_STYLES.LONG)
      expect(options.clothingColors.red).toEqual(CLOTHING_COLORS.RED)
      expect(options.clothingColors.blue).toEqual(CLOTHING_COLORS.BLUE)
      expect(options.accessories.glasses).toEqual(ACCESSORIES.GLASSES)
    })
  })

  describe('getCategories', () => {
    it('should return all categories', () => {
      const categories = getCategories()

      expect(categories).toHaveLength(3)
      expect(categories).toContain(CUSTOMIZATION_CATEGORIES.HAIR_STYLES)
      expect(categories).toContain(CUSTOMIZATION_CATEGORIES.CLOTHING_COLORS)
      expect(categories).toContain(CUSTOMIZATION_CATEGORIES.ACCESSORIES)
    })
  })

  describe('getEmojiCombination', () => {
    it('should return emoji combination', () => {
      const customization = {
        hairStyle: 'long',
        clothingColor: 'red',
        accessory: 'glasses'
      }

      const emoji = getEmojiCombination(customization)

      expect(emoji).toContain('👱‍♀️') // hairStyle: long
      expect(emoji).toContain('👓') // accessory: glasses
    })

    it('should return hair emoji when no accessory', () => {
      const customization = {
        hairStyle: 'short',
        clothingColor: 'blue',
        accessory: 'none'
      }

      const emoji = getEmojiCombination(customization)

      expect(emoji).toContain('👨')
      expect(emoji).not.toContain('👓')
    })

    it('should handle long hair with crown', () => {
      const customization = {
        hairStyle: 'long',
        clothingColor: 'purple',
        accessory: 'crown'
      }

      const emoji = getEmojiCombination(customization)

      expect(emoji).toContain('👱‍♀️')
      expect(emoji).toContain('👑')
    })

    it('should handle bald with headphones', () => {
      const customization = {
        hairStyle: 'bald',
        clothingColor: 'gray',
        accessory: 'headphones'
      }

      const emoji = getEmojiCombination(customization)

      expect(emoji).toContain('🧑‍🦲')
      expect(emoji).toContain('🎧')
    })
  })
})