// Define allowed routes per role
export const rolePermissions = {
    ADMIN: '*', // All routes
    GERENTE: '*', // All routes except /dashboard/equipe
    CAIXA: [
        '/dashboard/pedidos',
        '/dashboard/pedidos/pdv',
        '/dashboard/pedidos/revisao',
        '/dashboard/pedidos/devolucao',
        '/dashboard/pedidos/vendidas-periodo',
    ],
    ESTOQUISTA: [
        '/dashboard/consultas/grade',
        '/dashboard/consultas/analise-estoque',
        '/dashboard/cadastros/pecas-cadastro',
    ]
};

// Restricted routes that only ADMIN can access
const adminOnlyRoutes = ['/dashboard/equipe'];

export function canAccessRoute(role, pathname) {
    if (!role) return false;

    // Admin can access everything
    if (role === 'ADMIN') return true;

    // Check admin-only routes
    if (adminOnlyRoutes.some(r => pathname.startsWith(r))) {
        return role === 'ADMIN';
    }

    // GERENTE can access everything except admin-only
    if (role === 'GERENTE') return true;

    // Check specific role permissions
    const allowed = rolePermissions[role];
    if (!allowed) return false;
    if (allowed === '*') return true;

    // Check if pathname matches any allowed route
    return allowed.some(route => pathname.startsWith(route));
}

export function getDefaultRoute(role) {
    switch (role) {
        case 'CAIXA':
            return '/dashboard/pedidos/pdv';
        case 'ESTOQUISTA':
            return '/dashboard/consultas/grade';
        default:
            return '/dashboard';
    }
}
