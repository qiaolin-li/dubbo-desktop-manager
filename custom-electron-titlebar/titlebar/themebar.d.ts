import { IDisposable, Disposable } from '../base/common/lifecycle';
export interface CssStyle {
    addRule(rule: string): void;
}
export interface Theme {
    (collector: CssStyle): void;
}
declare class ThemingRegistry extends Disposable {
    private readonly theming;
    constructor();
    protected onThemeChange(theme: Theme): IDisposable;
    protected getTheming(): Theme[];
}
export declare class ThemeBar extends ThemingRegistry {
    constructor();
    protected registerTheme(theme: Theme): void;
    static get win(): Theme;
    static get mac(): Theme;
}
export {};
