// OOES Deep Navigation Architecture
class NavigationCore {
    constructor() {
        this.currentRoute = '';
        this.breadcrumbs = [];
        this.userRole = this.getUserRole();
        this.navigationStructure = this.initializeNavigationStructure();
        this.searchIndex = new Map();
        this.routeHistory = [];
        this.init();
    }

    initializeNavigationStructure() {
        return {
            dashboard: {
                title: 'Dashboard',
                icon: 'fas fa-tachometer-alt',
                path: '/dashboard',
                order: 1,
                submodules: {
                    overview: { title: 'Overview', path: '/dashboard/overview' },
                    analytics: { title: 'Analytics', path: '/dashboard/analytics' },
                    reports: { title: 'Reports', path: '/dashboard/reports' },
                    alerts: { title: 'Alerts', path: '/dashboard/alerts' }
                }
            },
            hr: {
                title: 'HR Management',
                icon: 'fas fa-users',
                path: '/hr',
                order: 2,
                submodules: {
                    employees: {
                        title: 'Employee Directory',
                        path: '/hr/employees',
                        deepPages: {
                            profile: '/hr/employees/{employeeId}',
                            performance: '/hr/employees/{employeeId}/performance',
                            attendance: '/hr/employees/{employeeId}/attendance',
                            salary: '/hr/employees/{employeeId}/salary',
                            documents: '/hr/employees/{employeeId}/documents',
                            disciplinary: '/hr/employees/{employeeId}/disciplinary'
                        }
                    },
                    attendance: { title: 'Attendance', path: '/hr/attendance' },
                    leave: { title: 'Leave Requests', path: '/hr/leave' },
                    payroll: { title: 'Payroll', path: '/hr/payroll' },
                    performance: { title: 'Performance Reviews', path: '/hr/performance' },
                    contracts: { title: 'Contracts', path: '/hr/contracts' },
                    reports: { title: 'HR Reports', path: '/hr/reports' }
                }
            },
            finance: {
                title: 'Finance',
                icon: 'fas fa-dollar-sign',
                path: '/finance',
                order: 3,
                submodules: {
                    budget: { title: 'Budget Management', path: '/finance/budget' },
                    invoices: {
                        title: 'Invoices',
                        path: '/finance/invoices',
                        deepPages: {
                            view: '/finance/invoices/{invoiceId}',
                            edit: '/finance/invoices/{invoiceId}/edit',
                            payment: '/finance/invoices/{invoiceId}/payment'
                        }
                    },
                    expenses: { title: 'Expenses', path: '/finance/expenses' },
                    payroll: { title: 'Payroll Records', path: '/finance/payroll' },
                    reports: { title: 'Financial Reports', path: '/finance/reports' },
                    tax: { title: 'Tax Management', path: '/finance/tax' }
                }
            },
            procurement: {
                title: 'Procurement',
                icon: 'fas fa-shopping-cart',
                path: '/procurement',
                order: 4,
                submodules: {
                    requests: {
                        title: 'Purchase Requests',
                        path: '/procurement/requests',
                        deepPages: {
                            view: '/procurement/requests/{requestId}',
                            approve: '/procurement/requests/{requestId}/approve',
                            budget: '/procurement/requests/{requestId}/budget'
                        }
                    },
                    vendors: { title: 'Vendor Management', path: '/procurement/vendors' },
                    contracts: { title: 'Contracts', path: '/procurement/contracts' },
                    inventory: { title: 'Inventory', path: '/procurement/inventory' },
                    reports: { title: 'Procurement Reports', path: '/procurement/reports' }
                }
            },
            crm: {
                title: 'CRM',
                icon: 'fas fa-handshake',
                path: '/crm',
                order: 5,
                submodules: {
                    clients: {
                        title: 'Client Management',
                        path: '/crm/clients',
                        deepPages: {
                            profile: '/crm/clients/{clientId}',
                            invoices: '/crm/clients/{clientId}/invoices',
                            projects: '/crm/clients/{clientId}/projects',
                            communications: '/crm/clients/{clientId}/communications'
                        }
                    },
                    leads: { title: 'Lead Management', path: '/crm/leads' },
                    sales: { title: 'Sales Pipeline', path: '/crm/sales' },
                    support: { title: 'Support Tickets', path: '/crm/support' },
                    analytics: { title: 'CRM Analytics', path: '/crm/analytics' }
                }
            },
            documents: {
                title: 'Document Management',
                icon: 'fas fa-file-alt',
                path: '/documents',
                order: 6,
                submodules: {
                    repository: { title: 'Document Repository', path: '/documents/repository' },
                    templates: { title: 'Templates', path: '/documents/templates' },
                    workflows: { title: 'Workflows', path: '/documents/workflows' },
                    versioning: { title: 'Version Control', path: '/documents/versioning' },
                    compliance: { title: 'Compliance Docs', path: '/documents/compliance' }
                }
            },
            compliance: {
                title: 'Compliance',
                icon: 'fas fa-shield-alt',
                path: '/compliance',
                order: 7,
                submodules: {
                    policies: { title: 'Policies', path: '/compliance/policies' },
                    audits: { title: 'Audits', path: '/compliance/audits' },
                    risk: { title: 'Risk Management', path: '/compliance/risk' },
                    training: { title: 'Training', path: '/compliance/training' },
                    reports: { title: 'Compliance Reports', path: '/compliance/reports' }
                }
            },
            analytics: {
                title: 'Analytics',
                icon: 'fas fa-chart-line',
                path: '/analytics',
                order: 8,
                submodules: {
                    dashboard: { title: 'Analytics Dashboard', path: '/analytics/dashboard' },
                    reports: { title: 'Custom Reports', path: '/analytics/reports' },
                    kpi: { title: 'KPI Tracking', path: '/analytics/kpi' },
                    forecasting: { title: 'Forecasting', path: '/analytics/forecasting' },
                    data: { title: 'Data Management', path: '/analytics/data' }
                }
            },
            settings: {
                title: 'Settings',
                icon: 'fas fa-cog',
                path: '/settings',
                order: 9,
                submodules: {
                    users: { title: 'User Management', path: '/settings/users' },
                    roles: { title: 'Role Management', path: '/settings/roles' },
                    system: { title: 'System Settings', path: '/settings/system' },
                    integrations: { title: 'Integrations', path: '/settings/integrations' },
                    security: { title: 'Security', path: '/settings/security' }
                }
            }
        };
    }

