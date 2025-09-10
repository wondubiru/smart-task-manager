import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'actions' | 'view';
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService {
  private shortcuts: Shortcut[] = [];
  private isEnabled = true;

  constructor(private router: Router) {
    this.initializeShortcuts();
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.setupEventListeners();
    }
  }

  initializeShortcuts(): void {
    this.shortcuts = [
      // Navigation shortcuts
      {
        key: 't',
        ctrlKey: true,
        action: () => this.router.navigate(['/tasks']),
        description: 'Go to Tasks',
        category: 'navigation'
      },
      {
        key: 'a',
        ctrlKey: true,
        action: () => this.router.navigate(['/analytics']),
        description: 'Go to Analytics',
        category: 'navigation'
      },
      {
        key: 'n',
        ctrlKey: true,
        action: () => this.router.navigate(['/add-task']),
        description: 'New Task',
        category: 'actions'
      },
      {
        key: 'h',
        ctrlKey: true,
        action: () => this.router.navigate(['/']),
        description: 'Go Home',
        category: 'navigation'
      },
      
      // Action shortcuts
      {
        key: 's',
        ctrlKey: true,
        action: () => this.triggerSave(),
        description: 'Save/Export Data',
        category: 'actions'
      },
      {
        key: 'f',
        ctrlKey: true,
        action: () => this.focusSearch(),
        description: 'Focus Search',
        category: 'view'
      },
      {
        key: 'k',
        ctrlKey: true,
        action: () => this.showShortcutsHelp(),
        description: 'Show Shortcuts Help',
        category: 'view'
      },
      
      // Quick actions
      {
        key: 'Escape',
        action: () => this.handleEscape(),
        description: 'Close modals/Clear search',
        category: 'view'
      },
      {
        key: '/',
        action: () => this.focusSearch(),
        description: 'Quick Search',
        category: 'view'
      }
    ];
  }

  private setupEventListeners(): void {
    if (typeof document === 'undefined') return;
    
    document.addEventListener('keydown', (event) => {
      if (!this.isEnabled) return;
      
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        // Allow escape and some special shortcuts even in input fields
        if (event.key !== 'Escape' && !(event.ctrlKey && ['s', 'k'].includes(event.key))) {
          return;
        }
      }

      const matchingShortcut = this.shortcuts.find(shortcut => 
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.action();
      }
    });
  }

  private triggerSave(): void {
    // Try to find and trigger export functionality
    const exportBtn = document.querySelector('[data-export]') as HTMLElement;
    if (exportBtn) {
      exportBtn.click();
    } else {
      // Fallback: show notification
      this.showNotification('💾 Export feature available in Analytics page');
    }
  }

  private focusSearch(): void {
    const searchInput = document.querySelector('input[placeholder*="Search"], input[placeholder*="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  private handleEscape(): void {
    // Clear search if focused
    const searchInput = document.querySelector('input[placeholder*="Search"], input[placeholder*="search"]') as HTMLInputElement;
    if (searchInput && searchInput === document.activeElement) {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.blur();
      return;
    }

    // Close any modals or overlays
    const modal = document.querySelector('.modal, .overlay, .popup');
    if (modal) {
      const closeBtn = modal.querySelector('.close, [data-close]') as HTMLElement;
      if (closeBtn) {
        closeBtn.click();
      }
    }
  }

  showShortcutsHelp(): void {
    const helpContent = this.generateHelpContent();
    this.showModal('⌨️ Keyboard Shortcuts', helpContent);
  }

  private generateHelpContent(): string {
    const categories = {
      navigation: '🧭 Navigation',
      actions: '⚡ Actions', 
      view: '👁️ View'
    };

    let content = '<div class="shortcuts-help">';
    
    Object.entries(categories).forEach(([category, title]) => {
      const categoryShortcuts = this.shortcuts.filter(s => s.category === category);
      if (categoryShortcuts.length > 0) {
        content += `<div class="shortcut-category">`;
        content += `<h3>${title}</h3>`;
        content += `<div class="shortcuts-list">`;
        
        categoryShortcuts.forEach(shortcut => {
          const keys = [];
          if (shortcut.ctrlKey) keys.push('Ctrl');
          if (shortcut.altKey) keys.push('Alt');
          if (shortcut.shiftKey) keys.push('Shift');
          keys.push(shortcut.key === ' ' ? 'Space' : shortcut.key);
          
          content += `<div class="shortcut-item">`;
          content += `<span class="shortcut-keys">${keys.join(' + ')}</span>`;
          content += `<span class="shortcut-desc">${shortcut.description}</span>`;
          content += `</div>`;
        });
        
        content += `</div></div>`;
      }
    });
    
    content += '</div>';
    return content;
  }

  private showModal(title: string, content: string): void {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'shortcuts-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'shortcuts-modal';
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      margin: 20px;
    `;

    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1e293b; font-size: 1.5rem;">${title}</h2>
        <button class="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
      </div>
      ${content}
      <style>
        .shortcuts-help { font-family: 'Segoe UI', sans-serif; }
        .shortcut-category { margin-bottom: 24px; }
        .shortcut-category h3 { color: #3b82f6; margin: 0 0 12px 0; font-size: 1.1rem; }
        .shortcuts-list { display: grid; gap: 8px; }
        .shortcut-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 6px; }
        .shortcut-keys { font-family: monospace; background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; color: #475569; }
        .shortcut-desc { color: #64748b; }
      </style>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close handlers
    const closeModal = () => {
      document.body.removeChild(overlay);
    };

    modal.querySelector('.close-modal')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Close on escape
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  private showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    }, 3000);
  }

  public getShortcuts(): Shortcut[] {
    return this.shortcuts;
  }

  public enableShortcuts(): void {
    this.isEnabled = true;
  }

  public disableShortcuts(): void {
    this.isEnabled = false;
  }

  public isShortcutsEnabled(): boolean {
    return this.isEnabled;
  }
}
