// 当整个页面加载完成后，调用此函数
window.addEventListener('load', () => {
  initServiceWorker(); // 初始化服务工作线程
  updatePrompt(); // 更新通知提示的显示状态
});

// 用于更新通知权限请求链接（提示）的显示状态
function updatePrompt() {
  // 检查浏览器是否支持 Notification API
  if ('Notification' in window) {
    // 如果用户已授予或拒绝权限，则隐藏提示链接
    if (Notification.permission == 'granted' || Notification.permission == 'denied') {
      promptLink.style.display = 'none';
    } else {
      // 否则显示提示链接
      promptLink.style.display = 'block';
    }
  }
}

// 当用户点击启用通知的链接时调用此函数
function onPromptClick() {
  // 再次检查浏览器是否支持 Notification API
  if ('Notification' in window) {
    // 请求通知权限
    Notification.requestPermission().then((permission) => {
      // 更新提示链接的显示状态
      updatePrompt();
      // 如果用户同意，打印日志并初始化服务
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        init();
      } else if (permission === 'denied') {
        // 如果用户拒绝，打印警告日志
        console.warn('Notification permission denied.');
      }
    });
  }
}

// VAPID 公钥常量
const vapidPublicKey = VAPID_PUBLIC_KEY;

// 异步函数，用于初始化服务工作线程
async function initServiceWorker() {
  // 检查浏览器是否支持 serviceWorker
  if ('serviceWorker' in navigator) {
    // 注册 serviceWorker
    const swRegistration = await navigator.serviceWorker.register('sw.js');
    // 获取现有订阅（如果有的话）
    const subscription = await swRegistration.pushManager.getSubscription();
    // 如果用户已经订阅
    if (subscription) {
      console.log('User is already subscribed:', subscription);
      // 将订阅信息发送到服务器
      sendSubscriptionToServer(subscription);
    } else {
      // 否则创建新的订阅
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true, // 表示推送通知是对用户可见的
        applicationServerKey: vapidPublicKey // 使用 VAPID 公钥
      });
      console.log('User subscribed:', subscription);
      // 将新的订阅信息发送到服务器
      sendSubscriptionToServer(subscription);
    }
  } else {
    // 如果浏览器不支持 serviceWorker，打印警告日志
    console.warn('Service worker is not supported');
  }
}

// 发送订阅信息到服务器端
function sendSubscriptionToServer(subscription) {
  // 使用 fetch API 向服务器发送 POST 请求
  fetch('/subscribe', {
    method: 'post',
    body: JSON.stringify(subscription), // 将订阅对象转换为 JSON 字符串
    headers: { 'content-type': 'application/json' } // 设置请求头
  });
}
