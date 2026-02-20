#!/usr/bin/env python3
"""
OOES Navigation Fix Script
Automatically scans and fixes navigation issues across all HTML files
"""

import os
import re
import json
from datetime import datetime

class NavigationFixer:
    def __init__(self):
        self.dashboard_dir = 'C:\\Users\\HP\\CascadeProjects\\office-sort\\dashboard'
        self.issues_found = []
        self.issues_fixed = []
        
    def scan_all_files(self):
        """Scan all HTML files for navigation issues"""
        print("Scanning all HTML files for navigation issues...")
        
        html_files = [f for f in os.listdir(self.dashboard_dir) if f.endswith('.html')]
        
        for html_file in html_files:
            self.scan_file(html_file)
        
        print(f"Scan complete. Found {len(self.issues_found)} issues.")
        return self.issues_found
    
    def scan_file(self, filename):
        """Scan a single HTML file for issues"""
        filepath = os.path.join(self.dashboard_dir, filename)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for missing functions
            self.check_missing_functions(content, filename)
            
            # Check for broken links
            self.check_broken_links(content, filename)
            
            # Check for missing CSS
            self.check_missing_css(content, filename)
            
            # Check for form issues
            self.check_form_issues(content, filename)
            
        except Exception as e:
            self.issues_found.append({
                'file': filename,
                'type': 'file_error',
                'issue': f'Cannot read file: {str(e)}',
                'fix': 'Check file permissions and encoding'
            })
    
    def check_missing_functions(self, content, filename):
        """Check for missing navigation functions"""
        required_functions = [
            'goBack()',
            'showNotification(',
            'closeModal(',
            'openModal(',
            'navigateToPage(',
            'navigateToSection('
        ]
        
        # Skip index.html as it may not need all functions
        if filename == 'index.html':
            required_functions = ['goBack()', 'showNotification(']
        
        for func in required_functions:
            if func not in content:
                self.issues_found.append({
                    'file': filename,
                    'type': 'missing_function',
                    'issue': f'Missing function: {func}',
                    'fix': f'Add {func} function implementation'
                })
    
    def check_broken_links(self, content, filename):
        """Check for broken internal links"""
        # Find all href attributes
        href_pattern = r'href="([^"]+)"'
        links = re.findall(href_pattern, content)
        
        for link in links:
            if link.endswith('.html') and link != filename:
                link_path = os.path.join(self.dashboard_dir, link)
                if not os.path.exists(link_path):
                    self.issues_found.append({
                        'file': filename,
                        'type': 'broken_link',
                        'issue': f'Broken link to: {link}',
                        'fix': f'Create {link} or update link'
                    })
    
    def check_missing_css(self, content, filename):
        """Check for missing CSS frameworks"""
        if 'tailwindcss' not in content:
            self.issues_found.append({
                'file': filename,
                'type': 'missing_css',
                'issue': 'Missing Tailwind CSS',
                'fix': 'Add Tailwind CSS CDN link'
            })
        
        if 'font-awesome' not in content:
            self.issues_found.append({
                'file': filename,
                'type': 'missing_css',
                'issue': 'Missing Font Awesome',
                'fix': 'Add Font Awesome CDN link'
            })
    
    def check_form_issues(self, content, filename):
        """Check for form validation issues"""
        # Find all forms
        form_pattern = r'<form[^>]*>(.*?)</form>'
        forms = re.findall(form_pattern, content, re.DOTALL)
        
        for form in forms:
            if 'onsubmit' not in form and 'method' not in form:
                self.issues_found.append({
                    'file': filename,
                    'type': 'form_issue',
                    'issue': 'Form without submission handler',
                    'fix': 'Add onsubmit handler or method attribute'
                })
    
    def fix_all_issues(self):
        """Fix all identified issues"""
        print("Fixing navigation issues...")
        
        html_files = [f for f in os.listdir(self.dashboard_dir) if f.endswith('.html')]
        
        for html_file in html_files:
            self.fix_file(html_file)
        
        print(f"Fixed {len(self.issues_fixed)} issues.")
        return self.issues_fixed
    
    def fix_file(self, filename):
        """Fix issues in a single file"""
        filepath = os.path.join(self.dashboard_dir, filename)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix missing functions
            content = self.fix_missing_functions_in_content(content, filename)
            
            # Fix missing CSS
            content = self.fix_missing_css_in_content(content, filename)
            
            # Fix form issues
            content = self.fix_form_issues_in_content(content, filename)
            
            # Write back if changed
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.issues_fixed.append(filename)
                print(f"  Fixed: {filename}")
        
        except Exception as e:
            print(f"  Error fixing {filename}: {str(e)}")
    
    def fix_missing_functions_in_content(self, content, filename):
        """Add missing functions to content"""
        # Check if script tag exists
        if '<script>' not in content:
            # Add script tag before closing body
            content = content.replace('</body>', '\n    <script>\n        // Navigation functions will be added here\n    </script>\n</body>')
        
        # Check if functions already exist
        functions_to_add = []
        
        if 'goBack()' not in content:
            functions_to_add.append('''
        function goBack() {
            window.location.href = 'index.html';
        }''')
        
        if 'showNotification(' not in content:
            functions_to_add.append('''
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
                type === 'success' ? 'bg-green-500 text-white' :
                type === 'error' ? 'bg-red-500 text-white' :
                type === 'warning' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'
            }`;
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${
                        type === 'success' ? 'fa-check-circle' :
                        type === 'error' ? 'fa-exclamation-circle' :
                        type === 'warning' ? 'fa-exclamation-triangle' :
                        'fa-info-circle'
                    } mr-3"></i>
                    <div class="font-medium">${message}</div>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }''')
        
        if 'closeModal(' not in content:
            functions_to_add.append('''
        function closeModal(element) {
            const modal = element ? element.closest('.modal, .fixed') : document.querySelector('.modal.active, .fixed.inset-0');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        }''')
        
        # Add functions before closing script tag
        if functions_to_add:
            script_end = content.rfind('</script>')
            if script_end != -1:
                content = content[:script_end] + '\n'.join(functions_to_add) + '\n' + content[script_end:]
        
        return content
    
    def fix_missing_css_in_content(self, content, filename):
        """Add missing CSS frameworks"""
        # Check head tag
        if '<head>' in content:
            head_end = content.find('</head>')
            if head_end != -1:
                additions = []
                
                if 'tailwindcss' not in content:
                    additions.append('    <script src="https://cdn.tailwindcss.com"></script>')
                
                if 'font-awesome' not in content:
                    additions.append('    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">')
                
                if additions:
                    # Add before closing head tag
                    content = content[:head_end] + '\n'.join(additions) + '\n' + content[head_end:]
        
        return content
    
    def fix_form_issues_in_content(self, content, filename):
        """Fix form validation issues"""
        # Add basic form validation
        content = re.sub(
            r'<form([^>]*)>',
            r'<form\1 onsubmit="return validateForm(this)">',
            content
        )
        
        # Add validation function if not present
        if 'validateForm(' not in content:
            script_end = content.rfind('</script>')
            if script_end != -1:
                validation_function = '''
        function validateForm(form) {
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            for (let input of inputs) {
                if (!input.value.trim()) {
                    showNotification(`Please fill in ${input.name || 'the required field'}`, 'error');
                    input.focus();
                    return false;
                }
            }
            showNotification('Form submitted successfully!', 'success');
            return true;
        }'''
                content = content[:script_end] + validation_function + '\n' + content[script_end:]
        
        return content
    
    def generate_report(self):
        """Generate a detailed report of all issues and fixes"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'scan_summary': {
                'total_issues_found': len(self.issues_found),
                'total_issues_fixed': len(self.issues_fixed),
                'files_scanned': len([f for f in os.listdir(self.dashboard_dir) if f.endswith('.html')])
            },
            'issues_found': self.issues_found,
            'issues_fixed': self.issues_fixed,
            'recommendations': self.get_recommendations()
        }
        
        # Save report
        report_path = os.path.join(self.dashboard_dir, 'navigation-fix-report.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"Report saved to: {report_path}")
        return report
    
    def get_recommendations(self):
        """Get recommendations based on issues found"""
        recommendations = []
        
        issue_types = [issue['type'] for issue in self.issues_found]
        
        if 'missing_function' in issue_types:
            recommendations.append("Consider creating a shared navigation.js file for common functions")
        
        if 'broken_link' in issue_types:
            recommendations.append("Create a sitemap or navigation index to track all pages")
        
        if 'missing_css' in issue_types:
            recommendations.append("Use a base template to ensure consistent CSS inclusion")
        
        if 'form_issue' in issue_types:
            recommendations.append("Implement consistent form validation across all pages")
        
        return recommendations

def main():
    """Main execution function"""
    print("OOES Navigation Fix Tool")
    print("=" * 50)
    
    fixer = NavigationFixer()
    
    # Scan for issues
    issues = fixer.scan_all_files()
    
    if issues:
        print("\nIssues Found:")
        for issue in issues[:10]:  # Show first 10 issues
            print(f"  {issue['file']}: {issue['issue']}")
        
        if len(issues) > 10:
            print(f"  ... and {len(issues) - 10} more issues")
        
        # Automatically fix issues
        print(f"\nAutomatically fixing {len(issues)} issues...")
        fixer.fix_all_issues()
        print("\nIssues fixed successfully!")
        
        # Generate report
        fixer.generate_report()
        
    else:
        print("No navigation issues found!")

if __name__ == "__main__":
    main()
