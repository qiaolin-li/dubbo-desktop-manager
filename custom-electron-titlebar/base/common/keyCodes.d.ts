import { OperatingSystem } from '../common/platform';
/**
 * Virtual Key Codes, the value does not hold any inherent meaning.
 * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
 * But these are "more general", as they should work across browsers & OS`s.
 */
export declare const enum KeyCode {
    /**
     * Placed first to cover the 0 value of the enum.
     */
    Unknown = 0,
    Backspace = 1,
    Tab = 2,
    Enter = 3,
    Shift = 4,
    Ctrl = 5,
    Alt = 6,
    PauseBreak = 7,
    CapsLock = 8,
    Escape = 9,
    Space = 10,
    PageUp = 11,
    PageDown = 12,
    End = 13,
    Home = 14,
    LeftArrow = 15,
    UpArrow = 16,
    RightArrow = 17,
    DownArrow = 18,
    Insert = 19,
    Delete = 20,
    KEY_0 = 21,
    KEY_1 = 22,
    KEY_2 = 23,
    KEY_3 = 24,
    KEY_4 = 25,
    KEY_5 = 26,
    KEY_6 = 27,
    KEY_7 = 28,
    KEY_8 = 29,
    KEY_9 = 30,
    KEY_A = 31,
    KEY_B = 32,
    KEY_C = 33,
    KEY_D = 34,
    KEY_E = 35,
    KEY_F = 36,
    KEY_G = 37,
    KEY_H = 38,
    KEY_I = 39,
    KEY_J = 40,
    KEY_K = 41,
    KEY_L = 42,
    KEY_M = 43,
    KEY_N = 44,
    KEY_O = 45,
    KEY_P = 46,
    KEY_Q = 47,
    KEY_R = 48,
    KEY_S = 49,
    KEY_T = 50,
    KEY_U = 51,
    KEY_V = 52,
    KEY_W = 53,
    KEY_X = 54,
    KEY_Y = 55,
    KEY_Z = 56,
    Meta = 57,
    ContextMenu = 58,
    F1 = 59,
    F2 = 60,
    F3 = 61,
    F4 = 62,
    F5 = 63,
    F6 = 64,
    F7 = 65,
    F8 = 66,
    F9 = 67,
    F10 = 68,
    F11 = 69,
    F12 = 70,
    F13 = 71,
    F14 = 72,
    F15 = 73,
    F16 = 74,
    F17 = 75,
    F18 = 76,
    F19 = 77,
    NumLock = 78,
    ScrollLock = 79,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ';:' key
     */
    US_SEMICOLON = 80,
    /**
     * For any country/region, the '+' key
     * For the US standard keyboard, the '=+' key
     */
    US_EQUAL = 81,
    /**
     * For any country/region, the ',' key
     * For the US standard keyboard, the ',<' key
     */
    US_COMMA = 82,
    /**
     * For any country/region, the '-' key
     * For the US standard keyboard, the '-_' key
     */
    US_MINUS = 83,
    /**
     * For any country/region, the '.' key
     * For the US standard keyboard, the '.>' key
     */
    US_DOT = 84,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '/?' key
     */
    US_SLASH = 85,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '`~' key
     */
    US_BACKTICK = 86,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '[{' key
     */
    US_OPEN_SQUARE_BRACKET = 87,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '\|' key
     */
    US_BACKSLASH = 88,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ']}' key
     */
    US_CLOSE_SQUARE_BRACKET = 89,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ''"' key
     */
    US_QUOTE = 90,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     */
    OEM_8 = 91,
    /**
     * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
     */
    OEM_102 = 92,
    NUMPAD_0 = 93,// VK_NUMPAD0, 0x60, Numeric keypad 0 key
    NUMPAD_1 = 94,// VK_NUMPAD1, 0x61, Numeric keypad 1 key
    NUMPAD_2 = 95,// VK_NUMPAD2, 0x62, Numeric keypad 2 key
    NUMPAD_3 = 96,// VK_NUMPAD3, 0x63, Numeric keypad 3 key
    NUMPAD_4 = 97,// VK_NUMPAD4, 0x64, Numeric keypad 4 key
    NUMPAD_5 = 98,// VK_NUMPAD5, 0x65, Numeric keypad 5 key
    NUMPAD_6 = 99,// VK_NUMPAD6, 0x66, Numeric keypad 6 key
    NUMPAD_7 = 100,// VK_NUMPAD7, 0x67, Numeric keypad 7 key
    NUMPAD_8 = 101,// VK_NUMPAD8, 0x68, Numeric keypad 8 key
    NUMPAD_9 = 102,// VK_NUMPAD9, 0x69, Numeric keypad 9 key
    NUMPAD_MULTIPLY = 103,// VK_MULTIPLY, 0x6A, Multiply key
    NUMPAD_ADD = 104,// VK_ADD, 0x6B, Add key
    NUMPAD_SEPARATOR = 105,// VK_SEPARATOR, 0x6C, Separator key
    NUMPAD_SUBTRACT = 106,// VK_SUBTRACT, 0x6D, Subtract key
    NUMPAD_DECIMAL = 107,// VK_DECIMAL, 0x6E, Decimal key
    NUMPAD_DIVIDE = 108,// VK_DIVIDE, 0x6F,
    /**
     * Cover all key codes when IME is processing input.
     */
    KEY_IN_COMPOSITION = 109,
    ABNT_C1 = 110,// Brazilian (ABNT) Keyboard
    ABNT_C2 = 111,// Brazilian (ABNT) Keyboard
    /**
     * Placed last to cover the length of the enum.
     * Please do not depend on this value!
     */
    MAX_VALUE = 112
}
/**
 * keyboardEvent.code
 */
