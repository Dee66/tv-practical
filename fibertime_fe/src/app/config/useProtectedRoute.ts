import {usePathname, useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {protectedRoutes} from './protected-routes';
import {useAuth} from '../context/authContext';

export function useProtectedRoute() {
    const {isAuthenticated, loading} = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (loading) return; // Wait for loading to complete

        if (protectedRoutes.includes(pathname) && !isAuthenticated) {
            router.replace('/auth/login');
        }
    }, [isAuthenticated, pathname, router, loading]);
}