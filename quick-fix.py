#!/usr/bin/env python3
"""
Quick Navigation Fix Script
Fast fix for common navigation issues
"""

import os
import sys

def quick_fix():
    """Quick fix for navigation issues"""
    print("Quick Navigation Fix")
    print("-" * 20)
    
    dashboard_dir = 'C:\\Users\\HP\\CascadeProjects\\office-sort\\dashboard'
    
    # Common functions to add
    common_functions = '''
        function goBack() {
            window.location.href = 'index.html';
        }
        
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
        }
        
        function closeModal(element) {
            const modal = element ? element.closest('.modal, .fixed') : document.querySelector('.modal.active, .fixed.inset-0');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        }
    '''
    
    html_files = [f for f in os.listdir(dashboard_dir) if f.endswith('.html')]
    
    for html_file in html_files:
        filepath = os.path.join(dashboard_dir, html_file)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if functions are missing
            if 'goBack()' not in content or 'showNotification(' not in content:
                # Add script tag if missing
                if '<script>' not in content:
                    content = content.replace('</body>', '\n    <script>\n' + common_functions + '\n    </script>\n</body>')
                else:
                    # Add functions before closing script
                    script_end = content.rfind('</script>')
                    if script_end != -1:
                        content = content[:script_end] + common_functions + '\n' + content[script_end:]
                
                # Write back
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"Fixed: {html_file}")
        
        except Exception as e:
            print(f"Error with {html_file}: {e}")
    
    print("Quick fix complete!")

if __name__ == "__main__":
    quick_fix()
