import {storage, SettingsKey} from "../util/storage";
import {i18n} from "../util/i18n";

localizeHtmlPage();

const ktranslatorTabsWrapper = document.getElementById('ktranslator-tabs');
const ktranslatorTabs = ktranslatorTabsWrapper.children;

const ktranslatorTabContentWrapper = document.getElementById('ktranslator-tab-contents');
const ktranslatorTabContents = ktranslatorTabContentWrapper.children;

const enableSentenceContextRadio = document.getElementById('ktranslator-settings-enable-sentence-context-radio') as HTMLInputElement;
const disableSentenceContextRadio = document.getElementById('ktranslator-settings-disable-sentence-context-radio') as HTMLInputElement;

const languageSelector = document.getElementById('ktranslator-settings-language-selector') as HTMLInputElement;

const tokenInput = document.getElementById('ktranslator-settings-token-input') as HTMLInputElement;
const tokenButton = document.getElementById('ktranslator-settings-token-button');

const proxyInput = document.getElementById('ktranslator-settings-proxy-input') as HTMLInputElement;
const proxyButton = document.getElementById('ktranslator-settings-proxy-button');

const promptInput = document.getElementById('ktranslator-settings-prompt-input') as HTMLInputElement;
const promptButton = document.getElementById('ktranslator-settings-prompt-button');

const cssInput = document.getElementById('ktranslator-settings-css-input') as HTMLInputElement;
const cssButton = document.getElementById('ktranslator-settings-css-button');

const languages = [
    '中文(简体)',
    'English'
]

async function init() {
    await initUI();
}

function renderTabs() {
    const activeTabIndex = ktranslatorTabsWrapper.getAttribute("active-tab-index");
    if (ktranslatorTabs) {
        let activeTab = null;
        let activeTabContent = null;
        for (let i = 0; i < ktranslatorTabs.length; i++) {
            const tab = ktranslatorTabs[i];
            setTabState(tab, false);
            const tabIndex = tab.getAttribute('index');
            if (tabIndex === activeTabIndex) {
                activeTab = tab;
            }
        }
        for (let i = 0; i < ktranslatorTabContents.length; i++) {
            const tabContent = ktranslatorTabContents[i];
            setTabContentState(tabContent, false);
            const tabContentIndex = tabContent.getAttribute('index');
            if (tabContentIndex === activeTabIndex) {
                activeTabContent = tabContent;
            }
        }
        if (activeTab) {
            setTabState(activeTab, true);
        }
        if (activeTabContent) {
            setTabContentState(activeTabContent, true);
        }
    }
}

function setTabContentState(tabContent, active) {
    if (tabContent) {
        if (active) {
            tabContent.classList.add('ktranslator-tab-content__active');
        } else {
            tabContent.classList.remove('ktranslator-tab-content__active');
        }
    }
}

function setTabState(tab, active) {
    if (tab) {
        if (active) {
            tab.classList.add('ktranslator-tab__active');
        } else {
            tab.classList.remove('ktranslator-tab__active');
        }
    }
}

async function onEnableSentenceContextStateChanged(e) {
    const t = e.target;
    if (t) {
        await storage.set(SettingsKey.SettingsEnableSentenceContext, t.value);
    }
}

async function onLanguageChanged(e) {
    const t = e.target;
    if (t) {
        await storage.set(SettingsKey.SettingLanguage, t.value);
    }
}

async function onTokenChanged() {
    await storage.set(SettingsKey.SettingsToken, tokenInput.value.trim());
}

async function onProxyChanged() {
    await storage.set(SettingsKey.SettingsProxy, proxyInput.value.trim());
}

async function onPromptChanged() {
    await storage.set(SettingsKey.SettingsPrompt, promptInput.value.trim());
}

async function onCssChanged() {
    await storage.set(SettingsKey.SettingsCSS, cssInput.value.trim());
}

function localizeHtmlPage() {
    const elements = document.getElementsByTagName('html');
    for (let i = 0; i < elements.length; i++) {
        const html = elements[i];

        const content = html.innerHTML.toString();
        const convertedContent = content.replace(/__MSG_@(\w+)__/g, function (match, key) {
            return key ? i18n(key) : key;
        });

        if (convertedContent != content) {
            html.innerHTML = convertedContent;
        }
    }
}

async function initUI() {
    if (enableSentenceContextRadio && disableSentenceContextRadio) {
        enableSentenceContextRadio.checked = false;
        disableSentenceContextRadio.checked = false;

        const value = await storage.get(SettingsKey.SettingsEnableSentenceContext, 'true');
        if (value === 'true') {
            enableSentenceContextRadio.checked = true;
        } else {
            disableSentenceContextRadio.checked = true;
        }

        enableSentenceContextRadio.onchange = onEnableSentenceContextStateChanged;
        disableSentenceContextRadio.onchange = onEnableSentenceContextStateChanged;
    }

    if (languageSelector) {
        for (let i = 0; i < languages.length; i++) {
            const language = languages[i];
            const option = document.createElement('option');
            option.innerText = option.value = language;
            languageSelector.appendChild(option);
        }
        languageSelector.value = await storage.get(SettingsKey.SettingLanguage, '中文(简体)');

        languageSelector.onchange = onLanguageChanged;
    }

    if (tokenInput && tokenButton) {
        tokenInput.value = await storage.get(SettingsKey.SettingsToken, '');
        tokenButton.onclick = onTokenChanged;
    }

    if (proxyInput && proxyButton) {
        proxyInput.value = await storage.get(SettingsKey.SettingsProxy, '');
        proxyButton.onclick = onProxyChanged;
    }

    if (promptInput && promptButton) {
        promptInput.value = await storage.get(SettingsKey.SettingsPrompt, '');
        promptButton.onclick = onPromptChanged;
    }

    if (cssInput && cssButton) {
        cssInput.value = await storage.get(SettingsKey.SettingsCSS, '');
        cssButton.onclick = onCssChanged;
    }

    ktranslatorTabsWrapper.onclick = (e) => {
        const target = e.target as HTMLElement;
        if (target && target.classList.contains('ktranslator-tab')) {
            const index = target.getAttribute('index');
            ktranslatorTabsWrapper.setAttribute('active-tab-index', index);
            renderTabs();
        }
    }
}


init();