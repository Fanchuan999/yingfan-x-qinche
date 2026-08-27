const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const page = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('period reminder explains denied permission without claiming that the browser is closed', () => {
  assert.match(page, /提醒：通知权限未允许，请在浏览器的网站设置中允许通知后刷新。/);
  assert.match(page, /button\.textContent = '到浏览器设置开启';/);
  assert.match(page, /提醒：会在网站打开或回到前台时检查/);
  assert.doesNotMatch(page, /提醒：已在浏览器中关闭|button\.textContent = '浏览器已关闭';/);
});
