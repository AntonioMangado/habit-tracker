import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AddHabitModal } from '@/components/AddHabitModal'

const mockAddHabit = vi.fn().mockResolvedValue(undefined)
vi.mock('@/store/useHabitStore', () => ({
  useHabitStore: (selector: any) => selector({ addHabit: mockAddHabit }),
}))

beforeEach(() => {
  mockAddHabit.mockClear()
})

describe('AddHabitModal', () => {
  it('renders all four fields when open', async () => {
    render(<AddHabitModal open={true} onClose={vi.fn()} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/frequency per week/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hours per day/i)).toBeInTheDocument()
    const colorButtons = screen.getAllByRole('button', { name: /color/i })
    expect(colorButtons.length).toBeGreaterThan(0)
  })

  it('does not render when open is false', () => {
    render(<AddHabitModal open={false} onClose={vi.fn()} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('blocks submit and shows error when name is empty', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<AddHabitModal open={true} onClose={onClose} />)

    await user.type(screen.getByLabelText(/frequency per week/i), '3')
    await user.type(screen.getByLabelText(/hours per day/i), '1.5')
    await user.click(screen.getByRole('button', { name: /add habit/i }))

    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    expect(mockAddHabit).not.toHaveBeenCalled()
  })

  it('rejects frequency out of range or non-integer', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    const testCases = ['0', '8', '3.5', '']

    for (const freq of testCases) {
      mockAddHabit.mockClear()
      const { unmount } = render(<AddHabitModal open={true} onClose={onClose} />)

      const frequencyInput = screen.getByLabelText(/frequency per week/i) as HTMLInputElement

      await user.type(screen.getByLabelText(/name/i), 'Test')
      if (freq === '') {
        // Leave frequency empty (don't type anything)
      } else {
        await user.type(frequencyInput, freq)
      }
      await user.type(screen.getByLabelText(/hours per day/i), '1.5')
      await user.click(screen.getByRole('button', { name: /add habit/i }))

      expect(screen.getByText(/frequency must be a whole number between 1 and 7/i)).toBeInTheDocument()
      expect(mockAddHabit).not.toHaveBeenCalled()
      unmount()
    }
  })

  it('rejects hoursPerDay <= 0 or non-numeric', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    const testCases = ['0', '-1', '', 'abc']

    for (const hours of testCases) {
      mockAddHabit.mockClear()
      const { unmount } = render(<AddHabitModal open={true} onClose={onClose} />)

      const hoursInput = screen.getByLabelText(/hours per day/i) as HTMLInputElement

      await user.type(screen.getByLabelText(/name/i), 'Test')
      await user.type(screen.getByLabelText(/frequency per week/i), '3')
      if (hours === '') {
        // Leave hours empty (don't type anything)
      } else {
        await user.type(hoursInput, hours)
      }
      await user.click(screen.getByRole('button', { name: /add habit/i }))

      expect(screen.getByText(/hours per day must be greater than 0/i)).toBeInTheDocument()
      expect(mockAddHabit).not.toHaveBeenCalled()
      unmount()
    }
  })

  it('successfully adds habit with validated data', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<AddHabitModal open={true} onClose={onClose} />)

    await user.type(screen.getByLabelText(/name/i), 'Drums')
    await user.type(screen.getByLabelText(/frequency per week/i), '5')
    await user.type(screen.getByLabelText(/hours per day/i), '1.5')
    await user.click(screen.getByRole('button', { name: /add habit/i }))

    expect(mockAddHabit).toHaveBeenCalledOnce()
    const call = mockAddHabit.mock.calls[0][0]
    expect(call.name).toBe('Drums')
    expect(call.frequency).toBe(5)
    expect(call.hoursPerDay).toBe(1.5)
    expect(call.description).toBe('')
    expect(typeof call.color).toBe('string')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes modal on Escape key without saving', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<AddHabitModal open={true} onClose={onClose} />)

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
    expect(mockAddHabit).not.toHaveBeenCalled()
  })

  it('closes modal on backdrop click without saving', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<AddHabitModal open={true} onClose={onClose} />)

    await user.click(screen.getByTestId('add-habit-backdrop'))

    expect(onClose).toHaveBeenCalledOnce()
    expect(mockAddHabit).not.toHaveBeenCalled()
  })

  it('does not close modal when clicking inside the dialog', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<AddHabitModal open={true} onClose={onClose} />)

    const nameInput = screen.getByLabelText(/name/i)
    await user.click(nameInput)

    expect(onClose).not.toHaveBeenCalled()
  })
})
