jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        prefetch: jest.fn(),
        pathname: '/',
        query: {},
    }),
}));

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Login from '../pages/login/index';

describe('Login', () => {
    it('renders inputs', () => {
        const { container } = render(<Login />);
        const username = container.querySelector('input[name="username"]');
        const password = container.querySelector('input[name="password"]');
        expect(username).toBeInTheDocument();
        expect(password).toBeInTheDocument();
    });
});
