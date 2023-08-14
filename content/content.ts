import {i18n, i18nKey} from '../util/i18n'

import {SettingsKey, storage} from "../util/storage";
import {ActionKey, DoTranslateRequest, DoTranslateResponse, ShowTranslatorUIRequest} from "../util/message";

let isTranslatorShowing = false;
let translatorMain = null;
let originInput = null;
let translatedInput = null;
let sentenceContext = null;
let lastMarkedSentenceElement = null;

async function showTranslator() {
    if (translatorMain && !isTranslatorShowing) {
        isTranslatorShowing = true;
        translatorMain.style.visibility = 'visible';
        await storage.set(SettingsKey.ShowingMain, true);
    }
}

async function hideTranslator() {
    if (translatorMain && isTranslatorShowing) {
        isTranslatorShowing = false;
        translatorMain.style.visibility = 'hidden';
        await storage.set(SettingsKey.ShowingMain, false);
    }
}

function setOriginText(text: string) {
    if (text) {
        originInput.value = text.trim();
    }
}

function getOriginText() {
    if (originInput) {
        return originInput.value;
    }
    return '';
}

function setTranslatedText(text: string) {
    if (text) {
        translatedInput.value = text.trim();
    }
}

async function translate(text: string): Promise<string> {
    if (!text || text.trim() === '') {
        return "";
    }
    let request: DoTranslateRequest = {
        action: ActionKey.DoTranslate,
        originText: text,
        sentenceContext: sentenceContext
    }
    const response = await chrome.runtime.sendMessage(request) as DoTranslateResponse;
    if (response && response.text) {
        return response.text;
    } else {
        return response.errorText || i18n(i18nKey.ErrorOccurs);
    }
}

async function handleShowTranslatorRequest(request: { action?: string; originText: any; }) {
    const originText = request.originText ? request.originText.trim() : null;
    if (originText) {
        await showTranslator();
        setOriginText(originText);
        setTranslatedText(i18n(i18nKey.Translating));
    }
}

function createListener() {
    chrome.runtime.onMessage.addListener((request: ShowTranslatorUIRequest) => {
            (async () => {
                if (request.action && request.action === ActionKey.ShowTranslatorUI) {
                    await handleShowTranslatorRequest(request);
                    const translatedText = await translate(request.originText);
                    setTranslatedText(translatedText);
                }
            })();
            return true;
        }
    )
}

function createTranslatorUI() {
    translatorMain = document.createElement('div');
    translatorMain.id = 'ktranslator-main';
    translatorMain.className = 'ktranslator-main';
    translatorMain.style.visibility = 'hidden';

    originInput = document.createElement('textarea');
    originInput.id = 'ktranslator-origin-input';
    originInput.className = 'ktranslator-input ktranslator-input--origin';

    translatedInput = document.createElement('textarea');
    translatedInput.id = 'ktranslator-translated-input';
    translatedInput.className = 'ktranslator-input ktranslator-input--translated';

    const translateButton = document.createElement('button');
    translateButton.id = 'ktranslator-translate-button';
    translateButton.className = 'ktranslator-button ktranslator-translate-button';
    translateButton.innerText = i18n(i18nKey.Translate);
    translateButton.onclick = async function () {
        setTranslatedText(i18n(i18nKey.Translating));
        const originText = getOriginText();
        const translatedText = await translate(originText);
        setTranslatedText(translatedText);
    }

    const closeButton = document.createElement('button');
    closeButton.id = 'ktranslator-close-button';
    closeButton.className = 'ktranslator-button ktranslator-close-button';
    closeButton.innerText = i18n(i18nKey.Close);
    closeButton.onclick = async function () {
        await hideTranslator();
    }

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'ktranslator-button-group';

    buttonGroup.appendChild(translateButton);
    buttonGroup.appendChild(closeButton);

    translatorMain.appendChild(originInput);
    translatorMain.appendChild(translatedInput);
    translatorMain.appendChild(buttonGroup);

    const body = document.body;
    body.appendChild(translatorMain);

    body.addEventListener('contextmenu', (e) => {
        if (e.target) {
            if (lastMarkedSentenceElement) {
                lastMarkedSentenceElement.classList.remove('ktranslator-sentence__highlighted');
            }
            const t = e.target as HTMLElement;
            t.classList.add("ktranslator-sentence__highlighted");

            sentenceContext = t.innerText;
            lastMarkedSentenceElement = t;
        }
    })
}


function init() {
    createListener();
    createTranslatorUI();
    chrome.runtime.sendMessage({action: ActionKey.InjectCSS});
}

init();
