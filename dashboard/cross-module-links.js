// Cross-Module Linking System for OOES
class CrossModuleLinking {
    constructor(navigationCore) {
        this.navCore = navigationCore;
        this.linkMappings = this.initializeLinkMappings();
        this.setupLinkHandlers();
    }

    initializeLinkMappings() {
        return {
            // HR to Finance links
            'hr-employee-salary': {
                source: '/hr/employees/{employeeId}',
                target: '/finance/payroll/{employeeId}',
                label: 'View Salary History',
                icon: 'fas fa-dollar-sign'
            },
            'hr-employee-contract': {
                source: '/hr/employees/{employeeId}',
                target: '/documents/contracts/{employeeId}',
                label: 'View Contract',
                icon: 'fas fa-file-contract'
            },
            'hr-leave-approval': {
                source: '/hr/leave/{leaveId}',
                target: '/finance/leave-impact/{leaveId}',
                label: 'Financial Impact',
                icon: 'fas fa-calculator'
            },

            // Finance to HR links
            'finance-payroll-employee': {
                source: '/finance/payroll/{employeeId}',
                target: '/hr/employees/{employeeId}',
                label: 'Employee Profile',
                icon: 'fas fa-user'
            },
            'finance-invoice-client': {
                source: '/finance/invoices/{invoiceId}',
                target: '/crm/clients/{clientId}',
                label: 'Client Details',
                icon: 'fas fa-handshake'
            },

            // Procurement to Finance links
            'procurement-request-budget': {
                source: '/procurement/requests/{requestId}',
                target: '/finance/budget/{budgetId}',
                label: 'Budget Details',
                icon: 'fas fa-piggy-bank'
            },
            'procurement-vendor-contracts': {
                source: '/procurement/vendors/{vendorId}',
                target: '/documents/contracts/{vendorId}',
                label: 'Vendor Contracts',
                icon: 'fas fa-file-signature'
            },

            // CRM to Finance links
            'crm-client-invoices': {
                source: '/crm/clients/{clientId}',
                target: '/finance/invoices?client={clientId}',
                label: 'Client Invoices',
                icon: 'fas fa-file-invoice-dollar'
            },
            'crm-opportunity-budget': {
                source: '/crm/opportunities/{opportunityId}',
                target: '/finance/budget/{budgetId}',
                label: 'Opportunity Budget',
                icon: 'fas fa-chart-line'
            },

            // Document Management links
            'document-employee-hr': {
                source: '/documents/employee/{employeeId}',
                target: '/hr/employees/{employeeId}',
                label: 'Employee Profile',
                icon: 'fas fa-user'
            },
            'document-contract-procurement': {
                source: '/documents/contracts/{contractId}',
                target: '/procurement/contracts/{contractId}',
                label: 'Procurement Details',
                icon: 'fas fa-shopping-cart'
            },

            // Compliance links
            'compliance-audit-finance': {
                source: '/compliance/audits/{auditId}',
                target: '/finance/reports/{auditId}',
                label: 'Financial Reports',
                icon: 'fas fa-chart-bar'
            },
            'compliance-policy-hr': {
                source: '/compliance/policies/{policyId}',
                target: '/hr/policies/{policyId}',
                label: 'HR Implementation',
                icon: 'fas fa-users-cog'
            },

            // Analytics deep links
            'analytics-hr-metrics': {
                source: '/analytics/hr/{reportId}',
                target: '/hr/reports/{reportId}',
                label: 'HR Reports',
                icon: 'fas fa-chart-pie'
            },
            'analytics-finance-metrics': {
                source: '/analytics/finance/{reportId}',
                target: '/finance/reports/{reportId}',
                label: 'Financial Reports',
                icon: 'fas fa-chart-line'
            }
        };
    }

