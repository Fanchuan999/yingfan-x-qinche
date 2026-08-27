(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.QincheFutureLetterAI = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';

  function getToneDescription(tone) {
    var descriptions = {
      watch: '克制、坚定地陪伴，像在安静守着对方。',
      focus: '冷静、有力量，提醒对方把注意力放回自己。',
      night: '适合夜晚阅读，温和地让对方先休息。',
      self: '真诚、平等，不替对方做决定。'
    };
    return descriptions[tone] || descriptions.watch;
  }

  function buildFutureLetterMessages(endpoint, nickname, tone) {
    var name = String(nickname || '').trim() || '小狸花';
    var systemPrompt = String(endpoint && endpoint.systemPrompt || '').trim();
    return [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: '请以系统提示词中的角色身份，写一封给' + name + '的中文来信。语气：' + getToneDescription(tone) + '字数约 300 字。不要标题、不要署名、不要解释，只写信正文。'
      }
    ];
  }

  function extractFutureLetterContent(payload) {
    var content = payload && payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
    return typeof content === 'string' ? content.trim() : '';
  }

  return {
    buildFutureLetterMessages: buildFutureLetterMessages,
    extractFutureLetterContent: extractFutureLetterContent
  };
});
