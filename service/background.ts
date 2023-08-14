import {i18n, i18nKey} from '../util/i18n'
import {translate} from "./translator";
import {ActionKey, DoTranslateRequest, DoTranslateResponse} from "../util/message";
import {SettingsKey, storage} from "../util/storage";

async function handleTranslate(text, tab) {
    chrome.tabs.sendMessage(tab.id,
        {
            action: ActionKey.ShowTranslatorUI,
            originText: text
        }
    );
}

async function injectCSS(tab) {
    if (tab && !tab.url.startsWith('chrome://')) {
        const css = await storage.get(SettingsKey.SettingsCSS, null);
        if (css) {
            await chrome.scripting.insertCSS({
                css: css,
                target: {tabId: tab.id},
            });
        } else {
            await chrome.scripting.insertCSS({
                files: ['content/content.css'],
                target: {tabId: tab.id},
            });
        }
    }
}

async function getCurrentTab() {
    let queryOptions = {active: true, lastFocusedWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function doTranslate(text: string, ctx: string) {
    const proxy = await storage.get(SettingsKey.SettingsProxy);
    const language = await storage.get(SettingsKey.SettingLanguage, '中文(简体)');
    const token = await storage.get(SettingsKey.SettingsToken);
    const prompt = await storage.get(SettingsKey.SettingsPrompt);
    const ctxEnabled = await storage.get(SettingsKey.SettingsEnableSentenceContext, 'true');
    if (ctxEnabled === 'true') {
        return await translate(text, language, token, proxy, ctx, prompt);
    }
    return await translate(text, language, token, proxy, null, prompt);
}

chrome.runtime.onInstalled.addListener(() => {
    let title = i18n(i18nKey.Translate);
    chrome.contextMenus.create({
        title: title,
        contexts: ['selection'],
        id: 'selection'
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
        case 'selection':
            handleTranslate(info.selectionText, tab);
            break;
    }
});

chrome.runtime.onMessage.addListener((request: DoTranslateRequest, sender, sendResponse) => {
        (async () => {
            if (request.action) {
                if (request.action === ActionKey.DoTranslate) {
                    const resp: DoTranslateResponse = {
                        text: null,
                        errorText: null
                    }
                    try {
                        resp.text = await doTranslate(request.originText, request.sentenceContext);
                    } catch (e) {
                        resp.errorText = e.message;
                    }
                    sendResponse(resp);
                } else if (request.action === ActionKey.InjectCSS) {
                    await injectCSS(await getCurrentTab());
                }
            }
        })();
        return true;
    }
)