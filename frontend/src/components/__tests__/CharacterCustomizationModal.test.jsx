import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../utils/characterCustomization')
vi.mock('../../data/customizationOptions')

import CharacterCustomizationModal from '../CharacterCustomizationModal'

describe('CharacterCustomizationModal', () => {
  it('should render correctly', () => {
    render(
      <CharacterCustomizationModal
        show={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    )

    expect(screen.getByText('👤 캐릭터 커스터마이징')).toBeInTheDocument()
  })
})