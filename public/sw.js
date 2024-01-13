// 添加 'push' 事件监听器。当收到推送通知时，此事件会被触发。
self.addEventListener('push', (event) => {
  // 定义通知的选项
  const options = {
    // 设置通知的正文内容，来自推送数据
    body: event.data.text(),
    // 设置通知的图标
    icon: '/apple-touch-icon.png',
    // 设置通知的徽章（在一些平台上显示）
    badge: '/badge.png',
  };
  // 等待直到展示通知
  event.waitUntil(self.registration.showNotification('My App', options));
});

// 定义目标 URL，当用户点击通知时将跳转至此 URL
const targetUrl = 'http://localhost:3000';

// 添加 'notificationclick' 事件监听器。
// 当用户点击通知时，此事件会被触发。
self.addEventListener('notificationclick', (event) => {
  // 在控制台打印 'notificationclick'，用于调试
  self.console.log('notificationclick');
  // 关闭通知。在 Android 设备上需要显式关闭。
  event.notification.close();
  // 等待直到执行下面的代码
  event.waitUntil(
    // 匹配所有类型为 'window' 的客户端（即打开的标签页）
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // 遍历所有打开的窗口/标签页
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // 如果已经有一个窗口/标签页打开了目标 URL
        if (client.url === targetUrl && 'focus' in client) {
          // 则聚焦该窗口/标签页
          return client.focus();
        }
      }
      // 如果没有窗口/标签页打开了目标 URL
      if (clients.openWindow) {
        // 则在新窗口/标签页中打开目标 URL
        return clients.openWindow(targetUrl);
      }
    })
  );
});
