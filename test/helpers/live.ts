import { screen } from '@testing-library/react'

export const heading = (name: string) => screen.findByText(name, { selector: 'h1' })

export const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))
