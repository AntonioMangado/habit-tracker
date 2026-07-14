import { useEffect, useState } from 'react'
import type { HabitFormValues, HabitFormErrors } from '@/lib/habitValidation'
import type { NewHabit } from '@/types'
import { PRESET_COLORS, validateHabitForm } from '@/lib/habitValidation'
import { useHabitStore } from '@/store/useHabitStore'

interface AddHabitModalProps {
  open: boolean
  onClose: () => void
}

export function AddHabitModal({ open, onClose }: AddHabitModalProps) {
  const addHabit = useHabitStore((s) => s.addHabit)

  const [values, setValues] = useState<HabitFormValues>({
    name: '',
    color: PRESET_COLORS[0],
    frequency: '',
    hoursPerDay: '',
  })

  const [errors, setErrors] = useState<HabitFormErrors>({})

  // Reset values and errors when modal opens
  useEffect(() => {
    if (open) {
      setValues({
        name: '',
        color: PRESET_COLORS[0],
        frequency: '',
        hoursPerDay: '',
      })
      setErrors({})
    }
  }, [open])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formErrors = validateHabitForm(values)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      return
    }

    const payload: NewHabit = {
      name: values.name.trim(),
      description: '',
      color: values.color,
      frequency: Number(values.frequency),
      hoursPerDay: Number(values.hoursPerDay),
    }

    void addHabit(payload)
    onClose()
  }

  if (!open) {
    return null
  }

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }

  const dialogStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '90%',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    marginBottom: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
  }

  const colorButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '4px',
    border: isSelected ? '3px solid #333' : '1px solid #ddd',
    cursor: 'pointer',
    marginRight: '8px',
    padding: 0,
  })

  const errorStyle: React.CSSProperties = {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '-8px',
    marginBottom: '12px',
  }

  return (
    <div
      data-testid="add-habit-backdrop"
      style={backdropStyle}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-habit-title"
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-habit-title">Add habit</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="habit-name">Name</label>
            <input
              id="habit-name"
              type="text"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              style={inputStyle}
            />
            {errors.name && (
              <p role="alert" style={errorStyle}>
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label>Color</label>
            <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Color ${color}`}
                  aria-pressed={values.color === color}
                  style={{
                    ...colorButtonStyle(values.color === color),
                    backgroundColor: color,
                  }}
                  onClick={() => setValues({ ...values, color })}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="habit-frequency">Frequency per week</label>
            <input
              id="habit-frequency"
              type="number"
              value={values.frequency}
              onChange={(e) => setValues({ ...values, frequency: e.target.value })}
              style={inputStyle}
            />
            {errors.frequency && (
              <p role="alert" style={errorStyle}>
                {errors.frequency}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="habit-hours">Hours per day</label>
            <input
              id="habit-hours"
              type="number"
              step="0.1"
              value={values.hoursPerDay}
              onChange={(e) => setValues({ ...values, hoursPerDay: e.target.value })}
              style={inputStyle}
            />
            {errors.hoursPerDay && (
              <p role="alert" style={errorStyle}>
                {errors.hoursPerDay}
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Add habit
          </button>
        </form>
      </div>
    </div>
  )
}
