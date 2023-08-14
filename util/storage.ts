async function get(key: string, alt?: any) {
    const result = await chrome.storage.local.get([key]);
    if (result && result[key]) {
        return result[key];
    }
    return alt;
}

async function set(key: string, value: any) {
    await chrome.storage.local.set({[key]: value});
}

export enum SettingsKey {
    ShowingMain = 'ktranslator-main__showing',
    SettingsEnableSentenceContext = "ktranslator-settings__enable-sentence-context",
    SettingLanguage = "ktranslator-settings__language",
    SettingsToken = "ktranslator-settings__token",
    SettingsProxy = "ktranslator-settings__proxy",
    SettingsPrompt = "ktranslator-settings__prompt",
    SettingsCSS = "ktranslator-settings__css"
}

export const storage = {get, set}