    getUserRole() {
        // In production, this would come from authentication system
        return localStorage.getItem('userRole') || 'admin';
    }

    init() {
        this.setupRouting();
        this.setupSearch();
        this.renderNavigation();
        this.updateBreadcrumbs();
        this.setupCrossModuleLinks();
    }

    setupRouting() {
        window.addEventListener('popstate', (e) => {
            this.handleRouteChange(window.location.pathname);
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.dataset.route;
                this.navigateTo(route);
            }
        });
    }

    navigateTo(route, params = {}) {
        if (!this.hasPermission(route)) {
            this.showPermissionDenied();
            return;
        }

        this.routeHistory.push(this.currentRoute);
        this.currentRoute = route;
        
        // Update URL
        history.pushState({ route }, '', route);
        
        // Handle route change
        this.handleRouteChange(route, params);
        this.updateBreadcrumbs();
        this.updateActiveNavigation();
    }

    handleRouteChange(route, params = {}) {
        // Parse route and load appropriate content
        const routeParts = route.split('/').filter(p => p);
        const module = routeParts[0];
        const submodule = routeParts[1];
        const deepPage = routeParts[2];
        const entityId = routeParts[3];

        // Load content based on route
        this.loadContent(module, submodule, deepPage, entityId, params);
    }

    loadContent(module, submodule, deepPage, entityId, params) {
        const contentArea = document.getElementById('main-content');
        if (!contentArea) return;

        // Show loading state
        contentArea.innerHTML = this.getLoadingSkeleton();

        // Simulate content loading
        setTimeout(() => {
            const content = this.generateContent(module, submodule, deepPage, entityId);
            contentArea.innerHTML = content;
            this.initializePageComponents();
        }, 300);
    }

    generateContent(module, submodule, deepPage, entityId) {
        const moduleData = this.navigationStructure[module];
        if (!moduleData) return this.get404Content();

        const submoduleData = moduleData.submodules[submodule];
        if (!submoduleData) return this.get404Content();

        let title = submoduleData.title;
        let content = `<h1 class="text-3xl font-bold mb-6">${title}</h1>`;

        if (deepPage && entityId) {
            content += this.generateDeepPageContent(module, submodule, deepPage, entityId);
        } else {
            content += this.generateSubmoduleContent(module, submodule);
        }

        return content;
    }

    generateSubmoduleContent(module, submodule) {
        // Generate content based on module and submodule
        const templates = {
            'hr/employees': this.getEmployeeDirectoryContent(),
            'finance/invoices': this.getInvoicesContent(),
            'procurement/requests': this.getProcurementRequestsContent(),
            'crm/clients': this.getClientManagementContent()
        };

        const key = `${module}/${submodule}`;
        return templates[key] || this.getDefaultContent();
    }

    updateBreadcrumbs() {
        const breadcrumbContainer = document.getElementById('breadcrumbs');
        if (!breadcrumbContainer) return;

        const breadcrumbs = this.generateBreadcrumbs();
        breadcrumbContainer.innerHTML = this.renderBreadcrumbs(breadcrumbs);
    }

    generateBreadcrumbs() {
        const routeParts = this.currentRoute.split('/').filter(p => p);
        const breadcrumbs = [{ title: 'Home', path: '/dashboard' }];

        let currentPath = '';
        for (let i = 0; i < routeParts.length; i++) {
            const part = routeParts[i];
            currentPath += '/' + part;

            if (i === 0) {
                const module = this.navigationStructure[part];
                if (module) {
                    breadcrumbs.push({ title: module.title, path: module.path });
                }
            } else if (i === 1) {
                const module = this.navigationStructure[routeParts[0]];
                if (module && module.submodules[part]) {
                    breadcrumbs.push({ 
                        title: module.submodules[part].title, 
                        path: module.submodules[part].path 
                    });
                }
            } else {
                // Handle deep pages
                const title = this.formatBreadcrumbTitle(part);
                breadcrumbs.push({ title, path: currentPath });
            }
        }

        return breadcrumbs;
    }

    renderBreadcrumbs(breadcrumbs) {
        return breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return `
                <li class="inline-flex items-center">
                    ${index > 0 ? '<i class="fas fa-chevron-right mx-2 text-gray-400"></i>' : ''}
                    ${isLast 
                        ? `<span class="text-gray-700 font-medium">${crumb.title}</span>`
                        : `<a href="#" data-route="${crumb.path}" class="text-blue-600 hover:text-blue-800 hover:underline">${crumb.title}</a>`
                    }
                </li>
            `;
        }).join('');
    }

    setupSearch() {
        const searchInput = document.getElementById('global-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query.length >= 2) {
                this.performSearch(query);
            } else {
                this.hideSearchResults();
            }
        });
    }

    performSearch(query) {
        const results = this.searchAcrossModules(query);
        this.displaySearchResults(results);
    }

    searchAcrossModules(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        Object.entries(this.navigationStructure).forEach(([moduleKey, module]) => {
            // Search module title
            if (module.title.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'module',
                    title: module.title,
                    path: module.path,
                    module: module.title
                });
            }

            // Search submodules
            Object.entries(module.submodules).forEach(([submoduleKey, submodule]) => {
                if (submodule.title.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        type: 'submodule',
                        title: submodule.title,
                        path: submodule.path,
                        module: module.title
                    });
                }
            });
        });

        return results.slice(0, 10);
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="p-4 text-gray-500">No results found</div>';
            return;
        }

        const html = results.map(result => `
            <div class="p-3 hover:bg-gray-50 cursor-pointer border-b" data-route="${result.path}">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="font-medium">${result.title}</div>
                        <div class="text-sm text-gray-500">${result.module}</div>
                    </div>
                    <i class="fas fa-arrow-right text-gray-400"></i>
                </div>
            </div>
        `).join('');

        searchResults.innerHTML = html;
        searchResults.style.display = 'block';

        // Add click handlers
        searchResults.querySelectorAll('[data-route]').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateTo(item.dataset.route);
                this.hideSearchResults();
            });
        });
    }

    hideSearchResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }

    setupCrossModuleLinks() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-cross-link]')) {
                e.preventDefault();
                const linkData = JSON.parse(e.target.dataset.crossLink);
                this.handleCrossModuleLink(linkData);
            }
        });
    }

    handleCrossModuleLink(linkData) {
        const { targetModule, targetSubmodule, entityId, params } = linkData;
        const route = this.buildCrossModuleRoute(targetModule, targetSubmodule, entityId);
        this.navigateTo(route, params);
    }

    buildCrossModuleRoute(module, submodule, entityId) {
        const moduleData = this.navigationStructure[module];
        if (!moduleData) return '/dashboard';

        const submoduleData = moduleData.submodules[submodule];
        if (!submoduleData) return moduleData.path;

        let route = submoduleData.path;
        if (entityId) {
            route = route.replace('{entityId}', entityId);
        }

        return route;
    }

    hasPermission(route) {
        // Implement role-based permission checking
        const restrictedRoutes = ['/settings/users', '/settings/roles', '/compliance/audits'];
        
        if (this.userRole === 'admin') return true;
        if (this.userRole === 'manager') return !restrictedRoutes.some(r => route.startsWith(r));
        if (this.userRole === 'user') return !route.startsWith('/settings') && !route.startsWith('/compliance');
        
        return false;
    }

    showPermissionDenied() {
        const contentArea = document.getElementById('main-content');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="flex items-center justify-center h-64">
                    <div class="text-center">
                        <i class="fas fa-lock text-6xl text-gray-300 mb-4"></i>
                        <h2 class="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
                        <p class="text-gray-500">You don't have permission to access this page.</p>
                    </div>
                </div>
            `;
        }
    }

    renderNavigation() {
        const navContainer = document.getElementById('main-navigation');
        if (!navContainer) return;

        const navHTML = this.generateNavigationHTML();
        navContainer.innerHTML = navHTML;
        this.setupNavigationEvents();
    }

    generateNavigationHTML() {
        const orderedModules = Object.entries(this.navigationStructure)
            .sort(([,a], [,b]) => a.order - b.order);

        return orderedModules.map(([key, module]) => {
            if (!this.hasPermission(module.path)) return '';

            const hasSubmodules = Object.keys(module.submodules).length > 0;
            
            return `
                <div class="nav-module" data-module="${key}">
                    <div class="nav-item ${this.isModuleActive(key) ? 'active' : ''}" 
                         data-route="${module.path}">
                        <i class="${module.icon} mr-3"></i>
                        <span>${module.title}</span>
                        ${hasSubmodules ? '<i class="fas fa-chevron-down ml-auto"></i>' : ''}
                    </div>
                    ${hasSubmodules ? this.generateSubmoduleHTML(key, module.submodules) : ''}
                </div>
            `;
        }).join('');
    }

    generateSubmoduleHTML(moduleKey, submodules) {
        return `
            <div class="submodules hidden" data-parent="${moduleKey}">
                ${Object.entries(submodules).map(([key, submodule]) => {
                    if (!this.hasPermission(submodule.path)) return '';
                    
                    return `
                        <div class="nav-item submodule-item ${this.isSubmoduleActive(moduleKey, key) ? 'active' : ''}" 
                             data-route="${submodule.path}">
                            <i class="fas fa-circle text-xs mr-3"></i>
                            <span>${submodule.title}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    setupNavigationEvents() {
        // Module expansion
        document.querySelectorAll('.nav-module > .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const moduleDiv = e.currentTarget.closest('.nav-module');
                const submodules = moduleDiv.querySelector('.submodules');
                
                if (submodules) {
                    submodules.classList.toggle('hidden');
                    const chevron = e.currentTarget.querySelector('.fa-chevron-down, .fa-chevron-up');
                    if (chevron) {
                        chevron.classList.toggle('fa-chevron-down');
                        chevron.classList.toggle('fa-chevron-up');
                    }
                }
            });
        });
    }

    isModuleActive(moduleKey) {
        return this.currentRoute.startsWith('/' + moduleKey);
    }

    isSubmoduleActive(moduleKey, submoduleKey) {
        const moduleData = this.navigationStructure[moduleKey];
        if (!moduleData) return false;
        
        const submoduleData = moduleData.submodules[submoduleKey];
        if (!submoduleData) return false;
        
        return this.currentRoute.startsWith(submoduleData.path);
    }

    updateActiveNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        document.querySelectorAll('.nav-item[data-route]').forEach(item => {
            const route = item.dataset.route;
            if (this.currentRoute.startsWith(route)) {
                item.classList.add('active');
            }
        });
    }

    // Content generation methods
    getEmployeeDirectoryContent() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${this.generateEmployeeCards()}
            </div>
        `;
    }

    generateEmployeeCards() {
        const employees = [
            { id: 1, name: 'John Doe', position: 'Software Engineer', department: 'IT' },
            { id: 2, name: 'Jane Smith', position: 'HR Manager', department: 'HR' },
            { id: 3, name: 'Mike Johnson', position: 'Financial Analyst', department: 'Finance' }
        ];

        return employees.map(emp => `
            <div class="bg-white rounded-lg shadow p-6 card-hover">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        ${emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div class="ml-4">
                        <h3 class="font-semibold">${emp.name}</h3>
                        <p class="text-gray-600">${emp.position}</p>
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">${emp.department}</span>
                    <button class="text-blue-600 hover:text-blue-800" 
                            data-route="/hr/employees/${emp.id}">
                        View Profile
                    </button>
                </div>
            </div>
        `).join('');
    }

    getInvoicesContent() {
        return `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6">
                    <h2 class="text-xl font-semibold mb-4">Recent Invoices</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${this.generateInvoiceRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    generateInvoiceRows() {
        const invoices = [
            { id: 'INV001', client: 'ABC Corp', amount: 5000, status: 'Paid' },
            { id: 'INV002', client: 'XYZ Ltd', amount: 7500, status: 'Pending' },
            { id: 'INV003', client: 'DEF Inc', amount: 3200, status: 'Overdue' }
        ];

        return invoices.map(inv => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${inv.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${inv.client}</td>
                <td class="px-6 py-4 whitespace-nowrap">$${inv.amount.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${
                        inv.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        inv.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">${inv.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="text-blue-600 hover:text-blue-800 mr-2" 
                            data-route="/finance/invoices/${inv.id}">
                        View
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getLoadingSkeleton() {
        return `
            <div class="animate-pulse">
                <div class="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div class="space-y-4">
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        `;
    }

    get404Content() {
        return `
            <div class="flex items-center justify-center h-64">
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle text-6xl text-yellow-400 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-700 mb-2">Page Not Found</h2>
                    <p class="text-gray-500 mb-4">The page you're looking for doesn't exist.</p>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                            data-route="/dashboard">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    getDefaultContent() {
        return `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Module Content</h2>
                <p class="text-gray-600">This is the default content for this module. Specific content will be implemented based on requirements.</p>
            </div>
        `;
    }

    formatBreadcrumbTitle(part) {
        return part.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    initializePageComponents() {
        // Initialize any page-specific components
        this.initializeTooltips();
        this.initializeModals();
        this.initializeForms();
    }

    initializeTooltips() {
        // Tooltip initialization
    }

    initializeModals() {
        // Modal initialization
    }

    initializeForms() {
        // Form initialization
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.navigationCore = new NavigationCore();
});