    setupLinkHandlers() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-cross-link]')) {
                e.preventDefault();
                this.handleCrossLinkClick(e.target);
            }
        });
    }

    handleCrossLinkClick(element) {
        const linkType = element.dataset.crossLink;
        const linkData = JSON.parse(element.dataset.crossLinkData || '{}');
        
        const mapping = this.linkMappings[linkType];
        if (!mapping) {
            console.warn(`No mapping found for cross-link type: ${linkType}`);
            return;
        }

        const targetRoute = this.buildTargetRoute(mapping.target, linkData);
        if (targetRoute) {
            this.navCore.navigateTo(targetRoute, linkData);
        }
    }

    buildTargetRoute(template, data) {
        let route = template;
        
        // Replace placeholders with actual data
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            route = route.replace(new RegExp(placeholder, 'g'), data[key]);
        });

        // Handle query parameters
        if (route.includes('?')) {
            const [path, queryString] = route.split('?');
            const params = new URLSearchParams(queryString);
            
            // Add additional context parameters
            params.append('ref', data.source || window.location.pathname);
            params.append('timestamp', Date.now());
            
            route = `${path}?${params.toString()}`;
        }

        return route;
    }

    generateCrossLinkHTML(linkType, data, className = '') {
        const mapping = this.linkMappings[linkType];
        if (!mapping) return '';

        return `
            <button 
                class="cross-module-link inline-flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors ${className}"
                data-cross-link="${linkType}"
                data-cross-link-data='${JSON.stringify(data)}'
                title="${mapping.label}"
            >
                <i class="${mapping.icon} mr-2"></i>
                ${mapping.label}
            </button>
        `;
    }

    generateContextualLinks(currentRoute, entityData) {
        const links = [];
        const routeParts = currentRoute.split('/').filter(p => p);
        
        // Determine context based on current route
        if (routeParts[0] === 'hr' && routeParts[1] === 'employees') {
            links.push(...this.getHREmployeeLinks(entityData));
        } else if (routeParts[0] === 'finance' && routeParts[1] === 'invoices') {
            links.push(...this.getFinanceInvoiceLinks(entityData));
        } else if (routeParts[0] === 'procurement' && routeParts[1] === 'requests') {
            links.push(...this.getProcurementRequestLinks(entityData));
        } else if (routeParts[0] === 'crm' && routeParts[1] === 'clients') {
            links.push(...this.getCRMClientLinks(entityData));
        }

        return links;
    }

    getHREmployeeLinks(employeeData) {
        const links = [];
        const { employeeId, department } = employeeData;

        links.push(this.generateCrossLinkHTML('hr-employee-salary', { employeeId }));
        links.push(this.generateCrossLinkHTML('hr-employee-contract', { employeeId }));
        
        if (department === 'Sales') {
            links.push(this.generateCrossLinkHTML('crm-client-invoices', { clientId: employeeId }));
        }

        return links;
    }

    getFinanceInvoiceLinks(invoiceData) {
        const links = [];
        const { invoiceId, clientId, vendorId } = invoiceData;

        if (clientId) {
            links.push(this.generateCrossLinkHTML('finance-invoice-client', { invoiceId, clientId }));
        }
        
        if (vendorId) {
            links.push(this.generateCrossLinkHTML('procurement-vendor-contracts', { vendorId }));
        }

        return links;
    }

    getProcurementRequestLinks(requestData) {
        const links = [];
        const { requestId, budgetId, vendorId } = requestData;

        links.push(this.generateCrossLinkHTML('procurement-request-budget', { requestId, budgetId }));
        
        if (vendorId) {
            links.push(this.generateCrossLinkHTML('procurement-vendor-contracts', { vendorId }));
        }

        return links;
    }

    getCRMClientLinks(clientData) {
        const links = [];
        const { clientId, contactId } = clientData;

        links.push(this.generateCrossLinkHTML('crm-client-invoices', { clientId }));
        
        if (contactId) {
            links.push(this.generateCrossLinkHTML('hr-employee-contract', { employeeId: contactId }));
        }

        return links;
    }

    // Smart link suggestions based on user context
    suggestRelatedLinks(currentRoute, entityData) {
        const suggestions = [];
        const userRole = this.navCore.userRole;
        
        // Role-based suggestions
        if (userRole === 'manager') {
            suggestions.push(...this.getManagerLinks(currentRoute, entityData));
        } else if (userRole === 'admin') {
            suggestions.push(...this.getAdminLinks(currentRoute, entityData));
        }

        return suggestions;
    }

    getManagerLinks(currentRoute, entityData) {
        const links = [];
        
        // Managers get approval links
        if (currentRoute.includes('/procurement/requests')) {
            links.push({
                type: 'approval',
                label: 'Approve Request',
                icon: 'fas fa-check-circle',
                action: 'approve'
            });
        }
        
        if (currentRoute.includes('/hr/leave')) {
            links.push({
                type: 'approval',
                label: 'Approve Leave',
                icon: 'fas fa-calendar-check',
                action: 'approve'
            });
        }

        return links;
    }

    getAdminLinks(currentRoute, entityData) {
        const links = [];
        
        // Admins get system-level links
        links.push({
            type: 'system',
            label: 'System Logs',
            icon: 'fas fa-list-alt',
            route: '/settings/logs'
        });
        
        links.push({
            type: 'system',
            label: 'Audit Trail',
            icon: 'fas fa-shield-alt',
            route: '/compliance/audit-trail'
        });

        return links;
    }

    // Create a floating action button for quick cross-module access
    createFloatingActionPanel(entityData) {
        const panel = document.createElement('div');
        panel.className = 'fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 z-50';
        panel.innerHTML = `
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
            <div class="space-y-2">
                ${this.generateContextualLinks(window.location.pathname, entityData).join('')}
            </div>
        `;

        return panel;
    }

    // Initialize cross-module linking for a page
    initializePageCrossLinks() {
        const currentRoute = this.navCore.currentRoute;
        const entityData = this.extractEntityDataFromPage();
        
        if (entityData) {
            // Add contextual links to the page
            this.addContextualLinksToPage(entityData);
            
            // Create floating action panel if needed
            if (this.shouldShowFloatingPanel(currentRoute)) {
                const panel = this.createFloatingActionPanel(entityData);
                document.body.appendChild(panel);
            }
        }
    }

    extractEntityDataFromPage() {
        // Extract entity data from the current page
        const entityData = {};
        
        // Look for common entity indicators
        const employeeId = this.extractFromPage('data-employee-id');
        const clientId = this.extractFromPage('data-client-id');
        const invoiceId = this.extractFromPage('data-invoice-id');
        const requestId = this.extractFromPage('data-request-id');
        
        if (employeeId) entityData.employeeId = employeeId;
        if (clientId) entityData.clientId = clientId;
        if (invoiceId) entityData.invoiceId = invoiceId;
        if (requestId) entityData.requestId = requestId;
        
        return Object.keys(entityData).length > 0 ? entityData : null;
    }

    extractFromPage(attribute) {
        const element = document.querySelector(`[${attribute}]`);
        return element ? element.getAttribute(attribute) : null;
    }

    addContextualLinksToPage(entityData) {
        const currentRoute = this.navCore.currentRoute;
        const links = this.generateContextualLinks(currentRoute, entityData);
        
        // Find appropriate place to insert links
        const linkContainer = document.querySelector('.contextual-links') || 
                             document.querySelector('.page-header') ||
                             document.querySelector('h1');
        
        if (linkContainer && links.length > 0) {
            const linksWrapper = document.createElement('div');
            linksWrapper.className = 'contextual-links mt-4 flex flex-wrap gap-2';
            linksWrapper.innerHTML = links.join('');
            
            linkContainer.parentNode.insertBefore(linksWrapper, linkContainer.nextSibling);
        }
    }

    shouldShowFloatingPanel(route) {
        // Show floating panel for detail pages
        return route.includes('/{') || // Contains entity ID placeholder
               route.match(/\/\d+$/); // Ends with numeric ID
    }

    // Track cross-module navigation for analytics
    trackCrossModuleNavigation(sourceRoute, targetRoute, linkType) {
        const trackingData = {
            timestamp: new Date().toISOString(),
            userRole: this.navCore.userRole,
            sourceRoute,
            targetRoute,
            linkType,
            userAgent: navigator.userAgent
        };

        // Send to analytics endpoint
        this.sendTrackingData(trackingData);
    }

    sendTrackingData(data) {
        // In production, send to analytics service
        console.log('Cross-module navigation tracked:', data);
        
        // Store locally for demo purposes
        const trackedData = JSON.parse(localStorage.getItem('crossModuleTracking') || '[]');
        trackedData.push(data);
        localStorage.setItem('crossModuleTracking', JSON.stringify(trackedData));
    }

    // Get navigation insights
    getNavigationInsights() {
        const trackedData = JSON.parse(localStorage.getItem('crossModuleTracking') || '[]');
        
        const insights = {
            totalCrossModuleNavigations: trackedData.length,
            mostUsedLinks: this.getMostUsedLinks(trackedData),
            popularRoutes: this.getPopularRoutes(trackedData),
            userRoleUsage: this.getUserRoleUsage(trackedData)
        };

        return insights;
    }

    getMostUsedLinks(data) {
        const linkCounts = {};
        data.forEach(item => {
            linkCounts[item.linkType] = (linkCounts[item.linkType] || 0) + 1;
        });

        return Object.entries(linkCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([linkType, count]) => ({ linkType, count }));
    }

    getPopularRoutes(data) {
        const routeCounts = {};
        data.forEach(item => {
            routeCounts[item.targetRoute] = (routeCounts[item.targetRoute] || 0) + 1;
        });

        return Object.entries(routeCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([route, count]) => ({ route, count }));
    }

    getUserRoleUsage(data) {
        const roleUsage = {};
        data.forEach(item => {
            roleUsage[item.userRole] = (roleUsage[item.userRole] || 0) + 1;
        });

        return roleUsage;
    }
}

// Initialize cross-module linking when navigation core is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.navigationCore) {
        window.crossModuleLinking = new CrossModuleLinking(window.navigationCore);
    }
});
