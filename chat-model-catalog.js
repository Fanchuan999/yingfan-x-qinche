(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.QincheChatModelCatalog = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';

  function buildModelsUrl(baseUrl) {
    var normalized = String(baseUrl || '').trim().replace(/\/+$/, '');
    if (!normalized) return '';
    if (/\/models$/i.test(normalized)) return normalized;
    if (/\/chat\/completions$/i.test(normalized)) return normalized.replace(/\/chat\/completions$/i, '/models');
    if (/\/v\d+$/i.test(normalized)) return normalized + '/models';
    return normalized + '/v1/models';
  }

  function listModelIds(payload) {
    var seen = {};
    var models = payload && Array.isArray(payload.data) ? payload.data : [];
    return models.reduce(function(ids, item) {
      var id = item && typeof item.id === 'string' ? item.id.trim() : '';
      if (!id || seen[id]) return ids;
      seen[id] = true;
      ids.push(id);
      return ids;
    }, []);
  }

  function filterOpenCodeGoChatModels(ids) {
    return (Array.isArray(ids) ? ids : []).filter(function(id) {
      return /^(glm|kimi|longcat|deepseek|mimo)-|^hy3(?:-|$)/i.test(id);
    });
  }

  function getSelectableModelCatalog(provider, payload) {
    var allModelIds = listModelIds(payload);
    var modelIds = provider === 'opencodeGo'
      ? filterOpenCodeGoChatModels(allModelIds)
      : allModelIds;
    return {
      modelIds: modelIds,
      unsupportedCount: allModelIds.length - modelIds.length
    };
  }

  function getProviderProfile(provider) {
    if (provider === 'opencodeGo') {
      return {
        defaultBaseUrl: 'https://opencode.ai/zen/go/v1',
        allowsModelDiscovery: true,
        requiresApiKey: true
      };
    }
    if (provider === 'custom') {
      return {
        defaultBaseUrl: 'http://127.0.0.1:11434/v1',
        allowsModelDiscovery: true,
        requiresApiKey: false
      };
    }
    return {
      defaultBaseUrl: '',
      allowsModelDiscovery: false,
      requiresApiKey: true
    };
  }

  function shouldApplyModelListResult(request, current) {
    return !!request && !!current && request.provider === current.provider && request.baseUrl === current.baseUrl;
  }

  function resolveChatEndpointConfig(config) {
    var cfg = config || {};
    var model = ['deepseek', 'doubao', 'opencodeGo', 'custom'].indexOf(cfg.model) !== -1 ? cfg.model : 'deepseek';
    var profile = getProviderProfile(model);
    var baseUrl = String(cfg.baseUrl || profile.defaultBaseUrl || (model === 'doubao' ? 'https://ark.cn-beijing.volces.com/api/v3' : 'https://api.deepseek.com')).trim();
    var needsSelectedModel = model === 'custom' || model === 'opencodeGo';
    var modelName = needsSelectedModel
      ? String(cfg.customModelName || '').trim()
      : (model === 'doubao' ? 'doubao-1.5-vision-pro-32k' : (cfg.reasoner ? 'deepseek-reasoner' : 'deepseek-chat'));
    return {
      baseUrl: baseUrl,
      modelName: modelName,
      requiresApiKey: profile.requiresApiKey,
      configError: needsSelectedModel && !modelName ? '请先选择或填写模型名' : ''
    };
  }

  function buildStoredChatConfig(values) {
    var input = values || {};
    var maxTokens = parseInt(input.maxTokens, 10);
    var contextMessages = parseInt(input.contextMessages, 10);
    var rememberApiKey = input.rememberApiKey === true;
    var cfg = {
      model: input.model || 'deepseek',
      baseUrl: String(input.baseUrl || '').trim(),
      customModelName: String(input.customModelName || '').trim(),
      rememberApiKey: rememberApiKey,
      reasoner: input.reasoner === true,
      maxTokens: maxTokens >= 256 && maxTokens <= 8192 ? maxTokens : 2048,
      contextMessages: [8, 12, 20].indexOf(contextMessages) !== -1 ? contextMessages : 12,
      systemPrompt: String(input.systemPrompt || '')
    };
    var apiKey = String(input.apiKey || '').trim();
    if (rememberApiKey && apiKey) cfg.apiKey = apiKey;
    return cfg;
  }

  return {
    buildModelsUrl: buildModelsUrl,
    listModelIds: listModelIds,
    filterOpenCodeGoChatModels: filterOpenCodeGoChatModels,
    getSelectableModelCatalog: getSelectableModelCatalog,
    getProviderProfile: getProviderProfile,
    shouldApplyModelListResult: shouldApplyModelListResult,
    resolveChatEndpointConfig: resolveChatEndpointConfig,
    buildStoredChatConfig: buildStoredChatConfig
  };
});
