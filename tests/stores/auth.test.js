import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../stores/auth';

describe('Auth Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should initialize with default values', () => {
        const store = useAuthStore();
        expect(store.authenticated).toBe(false);
        expect(store.me).toEqual({});
    });

    it('should set authenticated status', () => {
        const store = useAuthStore();
        store.setAuthenticated(true);
        expect(store.authenticated).toBe(true);
    });

    it('should set user details', () => {
        const store = useAuthStore();
        const user = { id: '1', first_name: 'John', avatar: 'avatar.jpg' };
        store.setUser(user);
        expect(store.me).toEqual(user);
        expect(store.id).toBe('1');
        expect(store.first_name).toBe('John');
        expect(store.avatar).toBe('avatar.jpg');
    });

    it('should logout correctly', () => {
        const store = useAuthStore();
        store.setAuthenticated(true);
        store.setUser({ id: '1', first_name: 'John' });

        store.logout();

        expect(store.authenticated).toBe(false);
        expect(store.me).toEqual({});
        expect(store.id).toBe('');
    });
});
