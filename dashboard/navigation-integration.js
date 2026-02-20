// Simple integration script for OOES navigation enhancement
// This script adds the enhanced navigation to the existing dashboard

(function() {
    // Wait for the page to fully load
    function initializeEnhancedNavigation() {
        // Check if navigation-core.js is loaded
        if (typeof window.navigationCore !== 'undefined') {
            console.log('Navigation core loaded, initializing enhancements...');
            enhanceExistingNavigation();
        } else {
            console.log('Navigation core not found, retrying...');
            setTimeout(initializeEnhancedNavigation, 1000);
        }
    }

    function enhanceExistingNavigation() {
        // Add enhanced search functionality
        enhanceSearch();
        
        // Add breadcrumb enhancement
        enhanceBreadcrumbs();
        
        // Add cross-module linking
        addCrossModuleLinks();
        
        // Add mobile menu enhancements
        enhanceMobileMenu();
        
        // Add sidebar enhancements
        enhanceSidebar();
    }

    function enhanceSearch() {
        const existingSearch = document.querySelector('#globalSearch');
        if (existingSearch && !document.getElementById('enhanced-search-container')) {
            const searchContainer = document.createElement('div');
            searchContainer.id = 'enhanced-search-container';
            searchContainer.innerHTML = `
                <div class="relative">
                    <input type="text" 
                           id="enhanced-global-search" 
                           placeholder="Search across all modules..."
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    <div id="enhanced-search-results" class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto hidden"></div>
                </div>
            `;
            
            existingSearch.parentNode.replaceChild(searchContainer, existingSearch);
            setupEnhancedSearch();
        }
    }

    function setupEnhancedSearch() {
        const searchInput = document.getElementById('enhanced-global-search');
        const searchResults = document.getElementById('enhanced-search-results');
        
        if (!searchInput || !searchResults) return;

        let searchTimeout;
        
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const query = e.target.value.toLowerCase();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(function() {
                    performEnhancedSearch(query);
                }, 300);
            } else {
                hideEnhancedSearchResults();
            }
        });

        // Hide results when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#enhanced-search-container')) {
                hideEnhancedSearchResults();
            }
        });
    }

    function performEnhancedSearch(query) {
        // Simple search implementation
        const allModules = [
            { title: 'Dashboard', path: '/dashboard', type: 'module' },
            { title: 'HR Management', path: '/hr', type: 'module' },
            { title: 'Employee Directory', path: '/hr/employees', type: 'submodule', module: 'HR' },
            { title: 'Finance', path: '/finance', type: 'module' },
            { title: 'Invoices', path: '/finance/invoices', type: 'submodule', module: 'Finance' },
            { title: 'Procurement', path: '/procurement', type: 'module' },
            { title: 'CRM', path: '/crm', type: 'module' },
            { title: 'Document Management', path: '/documents', type: 'module' },
            { title: 'Settings', path: '/settings', type: 'module' }
        ];

        const results = allModules.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.path.toLowerCase().includes(query)
        ).slice(0, 8);

        displayEnhancedSearchResults(results);
    }

    function displayEnhancedSearchResults(results) {
        const searchResults = document.getElementById('enhanced-search-results');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="p-4 text-gray-500 text-center">No results found</div>';
        } else {
            const html = results.map(result => `
                <div class="p-3 hover:bg-gray-50 cursor-pointer border-b" onclick="navigateTo('${result.path}')">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium">${result.title}</div>
                            <div class="text-sm text-gray-500">${result.type}</div>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400"></i>
                    </div>
                </div>
            `).join('');
            
            searchResults.innerHTML = html;
            searchResults.classList.remove('hidden');
            searchResults.classList.add('slide-in');
        }
    }

    function hideEnhancedSearchResults() {
        const searchResults = document.getElementById('enhanced-search-results');
        if (searchResults) {
            searchResults.classList.remove('slide-in');
            setTimeout(() => {
                searchResults.classList.add('hidden');
            }, 300);
        }
    }

    function enhanceBreadcrumbs() {
        // Add enhanced breadcrumb functionality
        const existingBreadcrumb = document.querySelector('#breadcrumb');
        if (existingBreadcrumb && !document.getElementById('enhanced-breadcrumb')) {
            const enhancedBreadcrumb = document.createElement('div');
            enhancedBreadcrumb.id = 'enhanced-breadcrumb';
            enhancedBreadcrumb.className = 'px-6 py-3 text-sm';
            enhancedBreadcrumb.innerHTML = generateEnhancedBreadcrumbs();
            
            existingBreadcrumb.parentNode.replaceChild(enhancedBreadcrumb, existingBreadcrumb);
        }
    }

    function generateEnhancedBreadcrumbs() {
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/').filter(p => p);
        
        let breadcrumbs = [{ title: 'Home', path: '/dashboard' }];
        
        if (pathParts.length >= 2) {
            // Add module
            const moduleMap = {
                'hr': 'HR Management',
                'finance': 'Finance',
                'procurement': 'Procurement',
                'crm': 'CRM',
                'documents': 'Document Management',
                'compliance': 'Compliance',
                'analytics': 'Analytics',
                'settings': 'Settings'
            };
            
            if (moduleMap[pathParts[0]]) {
                breadcrumbs.push({
                    title: moduleMap[pathParts[0]],
                    path: '/' + pathParts[0]
                });
            }
            
            if (pathParts.length >= 3) {
                // Add submodule
                const submoduleMap = {
                    'employees': 'Employee Directory',
                    'invoices': 'Invoices',
                    'requests': 'Purchase Requests',
                    'clients': 'Client Management'
                };
                
                if (submoduleMap[pathParts[1]]) {
                    breadcrumbs.push({
                        title: submoduleMap[pathParts[1]],
                        path: '/' + pathParts[0] + '/' + pathParts[1]
                    });
                }
            }
        }
        
        return breadcrumbs.map((crumb, index) => `
            ${index > 0 ? '<i class="fas fa-chevron-right mx-2 text-gray-400"></i>' : ''}
            ${index === breadcrumbs.length - 1 ? 
                '<span class="text-gray-700 font-medium">' + crumb.title + '</span>' :
                '<a href="#" onclick="navigateTo(\\'' + crumb.path + '\\')" class="text-blue-600 hover:text-blue-800 hover:underline">' + crumb.title + '</a>'
            }
        `).join('');
    }

    function addCrossModuleLinks() {
        // Add cross-module linking to existing pages
        document.addEventListener('click', function(e) {
            if (e.target.matches('[data-cross-link]')) {
                e.preventDefault();
                const linkData = JSON.parse(e.target.dataset.crossLink);
                handleCrossModuleNavigation(linkData);
            }
        });
    }

    function handleCrossModuleNavigation(linkData) {
        // Simple cross-module navigation
        console.log('Cross-module navigation:', linkData);
        // In a real implementation, this would navigate to the target module
        // For demo, we'll just show an alert
        alert(`Navigating to ${linkData.targetModule}: ${linkData.targetSubmodule}`);
    }

    function enhanceMobileMenu() {
        // Enhance mobile menu functionality
        const mobileButton = document.getElementById('mobile-menu-btn');
        if (mobileButton) {
            mobileButton.addEventListener('click', function() {
                const sidebar = document.querySelector('.sidebar-nav');
                if (sidebar) {
                    sidebar.classList.toggle('active');
                }
            });
        }
    }

    function enhanceSidebar() {
        // Enhance sidebar functionality
        const sidebarToggle = document.getElementById('menu-icon');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                const sidebar = document.querySelector('.sidebar-nav');
                if (sidebar) {
                    sidebar.classList.toggle('collapsed');
                }
            });
        }
    }

    // Navigation function
    function navigateTo(path) {
        console.log('Navigating to:', path);
        // In a real implementation, this would use the routing system
        window.location.hash = path;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEnhancedNavigation);
    } else {
        initializeEnhancedNavigation();
    }
})();
