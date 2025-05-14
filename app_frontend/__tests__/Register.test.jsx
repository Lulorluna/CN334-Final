import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockPush = jest.fn()
jest.mock('next/router', () => ({
    useRouter: () => ({ push: mockPush }),
}))

jest.mock('next/image', () => props => {
    return <img {...props} />
})
jest.mock('next/link', () => ({ href, children, ...props }) => (
    <a href={href} {...props}>{children}</a>
))

import axios from 'axios'
jest.mock('axios')

import RegisterPage from '../pages/register/index'

describe('RegisterPage', () => {
    beforeEach(() => {
        mockPush.mockClear()
        axios.post.mockReset()
    })

    it('renders all input fields, the Register button, and Sign In link', () => {
        render(<RegisterPage />)

        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Sex/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument()

        expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument()

        expect(screen.getByRole('link', { name: /Sign In/i })).toHaveAttribute('href', '/login')
    })

    it('submits valid data and redirects on success', async () => {
        axios.post.mockResolvedValueOnce({})

        render(<RegisterPage />)

        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'alice' } })
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } })
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } })
        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice A.' } })
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '2000-01-01' } })
        fireEvent.change(screen.getByLabelText(/Sex/i), { target: { value: 'female' } })
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '0123456789' } })

        fireEvent.click(screen.getByRole('button', { name: /Register/i }))

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/register/'),
                {
                    username: 'alice',
                    email: 'a@b.com',
                    password: 'secret',
                    fullname: 'Alice A.',
                    date_of_birth: '2000-01-01',
                    sex: 'female',
                    tel: '0123456789',
                },
            )
            expect(mockPush).toHaveBeenCalledWith('/login')
        })
    })

    it('shows error message on failure', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { error: 'Username taken.' } }
        })

        render(<RegisterPage />)

        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'bob' } })
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'b@c.com' } })
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } })
        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Bob B.' } })
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '1990-05-05' } })
        fireEvent.change(screen.getByLabelText(/Sex/i), { target: { value: 'male' } })
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '0987654321' } })

        fireEvent.click(screen.getByRole('button', { name: /Register/i }))

        await waitFor(() => {
            expect(screen.getByText('Username taken.')).toBeInTheDocument()
            expect(mockPush).not.toHaveBeenCalled()
        })
    })
})