export declare const enum ScanCode {
    DependsOnKbLayout = -1,
    None = 0,
    Hyper = 1,
    Super = 2,
    Fn = 3,
    FnLock = 4,
    Suspend = 5,
    Resume = 6,
    Turbo = 7,
    Sleep = 8,
    WakeUp = 9,
    KeyA = 10,
    KeyB = 11,
    KeyC = 12,
    KeyD = 13,
    KeyE = 14,
    KeyF = 15,
    KeyG = 16,
    KeyH = 17,
    KeyI = 18,
    KeyJ = 19,
    KeyK = 20,
    KeyL = 21,
    KeyM = 22,
    KeyN = 23,
    KeyO = 24,
    KeyP = 25,
    KeyQ = 26,
    KeyR = 27,
    KeyS = 28,
    KeyT = 29,
    KeyU = 30,
    KeyV = 31,
    KeyW = 32,
    KeyX = 33,
    KeyY = 34,
    KeyZ = 35,
    Digit1 = 36,
    Digit2 = 37,
    Digit3 = 38,
    Digit4 = 39,
    Digit5 = 40,
    Digit6 = 41,
    Digit7 = 42,
    Digit8 = 43,
    Digit9 = 44,
    Digit0 = 45,
    Enter = 46,
    Escape = 47,
    Backspace = 48,
    Tab = 49,
    Space = 50,
    Minus = 51,
    Equal = 52,
    BracketLeft = 53,
    BracketRight = 54,
    Backslash = 55,
    IntlHash = 56,
    Semicolon = 57,
    Quote = 58,
    Backquote = 59,
    Comma = 60,
    Period = 61,
    Slash = 62,
    CapsLock = 63,
    F1 = 64,
    F2 = 65,
    F3 = 66,
    F4 = 67,
    F5 = 68,
    F6 = 69,
    F7 = 70,
    F8 = 71,
    F9 = 72,
    F10 = 73,
    F11 = 74,
    F12 = 75,
    PrintScreen = 76,
    ScrollLock = 77,
    Pause = 78,
    Insert = 79,
    Home = 80,
    PageUp = 81,
    Delete = 82,
    End = 83,
    PageDown = 84,
    ArrowRight = 85,
    ArrowLeft = 86,
    ArrowDown = 87,
    ArrowUp = 88,
    NumLock = 89,
    NumpadDivide = 90,
    NumpadMultiply = 91,
    NumpadSubtract = 92,
    NumpadAdd = 93,
    NumpadEnter = 94,
    Numpad1 = 95,
    Numpad2 = 96,
    Numpad3 = 97,
    Numpad4 = 98,
    Numpad5 = 99,
    Numpad6 = 100,
    Numpad7 = 101,
    Numpad8 = 102,
    Numpad9 = 103,
    Numpad0 = 104,
    NumpadDecimal = 105,
    IntlBackslash = 106,
    ContextMenu = 107,
    Power = 108,
    NumpadEqual = 109,
    F13 = 110,
    F14 = 111,
    F15 = 112,
    F16 = 113,
    F17 = 114,
    F18 = 115,
    F19 = 116,
    F20 = 117,
    F21 = 118,
    F22 = 119,
    F23 = 120,
    F24 = 121,
    Open = 122,
    Help = 123,
    Select = 124,
    Again = 125,
    Undo = 126,
    Cut = 127,
    Copy = 128,
    Paste = 129,
    Find = 130,
    AudioVolumeMute = 131,
    AudioVolumeUp = 132,
    AudioVolumeDown = 133,
    NumpadComma = 134,
    IntlRo = 135,
    KanaMode = 136,
    IntlYen = 137,
    Convert = 138,
    NonConvert = 139,
    Lang1 = 140,
    Lang2 = 141,
    Lang3 = 142,
    Lang4 = 143,
    Lang5 = 144,
    Abort = 145,
    Props = 146,
    NumpadParenLeft = 147,
    NumpadParenRight = 148,
    NumpadBackspace = 149,
    NumpadMemoryStore = 150,
    NumpadMemoryRecall = 151,
    NumpadMemoryClear = 152,
    NumpadMemoryAdd = 153,
    NumpadMemorySubtract = 154,
    NumpadClear = 155,
    NumpadClearEntry = 156,
    ControlLeft = 157,
    ShiftLeft = 158,
    AltLeft = 159,
    MetaLeft = 160,
    ControlRight = 161,
    ShiftRight = 162,
    AltRight = 163,
    MetaRight = 164,
    BrightnessUp = 165,
    BrightnessDown = 166,
    MediaPlay = 167,
    MediaRecord = 168,
    MediaFastForward = 169,
    MediaRewind = 170,
    MediaTrackNext = 171,
    MediaTrackPrevious = 172,
    MediaStop = 173,
    Eject = 174,
    MediaPlayPause = 175,
    MediaSelect = 176,
    LaunchMail = 177,
    LaunchApp2 = 178,
    LaunchApp1 = 179,
    SelectTask = 180,
    LaunchScreenSaver = 181,
    BrowserSearch = 182,
    BrowserHome = 183,
    BrowserBack = 184,
    BrowserForward = 185,
    BrowserStop = 186,
    BrowserRefresh = 187,
    BrowserFavorites = 188,
    ZoomToggle = 189,
    MailReply = 190,
    MailForward = 191,
    MailSend = 192,
    MAX_VALUE = 193
}
export declare const ScanCodeUtils: {
    lowerCaseToEnum: (scanCode: string) => number;
    toEnum: (scanCode: string) => number;
    toString: (scanCode: ScanCode) => string;
};
export declare namespace KeyCodeUtils {
    function toString(keyCode: KeyCode): string;
    function fromString(key: string): KeyCode;
    function toUserSettingsUS(keyCode: KeyCode): string;
    function toUserSettingsGeneral(keyCode: KeyCode): string;
    function fromUserSettings(key: string): KeyCode;
}
export declare const enum KeyMod {
    CtrlCmd = 2048,
    Shift = 1024,
    Alt = 512,
    WinCtrl = 256
}
export declare function KeyChord(firstPart: number, secondPart: number): number;
export declare const enum KeybindingType {
    Simple = 1,
    Chord = 2
}
export declare class SimpleKeybinding {
    readonly type = KeybindingType.Simple;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyCode: KeyCode;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, keyCode: KeyCode);
    equals(other: Keybinding): boolean;
    getHashCode(): string;
    isModifierKey(): boolean;
    /**
     * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
     */
    isDuplicateModifierCase(): boolean;
}
export declare class ChordKeybinding {
    readonly type = KeybindingType.Chord;
    readonly firstPart: SimpleKeybinding;
    readonly chordPart: SimpleKeybinding;
    constructor(firstPart: SimpleKeybinding, chordPart: SimpleKeybinding);
    getHashCode(): string;
}
export type Keybinding = SimpleKeybinding | ChordKeybinding;
export declare function createKeybinding(keybinding: number, OS: OperatingSystem): Keybinding | null;
export declare function createSimpleKeybinding(keybinding: number, OS: OperatingSystem): SimpleKeybinding;
export declare class ResolvedKeybindingPart {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyLabel: string | null;
    readonly keyAriaLabel: string | null;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, kbLabel: string | null, kbAriaLabel: string | null);
}
/**
 * A resolved keybinding. Can be a simple keybinding or a chord keybinding.
 */
export declare abstract class ResolvedKeybinding {
    /**
     * This prints the binding in a format suitable for displaying in the UI.
     */
    abstract getLabel(): string | null;
    /**
 * This prints the binding in a format suitable for ARIA.
 */
    abstract getAriaLabel(): string | null;
    /**
 * This prints the binding in a format suitable for electron's accelerators.
 * See https://github.com/electron/electron/blob/master/docs/api/accelerator.md
 */
    abstract getElectronAccelerator(): string | null;
    /**
 * This prints the binding in a format suitable for user settings.
 */
    abstract getUserSettingsLabel(): string | null;
    /**
 * Is the user settings label reflecting the label?
 */
    abstract isWYSIWYG(): boolean;
    /**
 * Is the binding a chord?
 */
    abstract isChord(): boolean;
    /**
 * Returns the firstPart, chordPart that should be used for dispatching.
 */
    abstract getDispatchParts(): [string | null, string | null];
    /**
 * Returns the firstPart, chordPart of the keybinding.
 * For simple keybindings, the second element will be null.
 */
    abstract getParts(): [ResolvedKeybindingPart, ResolvedKeybindingPart | null];
}
