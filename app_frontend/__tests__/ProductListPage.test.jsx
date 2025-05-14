import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => ({ get: () => null }),
}))
jest.mock('next/image', () => props => {
    const { fill, priority, ...rest } = props
    return <img {...rest} />
})
jest.mock('next/link', () => ({ href, children }) => <a href={href}>{children}</a>)

class LocalStorageMock {
    constructor() { this.store = {} }
    getItem(k) { return this.store[k] ?? null }
    setItem(k, v) { this.store[k] = String(v) }
    removeItem(k) { delete this.store[k] }
}
global.localStorage = new LocalStorageMock()

beforeAll(() => {
    global.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) })
    )
})
afterAll(() => {
    delete global.fetch
})

import ProductListPage from '../pages/product-list'

describe('ProductListPage', () => {
    beforeEach(() => {
        localStorage.store = {}
        mockPush.mockClear()
        fetch.mockClear()
    })

    it('renders search box, category buttons and login prompt', async () => {
        await act(async () => {
            render(<ProductListPage />)
        })

        expect(screen.getByPlaceholderText('ค้นหาสินค้า...')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Defect/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Fruit/ })).toBeInTheDocument()
        expect(
            screen.getByText('กรุณาเข้าสู่ระบบเพื่อดูสินค้าในจังหวัดของคุณ')
        ).toBeInTheDocument()
    })

    it('shows empty state when no products', async () => {
        await act(async () => {
            render(<ProductListPage />)
        })

        await waitFor(() => {
            expect(
                screen.getByText(/ไม่พบสินค้าที่ตรงกับคำค้นหา|สินค้าหมด/)
            ).toBeInTheDocument()
        })
    })

    it('filters products by search term', async () => {
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        data: [
                            { id: 1, name: 'Apple', detail: 'Fresh apple', available: true, expiration_date: '2025-01-01', price: 10, categories: ['Fruit'] },
                            { id: 2, name: 'Bread', detail: 'Whole grain', available: true, expiration_date: '2025-01-01', price: 5, categories: ['Cereals'] },
                        ],
                    }),
            })
        )

        await act(async () => {
            render(<ProductListPage />)
        })

        await waitFor(() => {
            expect(screen.getByText('Apple')).toBeInTheDocument()
            expect(screen.getByText('Bread')).toBeInTheDocument()
        })

        fireEvent.change(screen.getByPlaceholderText('ค้นหาสินค้า...'), {
            target: { value: 'app' },
        })

        expect(screen.getByText('Apple')).toBeInTheDocument()
        expect(screen.queryByText('Bread')).toBeNull()
    })
})
