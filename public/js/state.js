/**
 * Insigrow Industry Portal - Central State & Event Bus
 */

class AppState {
  constructor() {
    this.user = null;
    this.activeIndustry = 'fmcg'; // Default starting industry
    this.trials = {};
    this.industryData = null;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changeType) {
    for (const listener of this.listeners) {
      try {
        listener(this, changeType);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  setUser(user) {
    this.user = user;
    this.notify('user');
  }

  setTrials(trials) {
    this.trials = trials || {};
    this.notify('trials');
  }

  updateSingleTrial(industry, trialObj) {
    this.trials[industry] = trialObj;
    this.notify('trials');
  }

  setActiveIndustry(industry) {
    const valid = ['fmcg', 'ca', 'manufacturing', 'b2b'];
    if (valid.includes(industry)) {
      this.activeIndustry = industry;
      this.notify('activeIndustry');
    }
  }

  setIndustryData(data) {
    this.industryData = data;
    this.notify('industryData');
  }

  // Toast Notification System
  showToast(message, type = 'success', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconName = 'checkCircle';
    if (type === 'error') iconName = 'alertTriangle';
    if (type === 'info') iconName = 'sparkles';

    toast.innerHTML = `
      <div style="color: ${type === 'error' ? 'var(--color-rose)' : type === 'info' ? 'var(--color-primary)' : 'var(--color-emerald)'}; display: flex; align-items: center;">
        ${window.getIcon(iconName, 'icon')}
      </div>
      <div style="flex: 1; font-weight: 500;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }
}

window.appState = new AppState();

