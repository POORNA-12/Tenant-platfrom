import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import * as workflowService from './services/workflowService';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        BrowserRouter: ({ children }) => <>{children}</>,
    };
});

// Mock the AuthContext
vi.mock('./context/AuthContext', () => ({
    useAuth: () => ({
        user: { email: 'test@example.com', role: 'admin' },
        tenantSlug: 'test-tenant',
        isAuthenticated: true,
        loading: false,
        logout: vi.fn(),
    }),
    AuthProvider: ({ children }) => <>{children}</>,
}));

// Mock the services
vi.mock('./services/workflowService', () => ({
    getMyRequests: vi.fn(() => Promise.resolve({ results: [], count: 0 })),
    getMyApprovals: vi.fn(() => Promise.resolve({ results: [], count: 0 })),
    getPendingApprovals: vi.fn(() => Promise.resolve({ pending: [], approved: [], rejected: [] })),
}));

// Mock Lucide icons dynamically to avoid "missing export" errors
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    const mockIcons = {};
    Object.keys(actual).forEach((key) => {
        // Only mock components (uppercase start)
        if (key[0] === key[0].toUpperCase()) {
            mockIcons[key] = (props) => <div data-testid={`icon-${key}`} {...props} />;
        } else {
            mockIcons[key] = actual[key];
        }
    });
    return mockIcons;
});

describe('Routing Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderApp = (initialRoute = '/dashboard') => {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <App />
            </MemoryRouter>
        );
    };

    it('should navigate to My Requests when clicking the sidebar link', async () => {
        renderApp();

        const myRequestsLink = screen.getAllByText(/My Requests/i).find(el => el.closest('a'));
        expect(myRequestsLink).toBeInTheDocument();
        fireEvent.click(myRequestsLink);

        await waitFor(() => {
            expect(screen.getByText(/Track and manage all workflow requests you've submitted/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should navigate to My Approvals when clicking the sidebar link', async () => {
        renderApp();

        const myApprovalsLink = screen.getAllByText(/My Approvals/i).find(el => el.closest('a'));
        expect(myApprovalsLink).toBeInTheDocument();
        fireEvent.click(myApprovalsLink);

        await waitFor(() => {
            expect(screen.getByText(/Review and act on workflow requests assigned to you/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should show placeholders for missing pages like Drafts', async () => {
        renderApp();

        const draftsLink = screen.getAllByText(/Drafts/i).find(el => el.closest('a'));
        expect(draftsLink).toBeInTheDocument();
        fireEvent.click(draftsLink);

        await waitFor(() => {
            expect(screen.getByText(/Drafts page coming soon/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
