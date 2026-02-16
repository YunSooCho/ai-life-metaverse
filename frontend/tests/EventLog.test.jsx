import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EventLog from '../src/components/EventLog'
import '@testing-library/jest-dom'

describe('EventLog Component', () => {
  const mockCharacterName = '테스트 캐릭터'

  const emptyLogs = []

  const mockLogs = [
    {
      type: 'exit',
      buildingId: 1,
      buildingName: '상점',
      characterId: 'char1',
      characterName: '테스트 캐릭터',
      enterTime: 1699999999000,
      exitTime: 1700000000000,
      dwellTime: 1000
    },
    {
      type: 'exit',
      buildingId: 2,
      buildingName: '카페',
      characterId: 'char1',
      characterName: '테스트 캐릭터',
      enterTime: 1700000001000,
      exitTime: 1700000006000,
      dwellTime: 5000
    },
    {
      type: 'exit',
      buildingId: 3,
      buildingName: '도서관',
      characterId: 'char1',
      characterName: '테스트 캐릭터',
      enterTime: 1700000010000,
      exitTime: 1700000012000,
      dwellTime: 2000
    }
  ]

  it('should render empty state when no logs', () => {
    render(<EventLog logs={emptyLogs} characterName={mockCharacterName} />)
    
    expect(screen.getByText('방문 기록이 없습니다')).toBeInTheDocument()
  })

  it('should render building logs', () => {
    render(<EventLog logs={mockLogs} characterName={mockCharacterName} />)
    
    expect(screen.getByText('🏢 상점')).toBeInTheDocument()
    expect(screen.getByText('🏢 카페')).toBeInTheDocument()
    expect(screen.getByText('🏢 도서관')).toBeInTheDocument()
  })

  it('should render correct icons for exit events', () => {
    render(<EventLog logs={mockLogs} characterName={mockCharacterName} />)
    
    const runningIcons = screen.getAllByText('🏃')
    expect(runningIcons.length).toBe(3)
  })

  it('should render dwell time information', () => {
    render(<EventLog logs={mockLogs} characterName={mockCharacterName} />)
    
    expect(screen.getAllByText(/⏱️ 체류시간:/).length).toBe(3)
  })

  it('should render all time information for each log', () => {
    render(<EventLog logs={mockLogs} characterName={mockCharacterName} />)
    
    const entranceTimes = screen.getAllByText(/입장:/)
    const exitTimes = screen.getAllByText(/퇴장:/)
    
    expect(entranceTimes.length).toBe(3)
    expect(exitTimes.length).toBe(3)
  })

  it('should render correct number of log items', () => {
    render(<EventLog logs={mockLogs} characterName={mockCharacterName} />)
    
    const logItems = document.querySelectorAll('.event-log-item')
    expect(logItems.length).toBe(3)
  })

  it('should render logs in correct order', () => {
    render(<EventLog logs={mockLogs} characterName={mockCharacterName} />)
    
    const logItems = document.querySelectorAll('.event-log-item')
    const firstLog = logItems[0]
    const lastLog = logItems[2]
    
    expect(firstLog.textContent).toContain('상점')
    expect(lastLog.textContent).toContain('도서관')
  })

  it('should handle logs with 0 dwell time', () => {
    const zeroDwellLogs = [
      {
        type: 'exit',
        buildingId: 1,
        buildingName: '상점',
        characterId: 'char1',
        characterName: '테스트 캐릭터',
        enterTime: 1699999999000,
        exitTime: 1699999999000,
        dwellTime: 0
      }
    ]

    render(<EventLog logs={zeroDwellLogs} characterName={mockCharacterName} />)
    
    expect(screen.getByText('🏢 상점')).toBeInTheDocument()
    expect(screen.getByText(/⏱️ 체류시간:/)).toBeInTheDocument()
  })

  it('should handle very long dwell times', () => {
    const longDwellLogs = [
      {
        type: 'exit',
        buildingId: 1,
        buildingName: '상점',
        characterId: 'char1',
        characterName: '테스트 캐릭터',
        enterTime: 1699999999000,
        exitTime: 1700003600000,
        dwellTime: 3600000
      }
    ]

    render(<EventLog logs={longDwellLogs} characterName={mockCharacterName} />)
    
    expect(screen.getByText('🏢 상점')).toBeInTheDocument()
    expect(screen.getByText(/⏱️ 체류시간:/)).toBeInTheDocument()
  })

  it('should render all required information for each log item', () => {
    render(<EventLog logs={mockLogs} characterName={mockCharacterName} />)
    
    const logItems = document.querySelectorAll('.event-log-item')
    
    logItems.forEach(item => {
      expect(item.querySelector('.event-log-content')).toBeInTheDocument()
      expect(item.querySelector('.event-log-type')).toBeInTheDocument()
      expect(item.querySelector('.event-log-building')).toBeInTheDocument()
    })
  })
})

describe('EventLog Time Formatting', () => {
  it('should format time correctly for different timestamps', () => {
    const logs = [
      {
        type: 'exit',
        buildingId: 1,
        buildingName: '상점',
        characterId: 'char1',
        characterName: '테스트 캐릭터',
        enterTime: 1699999999000,
        exitTime: 1700000000000,
        dwellTime: 1000
      }
    ]

    render(<EventLog logs={logs} characterName="테스트 캐릭터" />)
    
    const entranceTimeElement = screen.getByText(/입장:/)
    const exitTimeElement = screen.getByText(/퇴장:/)
    
    expect(entranceTimeElement).toBeInTheDocument()
    expect(exitTimeElement).toBeInTheDocument()
  })
})

describe('EventLog Edge Cases', () => {
  it('should handle single log', () => {
    const singleLog = [
      {
        type: 'exit',
        buildingId: 1,
        buildingName: '상점',
        characterId: 'char1',
        characterName: '테스트 캐릭터',
        enterTime: 1699999999000,
        exitTime: 1700000000000,
        dwellTime: 1000
      }
    ]

    render(<EventLog logs={singleLog} characterName="테스트 캐릭터" />)
    
    expect(screen.getByText('🏢 상점')).toBeInTheDocument()
  })

  it('should handle logs without exit time (though unlikely)', () => {
    const incompleteLogs = [
      {
        type: 'enter',
        buildingId: 1,
        buildingName: '상점',
        characterId: 'char1',
        characterName: '테스트 캐릭터',
        enterTime: 1699999999000
      }
    ]

    render(<EventLog logs={incompleteLogs} characterName="테스트 캐릭터" />)
    
    expect(screen.getByText('🏢 상점')).toBeInTheDocument()
    expect(screen.getByText(/입장:/)).toBeInTheDocument()
  })
})