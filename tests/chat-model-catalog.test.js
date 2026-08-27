const test = require('node:test');
const assert = require('node:assert/strict');

let chatModelCatalog = {};
try {
  chatModelCatalog = require('../chat-model-catalog');
} catch (error) {}

test('buildModelsUrl resolves a provider base URL to its models endpoint', () => {
  assert.equal(
    chatModelCatalog.buildModelsUrl('https://opencode.ai/zen/go/v1'),
    'https://opencode.ai/zen/go/v1/models'
  );
  assert.equal(
    chatModelCatalog.buildModelsUrl('http://127.0.0.1:11434/v1/chat/completions'),
    'http://127.0.0.1:11434/v1/models'
  );
  assert.equal(
    chatModelCatalog.buildModelsUrl('https://api.example.com/'),
    'https://api.example.com/v1/models'
  );
});

test('listModelIds keeps usable model ids once and preserves the provider order', () => {
  assert.deepEqual(
    chatModelCatalog.listModelIds({
      object: 'list',
      data: [
        { id: 'kimi-k3', object: 'model' },
        { id: 'deepseek-v4-flash', object: 'model' },
        { id: 'kimi-k3', object: 'model' },
        { id: ' ', object: 'model' },
        { object: 'model' }
      ]
    }),
    ['kimi-k3', 'deepseek-v4-flash']
  );
});

test('filterOpenCodeGoChatModels omits models that require another protocol', () => {
  assert.deepEqual(
    chatModelCatalog.filterOpenCodeGoChatModels([
      'minimax-m3',
      'kimi-k3',
      'longcat-2.0',
      'glm-5.3',
      'deepseek-v4-flash',
      'qwen3.8-max',
      'mimo-v2.5',
      'hy3',
      'grok-4.6',
      'muse-spark-1.2-contributor'
    ]),
    ['kimi-k3', 'longcat-2.0', 'glm-5.3', 'deepseek-v4-flash', 'mimo-v2.5', 'hy3']
  );
});

test('getSelectableModelCatalog reports models excluded by the OpenCode Go protocol filter', () => {
  assert.deepEqual(
    chatModelCatalog.getSelectableModelCatalog('opencodeGo', {
      object: 'list',
      data: [
        { id: 'glm-5.3', object: 'model' },
        { id: 'gpt-5.6-luna', object: 'model' },
        { id: 'hy3', object: 'model' }
      ]
    }),
    { modelIds: ['glm-5.3', 'hy3'], unsupportedCount: 1 }
  );
});

test('getProviderProfile makes OpenCode Go a keyed discoverable chat provider', () => {
  assert.deepEqual(
    chatModelCatalog.getProviderProfile('opencodeGo'),
    {
      defaultBaseUrl: 'https://opencode.ai/zen/go/v1',
      allowsModelDiscovery: true,
      requiresApiKey: true
    }
  );
  assert.deepEqual(
    chatModelCatalog.getProviderProfile('custom'),
    {
      defaultBaseUrl: 'http://127.0.0.1:11434/v1',
      allowsModelDiscovery: true,
      requiresApiKey: false
    }
  );
});

test('shouldApplyModelListResult rejects a response after the provider or URL changes', () => {
  assert.equal(
    chatModelCatalog.shouldApplyModelListResult(
      { provider: 'opencodeGo', baseUrl: 'https://opencode.ai/zen/go/v1' },
      { provider: 'opencodeGo', baseUrl: 'https://opencode.ai/zen/go/v1' }
    ),
    true
  );
  assert.equal(
    chatModelCatalog.shouldApplyModelListResult(
      { provider: 'custom', baseUrl: 'https://example.com/v1' },
      { provider: 'opencodeGo', baseUrl: 'https://opencode.ai/zen/go/v1' }
    ),
    false
  );
  assert.equal(
    chatModelCatalog.shouldApplyModelListResult(
      { provider: 'custom', baseUrl: 'https://one.example/v1' },
      { provider: 'custom', baseUrl: 'https://two.example/v1' }
    ),
    false
  );
});

test('resolveChatEndpointConfig uses the selected OpenCode Go model and preserves custom providers', () => {
  assert.deepEqual(
    chatModelCatalog.resolveChatEndpointConfig({
      model: 'opencodeGo',
      customModelName: 'kimi-k3'
    }),
    {
      baseUrl: 'https://opencode.ai/zen/go/v1',
      modelName: 'kimi-k3',
      requiresApiKey: true,
      configError: ''
    }
  );
  assert.deepEqual(
    chatModelCatalog.resolveChatEndpointConfig({
      model: 'custom',
      baseUrl: 'http://127.0.0.1:11434/v1',
      customModelName: 'llama3.2'
    }),
    {
      baseUrl: 'http://127.0.0.1:11434/v1',
      modelName: 'llama3.2',
      requiresApiKey: false,
      configError: ''
    }
  );
});

test('buildStoredChatConfig omits the API key unless the user explicitly remembers it', () => {
  const transientConfig = chatModelCatalog.buildStoredChatConfig({
    model: 'opencodeGo',
    baseUrl: 'https://opencode.ai/zen/go/v1',
    customModelName: 'kimi-k3',
    apiKey: 'secret-key',
    rememberApiKey: false,
    reasoner: false,
    maxTokens: 2048,
    contextMessages: 12,
    systemPrompt: '你是秦彻。'
  });
  assert.equal(Object.hasOwn(transientConfig, 'apiKey'), false);

  const rememberedConfig = chatModelCatalog.buildStoredChatConfig({
    model: 'opencodeGo',
    baseUrl: 'https://opencode.ai/zen/go/v1',
    customModelName: 'kimi-k3',
    apiKey: 'secret-key',
    rememberApiKey: true,
    reasoner: false,
    maxTokens: 2048,
    contextMessages: 12,
    systemPrompt: '你是秦彻。'
  });
  assert.equal(rememberedConfig.apiKey, 'secret-key');
});
