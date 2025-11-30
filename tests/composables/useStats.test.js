import { describe, it, expect, vi } from 'vitest';
import { useStats } from '../../composables/useStats';

// Mock useDirectusBase
vi.mock('@/composables/useDirectusBase', () => ({
    useDirectusBase: () => 'http://localhost:8055'
}));

// Mock Directus SDK
const mockReadByQuery = vi.fn();
vi.mock('@directus/sdk', () => {
    return {
        Directus: vi.fn(() => ({
            items: () => ({
                readByQuery: mockReadByQuery
            })
        }))
    };
});

describe('useStats', () => {
    it('should initialize with default values', () => {
        const { userBorrowed, userLent, totalItems } = useStats();
        expect(userBorrowed.value).toBe(0);
        expect(userLent.value).toBe(0);
        expect(totalItems.value).toBe(0);
    });

    it('should fetch user stats correctly', async () => {
        const { fetchUserStats, userBorrowed, userLent, totalItems } = useStats();

        // Mock responses
        mockReadByQuery
            .mockResolvedValueOnce({ data: [{}, {}] }) // Borrowed: 2 items
            .mockResolvedValueOnce({ data: [{ statut: 'Rendu', debut: '2023-01-01' }] }) // Lent: 1 item
            .mockResolvedValueOnce({ data: [{}, {}, {}] }); // Total items: 3 items

        await fetchUserStats('user-123');

        expect(userBorrowed.value).toBe(2);
        expect(userLent.value).toBe(1);
        expect(totalItems.value).toBe(3);
    });
});
