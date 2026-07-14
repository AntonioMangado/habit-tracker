import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from '@/App'

describe('App', () => {
  it('renders the Habit Tracker heading', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /habit tracker/i }),
    ).toBeInTheDocument()
  })

  it('opens the add-habit modal when the button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /add habit/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
