// Enhanced Navigation for OOES - Clean Implementation
// This script enhances the existing OOES dashboard with deep navigation architecture

class EnhancedNavigation {
    constructor() {
        this.currentRoute = window.location.pathname;
        this.navigationStructure = this.initializeNavigationStructure();
        this.init();
    }

    initializeNavigationStructure() {
        return {
            dashboard: {
                title: 'Dashboard',
                icon: 'fas fa-tachometer-alt',
                path: '/dashboard',
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

    init() {
        this.setupNavigation();
        this.setupBreadcrumbs();
        this.setupSearch();
        this.setupCrossModuleLinks();
        this.setupMobileMenu();
        this.setupSidebarToggle();
    }

    setupNavigation() {
        // Create enhanced sidebar if it doesn't exist
        if (!document.getElementById('enhanced-navigation')) {
            this.createEnhancedSidebar();
        }
    }

    createEnhancedSidebar() {
        const existingNav = document.querySelector('.sidebar-nav');
        if (!existingNav) return;

        // Insert enhanced navigation after existing nav
        const enhancedNav = document.createElement('div');
        enhancedNav.id = 'enhanced-navigation';
        enhancedNav.className = 'hidden';
        enhancedNav.innerHTML = this.generateNavigationHTML();

        existingNav.parentNode.insertBefore(enhancedNav, existingNav.nextSibling);
    }

    generateNavigationHTML() {
        let html = '<div class="space-y-2">';
        
        Object.entries(this.navigationStructure).forEach(([key, module]) => {
            if (this.hasPermission(key)) {
                html += this.generateModuleHTML(key, module);
            }
        });

        html += '</div>';
        return html;
    }

    generateModuleHTML(key, module) {
        const hasSubmodules = Object.keys(module.submodules).length > 0;
        
        return `
            <div class="nav-module" data-module="${key}">
                <div class="nav-item ${this.isModuleActive(key) ? 'active' : ''}" 
                     data-route="${module.path}">
                    <i class="${module.icon} mr-3"></i>
                    <span>${module.title}</span>
                    ${hasSubmodules ? '<i class="fas fa-chevron-down ml-auto"></i>' : ''}
                </div>
                ${hasSubmodules ? this.generateSubmodulesHTML(key, module.submodules) : ''}
            </div>
        `;
    }

    generateSubmodulesHTML(parentKey, submodules) {
        let html = '<div class="submodules hidden" data-parent="${parentKey}">';
        
        Object.entries(submodules).forEach(([key, submodule]) => {
            if (this.hasPermission(`${parentKey}/${key}`)) {
                html += `
                    <div class="nav-item submodule-item ${this.isSubmoduleActive(parentKey, key) ? 'active' : ''}" 
                         data-route="${submodule.path}">
                        <i class="fas fa-circle text-xs mr-3"></i>
                        <span>${submodule.title}</span>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }

    hasPermission(route) {
        // Simple permission check - in production, this would check user roles
        return true; // For demo, allow all routes
    }

    isModuleActive(moduleKey) {
        return this.currentRoute.startsWith('/' + moduleKey) || 
               this.currentRoute.startsWith('/dashboard'); // Dashboard is always active
    }

    isSubmoduleActive(moduleKey, submoduleKey) {
        const module = this.navigationStructure[moduleKey];
        if (!module) return false;
        
        const submodule = module.submodules[submoduleKey];
        if (!submodule) return false;
        
        return this.currentRoute.startsWith(submodule.path);
    }

    setupBreadcrumbs() {
        // Add breadcrumb container if it doesn't exist
        if (!document.getElementById('enhanced-breadcrumbs')) {
            const header = document.querySelector('.enterprise-nav');
            if (header) {
                const breadcrumbContainer = document.createElement('div');
                breadcrumbContainer.id = 'enhanced-breadcrumbs';
                breadcrumbContainer.className = 'px-6 py-3';
                breadcrumbContainer.innerHTML = this.generateBreadcrumbs();
                header.appendChild(breadcrumbContainer);
            }
        }
    }

    generateBreadcrumbs() {
        const breadcrumbs = this.calculateBreadcrumbs();
        return `
            <nav class="flex items-center text-sm">
                ${breadcrumbs.map((crumb, index) => `
                    ${index > 0 ? '<i class="fas fa-chevron-right mx-2 text-gray-400"></i>' : ''}
                    ${index === breadcrumbs.length - 1 ? 
                        '<span class="text-gray-700 font-medium">' + crumb.title + '</span>' :
                        '<a href="#" class="breadcrumb-item" data-route="' + crumb.path + '">' + crumb.title + '</a>'
                    }
                `).join('')}
            </nav>
        `;
    }

    calculateBreadcrumbs() {
        const pathParts = this.currentRoute.split('/').filter(p => p);
        const breadcrumbs = [{ title: 'Home', path: '/dashboard' }];
        
        if (pathParts.length >= 2) {
            const moduleKey = pathParts[0];
            const module = this.navigationStructure[moduleKey];
            
            if (module) {
                breadcrumbs.push({
                    title: module.title,
                    path: module.path
                });
                
                if (pathParts.length >= 3) {
                    const submoduleKey = pathParts[1];
                    const submodule = module.submodules[submoduleKey];
                    
                    if (submodule) {
                        breadcrumbs.push({
                            title: submodule.title,
                            path: submodule.path
                        });
                        
                        // Add deep page if exists
                        if (pathParts.length >= 4) {
                            const deepPage = pathParts[2];
                            breadcrumbs.push({
                                title: this.formatDeepPageTitle(deepPage),
                                path: submodule.path + '/' + deepPage
                            });
                        }
                    }
                }
            }
        }
        
        return breadcrumbs;
    }

    formatDeepPageTitle(deepPage) {
        return deepPage.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    setupSearch() {
        // Add enhanced search functionality
        const existingSearch = document.querySelector('.nav-search');
        if (existingSearch && !document.getElementById('enhanced-search')) {
            const searchContainer = document.createElement('div');
            searchContainer.id = 'enhanced-search';
            searchContainer.innerHTML = `
                <div class="relative">
                    <input type="text" 
                           id="global-search-enhanced" 
                           placeholder="Search across all modules..."
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    <div id="search-results-enhanced" class="search-dropdown hidden"></div>
                </div>
            `;
            
            existingSearch.parentNode.replaceChild(searchContainer, existingSearch);
            this.setupSearchFunctionality();
        }
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('global-search-enhanced');
        const searchResults = document.getElementById('search-results-enhanced');
        
        if (!searchInput || !searchResults) return;

        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.toLowerCase();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    this.performSearch(query);
                }, 300);
            } else {
                this.hideSearchResults();
            }
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#enhanced-search')) {
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
        const searchResults = document.getElementById('search-results-enhanced');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="p-4 text-gray-500">No results found</div>';
        } else {
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
            searchResults.classList.add('slide-in');

            // Add click handlers
            searchResults.querySelectorAll('[data-route]').forEach(item => {
                item.addEventListener('click', () => {
                    this.navigateTo(item.dataset.route);
                    this.hideSearchResults();
                });
            });
        }
    }

    hideSearchResults() {
        const searchResults = document.getElementById('search-results-enhanced');
        if (searchResults) {
            searchResults.classList.remove('slide-in');
            setTimeout(() => {
                searchResults.style.display = 'none';
            }, 300);
        }
    }

    setupCrossModuleLinks() {
        // Add cross-module link functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-cross-link]')) {
                e.preventDefault();
                this.handleCrossLinkClick(e.target);
            }
        });
    }

    handleCrossLinkClick(element) {
        const linkData = JSON.parse(element.dataset.crossLink);
        const targetRoute = this.buildCrossModuleRoute(linkData.targetModule, linkData.targetSubmodule, linkData.entityId);
        this.navigateTo(targetRoute);
    }

    buildCrossModuleRoute(targetModule, targetSubmodule, entityId) {
        const module = this.navigationStructure[targetModule];
        if (!module) return '/dashboard';
        
        const submodule = module.submodules[targetSubmodule];
        if (!submodule) return module.path;
        
        let route = submodule.path;
        if (entityId) {
            route = route.replace('{entityId}', entityId);
        }
        
        return route;
    }

    navigateTo(route) {
        this.currentRoute = route;
        window.location.hash = route;
        this.updateBreadcrumbs();
        this.updateActiveNavigation();
        
        // Simulate content loading
        this.loadContent(route);
    }

    loadContent(route) {
        const contentArea = document.getElementById('main-content');
        if (!contentArea) return;

        // Show loading state
        contentArea.innerHTML = this.getLoadingSkeleton();

        // Simulate content loading
        setTimeout(() => {
            const content = this.generateContentForRoute(route);
            contentArea.innerHTML = content;
            this.initializePageComponents();
        }, 300);
    }

    generateContentForRoute(route) {
        const pathParts = route.split('/').filter(p => p);
        const moduleKey = pathParts[0];
        const submoduleKey = pathParts[1];
        
        if (moduleKey === 'hr' && submoduleKey === 'employees') {
            return this.generateEmployeeProfileContent();
        } else if (moduleKey === 'finance' && submoduleKey === 'invoices') {
            return this.generateInvoiceContent();
        } else {
            return `
                <div class="bg-white rounded-lg shadow p-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">Module Content</h1>
                    <p class="text-gray-600">Content for ${route}</p>
                    <div class="mt-6">
                        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                                onclick="window.location.href='/dashboard'">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            `;
        }
    }

    generateEmployeeProfileContent() {
        return `
            <div class="max-w-6xl mx-auto">
                <!-- Profile Header -->
                <div class="bg-white rounded-lg shadow-sm mb-6">
                    <div class="p-6">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center">
                                <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                    JD
                                </div>
                                <div class="ml-6">
                                    <h1 class="text-2xl font-bold text-gray-900">John Doe</h1>
                                    <p class="text-gray-600">Senior Software Engineer</p>
                                    <div class="flex items-center mt-2 space-x-4">
                                        <span class="text-sm text-gray-500">
                                            <i class="fas fa-building mr-1"></i> IT Department
                                        </span>
                                        <span class="text-sm text-gray-500">
                                            <i class="fas fa-envelope mr-1"></i> john.doe@company.com
                                        </span>
                                        <span class="text-sm text-gray-500">
                                            <i class="fas fa-phone mr-1"></i> +1 (555) 123-4567
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <i class="fas fa-edit mr-2"></i> Edit Profile
                                </button>
                                <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    <i class="fas fa-download mr-2"></i> Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Cross-Module Links -->
                <div class="bg-blue-50 rounded-lg p-4 mb-6">
                    <h4 class="text-sm font-semibold text-blue-900 mb-2">Related Information</h4>
                    <div class="flex flex-wrap gap-2">
                        <button class="px-3 py-1 bg-white text-blue-700 rounded-full text-sm hover:bg-blue-100" 
                                data-cross-link='{"targetModule": "finance", "targetSubmodule": "payroll"}'>
                            <i class="fas fa-dollar-sign mr-1"></i> View Salary History
                        </button>
                        <button class="px-3 py-1 bg-white text-blue-700 rounded-full text-sm hover:bg-blue-100" 
                                data-cross-link='{"targetModule": "documents", "targetSubmodule": "contracts"}'>
                            <i class="fas fa-file-contract mr-1"></i> View Contract
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateInvoiceContent() {
        return `
            <div class="max-w-6xl mx-auto">
                <div class="bg-white rounded-lg shadow-sm mb-6">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h1 class="text-2xl font-bold text-gray-900">Invoice #INV002</h1>
                            <div class="flex space-x-2">
                                <span class="status-badge bg-yellow-100 text-yellow-800">Pending</span>
                                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <i class="fas fa-edit mr-2"></i> Edit
                                </button>
                                <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    <i class="fas fa-download mr-2"></i> PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Invoice Details -->
                <div class="p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Bill To</h3>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <p class="font-medium">XYZ Ltd</p>
                                <p class="text-sm text-gray-600">456 Business Ave</p>
                                <p class="text-sm text-gray-600">City, State 12345</p>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">Invoice Date:</span>
                                        <span class="font-medium">December 10, 2024</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">Due Date:</span>
                                        <span class="font-medium">January 10, 2025</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">PO Number:</span>
                                        <span class="font-medium">PO-2024-0156</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cross-Module Links -->
                    <div class="bg-blue-50 rounded-lg p-4">
                        <h4 class="text-sm font-semibold text-blue-900 mb-2">Related Information</h4>
                        <div class="flex flex-wrap gap-2">
                            <button class="px-3 py-1 bg-white text-blue-700 rounded-full text-sm hover:bg-blue-100" 
                                    data-cross-link='{"targetModule": "crm", "targetSubmodule": "clients"}'>
                                <i class="fas fa-handshake mr-1"></i> Client Details
                            </button>
                            <button class="px-3 py-1 bg-white text-blue-700 rounded-full text-sm hover:bg-blue-100">
                                <i class="fas fa-chart-line mr-1"></i> Payment History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getLoadingSkeleton() {
        return `
            <div class="animate-pulse">
                <div class="space-y-4">
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div class="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                </div>
            </div>
        `;
    }

    updateBreadcrumbs() {
        const breadcrumbContainer = document.getElementById('enhanced-breadcrumbs');
        if (breadcrumbContainer) {
            breadcrumbContainer.innerHTML = this.generateBreadcrumbs();
        }
    }

    updateActiveNavigation() {
        // Update active states in navigation
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

    setupMobileMenu() {
        // Enhanced mobile menu functionality
        const menuButton = document.getElementById('mobile-menu-button');
        const existingNav = document.querySelector('.sidebar-nav');
        
        if (menuButton && existingNav) {
            menuButton.addEventListener('click', () => {
                existingNav.classList.toggle('active');
            });
        }
    }

    setupSidebarToggle() {
        // Enhanced sidebar toggle
        const toggleButton = document.getElementById('sidebar-toggle');
        const existingNav = document.querySelector('.sidebar-nav');
        
        if (toggleButton && existingNav) {
            toggleButton.addEventListener('click', () => {
                existingNav.classList.toggle('collapsed');
            });
        }
    }

    initializePageComponents() {
        // Initialize any page-specific components
        this.setupTabNavigation();
        this.setupTooltips();
        this.setupModals();
    }

    setupTabNavigation() {
        // Tab navigation for deep pages
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tab-button')) {
                e.preventDefault();
                this.switchTab(e.target);
            }
        });
    }

    switchTab(tabButton) {
        const tabContainer = tabButton.closest('.tab-container');
        if (!tabContainer) return;

        const tabName = tabButton.dataset.tab;
        const allTabs = tabContainer.querySelectorAll('.tab-button');
        const allContents = tabContainer.querySelectorAll('.tab-content');

        // Update button states
        allTabs.forEach(tab => tab.classList.remove('active'));
        tabButton.classList.add('active');

        // Update content visibility
        allContents.forEach(content => content.classList.remove('active'));
        const targetContent = tabContainer.querySelector(`#${tabName}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    setupTooltips() {
        // Tooltip functionality
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('[title]')) {
                this.showTooltip(e.target);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('[title]')) {
                this.hideTooltip();
            }
        });
    }

    showTooltip(element) {
        // Simple tooltip implementation
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute bg-gray-800 text-white text-xs rounded px-2 py-1 z-50';
        tooltip.textContent = element.getAttribute('title');
        tooltip.style.bottom = '100%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(tooltip);
        element._tooltip = tooltip;
    }

    hideTooltip() {
        const tooltip = document.querySelector('[role="tooltip"]');
        if (tooltip) {
            tooltip.remove();
        }
    }

    setupModals() {
        // Modal functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal]')) {
                this.openModal(e.target.dataset.modal);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-overlay') || e.target.matches('.modal-close')) {
                this.closeModal();
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.querySelector('.modal-overlay');
        
        if (modal && overlay) {
            modal.style.display = 'block';
            overlay.style.display = 'flex';
        }
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        const overlay = document.querySelector('.modal-overlay');
        
        modals.forEach(modal => modal.style.display = 'none');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedNavigation = new EnhancedNavigation();
});
