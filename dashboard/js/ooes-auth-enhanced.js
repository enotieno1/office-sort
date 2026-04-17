// Enhanced Authentication Module with Supabase Integration
const OOES_AUTH_ENHANCED = {
  // Supabase Configuration
  SUPABASE_URL: 'https://oghowrilrhummzvrljdt.supabase.co',
  SUPABASE_KEY: 'sb_publishable_WReuIZP0Pp2mJOJ691GOLA_5Uwf50wQ',
  
  // Session Management
  SESSION_KEY: 'ooesSession',
  SESSION_DURATION: 28800000, // 8 hours
  
  // Initialization
  init: function() {
    if (window.supabase) {
      this.supabase = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
    }
  },
  
  // Enhanced Login with Validation
  login: async function(email, password) {
    try {
      // Input Validation
      if (!this.validateEmail(email)) {
        return { error: 'Invalid email format', success: false };
      }
      
      if (!this.validatePassword(password)) {
        return { error: 'Password must be at least 8 characters with uppercase, lowercase, and numbers', success: false };
      }
      
      // Check demo accounts first
      const demoUser = this.checkDemoAccount(email, password);
      if (demoUser) {
        return this.createSession(demoUser);
      }
      
      // Check registered users in localStorage (production would use Supabase)
      const registered = JSON.parse(localStorage.getItem('ooesRegistered') || '[]');
      const user = registered.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return { error: 'User not found', success: false };
      }
      
      // Password verification (in production, use bcrypt)
      const passwordHash = this.hashPassword(password);
      if (user.passwordHash !== passwordHash) {
        return { error: 'Invalid password', success: false };
      }
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      localStorage.setItem('ooesRegistered', JSON.stringify(registered));
      
      return this.createSession(user);
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Login failed: ' + error.message, success: false };
    }
  },
  
  // Enhanced Registration with Validation
  register: async function(firstName, lastName, email, password, company = 'Default') {
    try {
      // Validation
      if (!firstName || !lastName) {
        return { error: 'First and last names are required', success: false };
      }
      
      if (!this.validateEmail(email)) {
        return { error: 'Invalid email format', success: false };
      }
      
      if (!this.validatePassword(password)) {
        return { error: 'Password must be at least 8 characters with uppercase, lowercase, and numbers', success: false };
      }
      
      // Check if user already exists
      const registered = JSON.parse(localStorage.getItem('ooesRegistered') || '[]');
      if (registered.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { error: 'Email already registered', success: false };
      }
      
      // Create new user
      const newUser = {
        id: 'user_' + Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        passwordHash: this.hashPassword(password),
        company: company,
        role: 'viewer',
        permissions: this.ROLE_PERMISSIONS['viewer'],
        createdAt: new Date().toISOString(),
        lastLogin: null,
        status: 'active',
        emailVerified: false
      };
      
      // Save to localStorage
      registered.push(newUser);
      localStorage.setItem('ooesRegistered', JSON.stringify(registered));
      
      // Create session
      return this.createSession({
        email: newUser.email,
        name: firstName + ' ' + lastName,
        role: newUser.role
      });
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Registration failed: ' + error.message, success: false };
    }
  },
  
  // Email Validation
  validateEmail: function(email) {
    const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return regex.test(email);
  },
  
  // Password Validation
  validatePassword: function(password) {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  },
  
  // Simple Password Hash (for demo - use bcrypt in production)
  hashPassword: function(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash);
  },
  
  // Demo Account Check
  checkDemoAccount: function(email, password) {
    const demoAccounts = [
      { email: 'admin@ooes.co.ke', password: 'Admin@2024', name: 'Admin User', role: 'admin' },
      { email: 'manager@ooes.co.ke', password: 'Manager@2024', name: 'Office Manager', role: 'manager' },
      { email: 'demo@ooes.co.ke', password: 'Demo@2024', name: 'Demo User', role: 'viewer' }
    ];
    
    return demoAccounts.find(a => 
      a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
  },
  
  // Session Management
  createSession: function(user) {
    const session = {
      email: user.email,
      name: user.name,
      role: user.role || 'viewer',
      expires: Date.now() + this.SESSION_DURATION,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { success: true, session: session };
  },
  
  getSession: function() {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      
      // Check session expiration
      if (Date.now() > session.expires) {
        this.logout(false);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Session error:', error);
      return null;
    }
  },
  
  isLoggedIn: function() {
    return this.getSession() !== null;
  },
  
  logout: function(redirect = true) {
    localStorage.removeItem(this.SESSION_KEY);
    if (redirect) {
      window.location.href = '/dashboard/auth.html';
    }
  },
  
  // Authorization
  requireAuth: function() {
    if (!this.isLoggedIn()) {
      window.location.replace('/dashboard/auth.html');
      return false;
    }
    return true;
  },
  
  // Role-Based Access Control
  ROLE_PERMISSIONS: {
    admin: {
      canEdit: true,
      canDelete: true,
      canViewFinance: true,
      canManageUsers: true,
      canViewReports: true,
      canConfigureSystem: true
    },
    manager: {
      canEdit: true,
      canDelete: false,
      canViewFinance: true,
      canManageUsers: false,
      canViewReports: true,
      canConfigureSystem: false
    },
    viewer: {
      canEdit: false,
      canDelete: false,
      canViewFinance: false,
      canManageUsers: false,
      canViewReports: false,
      canConfigureSystem: false
    }
  },
  
  getRole: function() {
    const session = this.getSession();
    return session ? session.role : 'viewer';
  },
  
  can: function(permission) {
    const role = this.getRole();
    const permissions = this.ROLE_PERMISSIONS[role] || this.ROLE_PERMISSIONS.viewer;
    return permissions[permission] === true;
  },
  
  hasPermission: function(requiredPermission) {
    if (!this.isLoggedIn()) return false;
    return this.can(requiredPermission);
  },
  
  // UI Helpers
  renderUserInfo: function() {
    const session = this.getSession();
    if (!session) return;
    
    document.querySelectorAll('[data-user-name]').forEach(el => {
      el.textContent = session.name;
    });
    
    document.querySelectorAll('[data-user-email]').forEach(el => {
      el.textContent = session.email;
    });
    
    document.querySelectorAll('[data-user-role]').forEach(el => {
      el.textContent = session.role.charAt(0).toUpperCase() + session.role.slice(1);
    });
  },
  
  // Security: Check Auth on Page Load
  enforceAuth: function() {
    if (!window.location.pathname.includes('auth.html')) {
      document.addEventListener('DOMContentLoaded', () => {
        if (this.requireAuth()) {
          this.renderUserInfo();
        }
      });
    }
  }
};

// Initialize Enhanced Auth
OOES_AUTH_ENHANCED.init();
OOES_AUTH_ENHANCED.enforceAuth();
