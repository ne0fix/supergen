'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/src/viewmodels/admin.vm';
import { ChevronRight, LogOut } from 'lucide-react';

export default function AdminTopBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { admin, loading } = useAdmin();

    const generateBreadcrumbs = () => {
        const pathParts = pathname.split('/').filter(part => part);
        
        if (pathParts.length > 0 && pathParts[0] === 'admin') {
            pathParts.shift(); // Remove "admin"
        }

        const breadcrumbs: { href: string; label: string }[] = [];
        let currentPath = '/admin';

        pathParts.forEach((part, index) => {
            currentPath += `/${part}`;
            // Simple capitalization, could be improved with a map for custom labels
            const label = part.charAt(0).toUpperCase() + part.slice(1);
            breadcrumbs.push({ href: currentPath, label });
        });

        return [{ href: '/admin/dashboard', label: 'Dashboard' }, ...breadcrumbs];
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Optionally show an error message to the user
        }
    };

    return (
        <header className="h-16 flex-shrink-0 flex items-center justify-between bg-white border-b border-gray-200 px-6">
            <div className="flex items-center text-sm">
                <Link href="/admin/dashboard" className="font-medium text-gray-500 hover:text-gray-900">
                    Dashboard
                </Link>
                {pathname.split('/').filter(p => p && p !== 'admin').map((part, index, arr) => {
                    const href = `/admin/${arr.slice(0, index + 1).join('/')}`;
                    const label = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
                    const isLast = index === arr.length - 1;
                    
                    return (
                        <div key={href} className="flex items-center">
                            <ChevronRight size={16} className="text-gray-400 mx-1" />
                            <Link 
                                href={href} 
                                className={`font-medium ${isLast ? 'text-gray-800' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {label}
                            </Link>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-4">
                {loading ? (
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                ) : (
                    <span className="text-sm font-medium text-gray-700">Olá, {admin?.nome || 'Admin'}</span>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                    title="Sair"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
}
