class NotificationManager {
  constructor() {
    this.socket = io();
    this.notifications = [];
    this.unreadCount = 0;
    this.initialize();
  }

  initialize() {
    this.setupSocketListeners();
    this.setupUI();
    this.loadNotifications();
  }

  setupSocketListeners() {
    this.socket.on('notification', (notification) => {
      this.addNotification(notification);
      this.showNotificationPopup(notification);
    });

    // Register user with socket
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.socket.emit('register-user', userId);
    }
  }

  setupUI() {
    // Create notification bell icon
    const bell = document.createElement('div');
    bell.className = 'notification-bell';
    bell.innerHTML = `
      <i class="fas fa-bell"></i>
      <span class="notification-badge">0</span>
    `;
    document.body.appendChild(bell);

    // Create notification panel
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.style.display = 'none';
    document.body.appendChild(panel);

    bell.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') {
        this.markAllAsRead();
      }
    });
  }

  async loadNotifications() {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const notifications = await response.json();
      
      this.notifications = notifications;
      this.updateNotificationPanel();
      this.updateUnreadCount();
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  addNotification(notification) {
    this.notifications.unshift(notification);
    this.updateNotificationPanel();
    this.updateUnreadCount();
  }

  updateNotificationPanel() {
    const panel = document.querySelector('.notification-panel');
    panel.innerHTML = this.notifications.length ? this.notifications.map(notification => `
      <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
           data-id="${notification._id}">
        <div class="notification-priority ${notification.priority}"></div>
        <div class="notification-content">
          <h4>${notification.title}</h4>
          <p>${notification.message}</p>
          <small>${new Date(notification.createdAt).toLocaleString()}</small>
        </div>
      </div>
    `).join('') : '<div class="no-notifications">No notifications</div>';

    // Add click handlers
    panel.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => this.handleNotificationClick(item.dataset.id));
    });
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    badge.textContent = this.unreadCount;
    badge.style.display = this.unreadCount ? 'block' : 'none';
  }

  async markAllAsRead() {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      this.notifications.forEach(n => n.read = true);
      this.updateNotificationPanel();
      this.updateUnreadCount();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }

  async handleNotificationClick(notificationId) {
    try {
      await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const notification = this.notifications.find(n => n._id === notificationId);
      if (notification) {
        notification.read = true;
        this.updateNotificationPanel();
        this.updateUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  showNotificationPopup(notification) {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icon.png'
          });
        }
      });
    }
  }
}

// Initialize notification manager
document.addEventListener('DOMContentLoaded', () => {
  window.notificationManager = new NotificationManager();
}); 