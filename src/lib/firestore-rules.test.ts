import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('Firestore Rules', () => {
  it('contains rules_version = 2', () => {
    const rules = readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf-8')
    expect(rules).toContain("rules_version = '2'")
  })

  it('contains match /users/{uid} path', () => {
    const rules = readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf-8')
    expect(rules).toContain('match /users/{uid}')
  })

  it('restricts access to authenticated user by uid', () => {
    const rules = readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf-8')
    expect(rules).toContain('request.auth.uid == uid')
  })

  it('does not contain unconditional allow rules', () => {
    const rules = readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf-8')
    expect(rules).not.toContain('allow read, write: if true')
  })
})
