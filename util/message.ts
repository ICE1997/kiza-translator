interface ActionRequest {
    action: ActionKey
}

export interface ShowTranslatorUIRequest extends ActionRequest {
    originText: string
}

export interface DoTranslateRequest extends ActionRequest {
    originText: string,
    sentenceContext: string
}

export interface DoTranslateResponse {
    text: string,
    errorText: string
}

export enum ActionKey {
    ShowTranslatorUI = 'show-translator-ui',
    DoTranslate = 'do-translate',
    InjectCSS = "inject-css"
}
