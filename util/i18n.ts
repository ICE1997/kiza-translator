export enum i18nKey {
    Translate = 'translate',
    Close = 'close',
    Translating = 'translating',
    ErrorOccurs = 'errorOccurs',
    RequireToken = 'requireToken',
    InvalidToken = 'invalidToken',
    RequestFailed = 'requestFailed'
}

export function i18n(name: i18nKey, placeholders?: any) {
    return chrome.i18n.getMessage(name, placeholders)
}
