import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        prefetch: jest.fn(),
        pathname: '/',
        query: {},
    }),
}))

jest.mock('next/image', () => {
    return function MockImage(props) {
        const { fill, ...rest } = props
        return <img {...rest} />
    }
})

jest.mock('next/link', () => {
    return ({ href, children, ...props }) => (

        <a href={href} {...props}>
            {children}
        </a>
    )
})

class LocalStorageMock {
    constructor() { this.store = {} }
    getItem(key) { return this.store[key] ?? null }
    setItem(key, v) { this.store[key] = String(v) }
    removeItem(key) { delete this.store[key] }
}
global.localStorage = new LocalStorageMock()

import HomePage from '../pages/index'

describe('HomePage', () => {
    beforeEach(() => {
        localStorage.store = {}
        mockPush.mockClear()
        jest.clearAllMocks()
    })

    it('renders header logo and nav links', () => {
        render(<HomePage />)

        const logo = screen.getByAltText('Logo')
        expect(logo).toBeInTheDocument()

        expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
        expect(screen.getByText('About Us').closest('a')).toHaveAttribute('href', '/about')
        expect(screen.getByText('Product').closest('a')).toHaveAttribute('href', '/product-list')
    })

    it('shows Sign In button when not logged in', () => {
        render(<HomePage />)
        expect(screen.getByText('Sign In')).toBeInTheDocument()
        expect(screen.queryByText('🛒')).not.toBeInTheDocument()
    })

    it('shows cart icon and profile dropdown when logged in', () => {
        const payload = { exp: Math.floor(Date.now() / 1000) + 60 }
        const fakeToken = `xxx.${btoa(JSON.stringify(payload))}.zzz`
        localStorage.setItem('jwt_access', fakeToken)

        render(<HomePage />)
        expect(screen.getByText('🛒')).toBeInTheDocument()

        const profileBtn = screen.getByRole('button', { name: 'Profile' })
        fireEvent.click(profileBtn)

        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    it('logs out and redirects on Logout click', () => {
        const payload = { exp: Math.floor(Date.now() / 1000) + 60 }
        const fakeToken = `xxx.${btoa(JSON.stringify(payload))}.zzz`
        localStorage.setItem('jwt_access', fakeToken)

        render(<HomePage />)

        fireEvent.click(screen.getByRole('button', { name: 'Profile' }))
        fireEvent.click(screen.getByText('Logout'))

        expect(localStorage.getItem('jwt_access')).toBeNull()
        expect(mockPush).toHaveBeenCalledWith('/')
    })
})
