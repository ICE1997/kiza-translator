import {i18n, i18nKey} from "../util/i18n";

const defaultProxy = "https://api.openai.com";
const defaultPrompt = "下面我让你来充当翻译家，" +
    "你的目标是把任何语言翻译成{{MT}}，请翻译时不要带翻译腔，" +
    "而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。" +
    "{{CTX|全部文本上下文：'|'}}。{{OT|需要翻译的单词：'|'}}。请输出需要翻译的单词和翻译后的结果。";

export async function translate(text: string, targetLanguage: string, token: string, proxy: string = null, ctxSentence: string = null, prompt: string = null) {
    if (token == null) {
        throw new Error(i18n(i18nKey.RequireToken));
    }
    if (!text || text.trim() === '') {
        return "";
    }
    const finalProxy = proxy ? proxy : defaultProxy;
    const finalPrompt = prompt ? prompt : defaultPrompt;
    let finalInput = replaceMacro(finalPrompt, 'OT', text, true);
    finalInput = replaceMacro(finalInput, 'MT', targetLanguage, true);
    finalInput = replaceMacro(finalInput, 'CTX', ctxSentence, ctxSentence != null);
    const body = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: finalInput
            }
        ],
        temperature: 0.7
    };
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token.trim()}`,
    }

    let translatedText = "";
    let response = null;
    try {
        response = await fetch(
            `${finalProxy}/v1/chat/completions`,
            {
                body: JSON.stringify(body),
                method: "POST",
                headers: headers
            }
        )
    } catch (e) {
        throw new Error(i18n(i18nKey.RequestFailed));
    }

    if (response && response.ok) {
        await response.json().then((json) => {
            translatedText = '';
            const choices = json.choices;
            if (choices) {
                for (let i = 0; i < choices.length; i++) {
                    const choice = choices[i];
                    if (choice && choice.message && choice.message.content) {
                        translatedText += choice.message.content;
                    }
                }
            }
        });
    } else {
        if (response.status === 401) {
            throw new Error(i18n(i18nKey.InvalidToken));
        } else {
            throw new Error(i18n(i18nKey.RequestFailed));
        }
    }
    return translatedText;
}

function replaceMacro(text: string, macroName: string, value: string, enabled: boolean) {
    if (!text || !macroName) return '';
    const regex = RegExp('{{' + macroName + '.*?}}');
    if (!enabled) {
        return text.replace(regex, '');
    }
    const matches = text.match(regex);
    if (matches.length > 0) {
        const template = matches[0];
        const recomposedText = recomposeText(template, value);
        return text.replace(regex, recomposedText);
    }
}

function recomposeText(text: string, value: string) {
    let recomposedText = "";
    const template = stripCurlyBraces(text);
    if (template.indexOf('|') === -1) {
        return value;
    }
    const params = template.split('|');
    if (params.length > 0) {
        recomposedText = recompose(value, params.slice(1));
    }
    return recomposedText;
}

function stripCurlyBraces(text: string) {
    if (!text) return '';
    return text.substring(2, text.length - 2);
}

function recompose(value: string, params: string[]) {
    if (params.length == 1) {
        return params[0] + value;
    } else if (params.length == 2) {
        return params[0] + value + params[1];
    }
}