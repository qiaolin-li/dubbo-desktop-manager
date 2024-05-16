/**
 * An inlined enum containing useful character codes (to be used with String.charCodeAt).
 * Please leave the const keyword such that it gets inlined when compiled to JavaScript!
 */
export declare const enum CharCode {
    Null = 0,
    /**
     * The `\b` character.
     */
    Backspace = 8,
    /**
     * The `\t` character.
     */
    Tab = 9,
    /**
     * The `\n` character.
     */
    LineFeed = 10,
    /**
     * The `\r` character.
     */
    CarriageReturn = 13,
    Space = 32,
    /**
     * The `!` character.
     */
    ExclamationMark = 33,
    /**
     * The `"` character.
     */
    DoubleQuote = 34,
    /**
     * The `#` character.
     */
    Hash = 35,
    /**
     * The `$` character.
     */
    DollarSign = 36,
    /**
     * The `%` character.
     */
    PercentSign = 37,
    /**
     * The `&` character.
     */
    Ampersand = 38,
    /**
     * The `'` character.
     */
    SingleQuote = 39,
    /**
     * The `(` character.
     */
    OpenParen = 40,
    /**
     * The `)` character.
     */
    CloseParen = 41,
    /**
     * The `*` character.
     */
    Asterisk = 42,
    /**
     * The `+` character.
     */
    Plus = 43,
    /**
     * The `,` character.
     */
    Comma = 44,
    /**
     * The `-` character.
     */
    Dash = 45,
    /**
     * The `.` character.
     */
    Period = 46,
    /**
     * The `/` character.
     */
    Slash = 47,
    Digit0 = 48,
    Digit1 = 49,
    Digit2 = 50,
    Digit3 = 51,
    Digit4 = 52,
    Digit5 = 53,
    Digit6 = 54,
    Digit7 = 55,
    Digit8 = 56,
    Digit9 = 57,
    /**
     * The `:` character.
     */
    Colon = 58,
    /**
     * The `;` character.
     */
    Semicolon = 59,
    /**
     * The `<` character.
     */
    LessThan = 60,
    /**
     * The `=` character.
     */
    Equals = 61,
    /**
     * The `>` character.
     */
    GreaterThan = 62,
    /**
     * The `?` character.
     */
    QuestionMark = 63,
    /**
     * The `@` character.
     */
    AtSign = 64,
    A = 65,
    B = 66,
    C = 67,
    D = 68,
    E = 69,
    F = 70,
    G = 71,
    H = 72,
    I = 73,
    J = 74,
    K = 75,
    L = 76,
    M = 77,
    N = 78,
    O = 79,
    P = 80,
    Q = 81,
    R = 82,
    S = 83,
    T = 84,
    U = 85,
    V = 86,
    W = 87,
    X = 88,
    Y = 89,
    Z = 90,
    /**
     * The `[` character.
     */
    OpenSquareBracket = 91,
    /**
     * The `\` character.
     */
    Backslash = 92,
    /**
     * The `]` character.
     */
    CloseSquareBracket = 93,
    /**
     * The `^` character.
     */
    Caret = 94,
    /**
     * The `_` character.
     */
    Underline = 95,
    /**
     * The ``(`)`` character.
     */
    BackTick = 96,
    a = 97,
    b = 98,
    c = 99,
    d = 100,
    e = 101,
    f = 102,
    g = 103,
    h = 104,
    i = 105,
    j = 106,
    k = 107,
    l = 108,
    m = 109,
    n = 110,
    o = 111,
    p = 112,
    q = 113,
    r = 114,
    s = 115,
    t = 116,
    u = 117,
    v = 118,
    w = 119,
    x = 120,
    y = 121,
    z = 122,
    /**
     * The `{` character.
     */
    OpenCurlyBrace = 123,
    /**
     * The `|` character.
     */
    Pipe = 124,
    /**
     * The `}` character.
     */
    CloseCurlyBrace = 125,
    /**
     * The `~` character.
     */
    Tilde = 126,
    U_Combining_Grave_Accent = 768,//	U+0300	Combining Grave Accent
    U_Combining_Acute_Accent = 769,//	U+0301	Combining Acute Accent
    U_Combining_Circumflex_Accent = 770,//	U+0302	Combining Circumflex Accent
    U_Combining_Tilde = 771,//	U+0303	Combining Tilde
    U_Combining_Macron = 772,//	U+0304	Combining Macron
    U_Combining_Overline = 773,//	U+0305	Combining Overline
    U_Combining_Breve = 774,//	U+0306	Combining Breve
    U_Combining_Dot_Above = 775,//	U+0307	Combining Dot Above
    U_Combining_Diaeresis = 776,//	U+0308	Combining Diaeresis
    U_Combining_Hook_Above = 777,//	U+0309	Combining Hook Above
    U_Combining_Ring_Above = 778,//	U+030A	Combining Ring Above
    U_Combining_Double_Acute_Accent = 779,//	U+030B	Combining Double Acute Accent
    U_Combining_Caron = 780,//	U+030C	Combining Caron
    U_Combining_Vertical_Line_Above = 781,//	U+030D	Combining Vertical Line Above
    U_Combining_Double_Vertical_Line_Above = 782,//	U+030E	Combining Double Vertical Line Above
    U_Combining_Double_Grave_Accent = 783,//	U+030F	Combining Double Grave Accent
    U_Combining_Candrabindu = 784,//	U+0310	Combining Candrabindu
    U_Combining_Inverted_Breve = 785,//	U+0311	Combining Inverted Breve
    U_Combining_Turned_Comma_Above = 786,//	U+0312	Combining Turned Comma Above
    U_Combining_Comma_Above = 787,//	U+0313	Combining Comma Above
    U_Combining_Reversed_Comma_Above = 788,//	U+0314	Combining Reversed Comma Above
    U_Combining_Comma_Above_Right = 789,//	U+0315	Combining Comma Above Right
    U_Combining_Grave_Accent_Below = 790,//	U+0316	Combining Grave Accent Below
    U_Combining_Acute_Accent_Below = 791,//	U+0317	Combining Acute Accent Below
    U_Combining_Left_Tack_Below = 792,//	U+0318	Combining Left Tack Below
    U_Combining_Right_Tack_Below = 793,//	U+0319	Combining Right Tack Below
    U_Combining_Left_Angle_Above = 794,//	U+031A	Combining Left Angle Above
    U_Combining_Horn = 795,//	U+031B	Combining Horn
    U_Combining_Left_Half_Ring_Below = 796,//	U+031C	Combining Left Half Ring Below
    U_Combining_Up_Tack_Below = 797,//	U+031D	Combining Up Tack Below
    U_Combining_Down_Tack_Below = 798,//	U+031E	Combining Down Tack Below
    U_Combining_Plus_Sign_Below = 799,//	U+031F	Combining Plus Sign Below
    U_Combining_Minus_Sign_Below = 800,//	U+0320	Combining Minus Sign Below
    U_Combining_Palatalized_Hook_Below = 801,//	U+0321	Combining Palatalized Hook Below
    U_Combining_Retroflex_Hook_Below = 802,//	U+0322	Combining Retroflex Hook Below
    U_Combining_Dot_Below = 803,//	U+0323	Combining Dot Below
    U_Combining_Diaeresis_Below = 804,//	U+0324	Combining Diaeresis Below
    U_Combining_Ring_Below = 805,//	U+0325	Combining Ring Below
    U_Combining_Comma_Below = 806,//	U+0326	Combining Comma Below
    U_Combining_Cedilla = 807,//	U+0327	Combining Cedilla
    U_Combining_Ogonek = 808,//	U+0328	Combining Ogonek
    U_Combining_Vertical_Line_Below = 809,//	U+0329	Combining Vertical Line Below
    U_Combining_Bridge_Below = 810,//	U+032A	Combining Bridge Below
    U_Combining_Inverted_Double_Arch_Below = 811,//	U+032B	Combining Inverted Double Arch Below
    U_Combining_Caron_Below = 812,//	U+032C	Combining Caron Below
    U_Combining_Circumflex_Accent_Below = 813,//	U+032D	Combining Circumflex Accent Below
    U_Combining_Breve_Below = 814,//	U+032E	Combining Breve Below
    U_Combining_Inverted_Breve_Below = 815,//	U+032F	Combining Inverted Breve Below
    U_Combining_Tilde_Below = 816,//	U+0330	Combining Tilde Below
    U_Combining_Macron_Below = 817,//	U+0331	Combining Macron Below
    U_Combining_Low_Line = 818,//	U+0332	Combining Low Line
    U_Combining_Double_Low_Line = 819,//	U+0333	Combining Double Low Line
    U_Combining_Tilde_Overlay = 820,//	U+0334	Combining Tilde Overlay
    U_Combining_Short_Stroke_Overlay = 821,//	U+0335	Combining Short Stroke Overlay
    U_Combining_Long_Stroke_Overlay = 822,//	U+0336	Combining Long Stroke Overlay
    U_Combining_Short_Solidus_Overlay = 823,//	U+0337	Combining Short Solidus Overlay
    U_Combining_Long_Solidus_Overlay = 824,//	U+0338	Combining Long Solidus Overlay
    U_Combining_Right_Half_Ring_Below = 825,//	U+0339	Combining Right Half Ring Below
    U_Combining_Inverted_Bridge_Below = 826,//	U+033A	Combining Inverted Bridge Below
    U_Combining_Square_Below = 827,//	U+033B	Combining Square Below
    U_Combining_Seagull_Below = 828,//	U+033C	Combining Seagull Below
    U_Combining_X_Above = 829,//	U+033D	Combining X Above
    U_Combining_Vertical_Tilde = 830,//	U+033E	Combining Vertical Tilde
    U_Combining_Double_Overline = 831,//	U+033F	Combining Double Overline
    U_Combining_Grave_Tone_Mark = 832,//	U+0340	Combining Grave Tone Mark
    U_Combining_Acute_Tone_Mark = 833,//	U+0341	Combining Acute Tone Mark
    U_Combining_Greek_Perispomeni = 834,//	U+0342	Combining Greek Perispomeni
    U_Combining_Greek_Koronis = 835,//	U+0343	Combining Greek Koronis
    U_Combining_Greek_Dialytika_Tonos = 836,//	U+0344	Combining Greek Dialytika Tonos
    U_Combining_Greek_Ypogegrammeni = 837,//	U+0345	Combining Greek Ypogegrammeni
    U_Combining_Bridge_Above = 838,//	U+0346	Combining Bridge Above
    U_Combining_Equals_Sign_Below = 839,//	U+0347	Combining Equals Sign Below
    U_Combining_Double_Vertical_Line_Below = 840,//	U+0348	Combining Double Vertical Line Below
    U_Combining_Left_Angle_Below = 841,//	U+0349	Combining Left Angle Below
    U_Combining_Not_Tilde_Above = 842,//	U+034A	Combining Not Tilde Above
    U_Combining_Homothetic_Above = 843,//	U+034B	Combining Homothetic Above
    U_Combining_Almost_Equal_To_Above = 844,//	U+034C	Combining Almost Equal To Above
    U_Combining_Left_Right_Arrow_Below = 845,//	U+034D	Combining Left Right Arrow Below
    U_Combining_Upwards_Arrow_Below = 846,//	U+034E	Combining Upwards Arrow Below
    U_Combining_Grapheme_Joiner = 847,//	U+034F	Combining Grapheme Joiner
    U_Combining_Right_Arrowhead_Above = 848,//	U+0350	Combining Right Arrowhead Above
    U_Combining_Left_Half_Ring_Above = 849,//	U+0351	Combining Left Half Ring Above
    U_Combining_Fermata = 850,//	U+0352	Combining Fermata
    U_Combining_X_Below = 851,//	U+0353	Combining X Below
    U_Combining_Left_Arrowhead_Below = 852,//	U+0354	Combining Left Arrowhead Below
    U_Combining_Right_Arrowhead_Below = 853,//	U+0355	Combining Right Arrowhead Below
    U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below = 854,//	U+0356	Combining Right Arrowhead And Up Arrowhead Below
    U_Combining_Right_Half_Ring_Above = 855,//	U+0357	Combining Right Half Ring Above
    U_Combining_Dot_Above_Right = 856,//	U+0358	Combining Dot Above Right
    U_Combining_Asterisk_Below = 857,//	U+0359	Combining Asterisk Below
    U_Combining_Double_Ring_Below = 858,//	U+035A	Combining Double Ring Below
    U_Combining_Zigzag_Above = 859,//	U+035B	Combining Zigzag Above
    U_Combining_Double_Breve_Below = 860,//	U+035C	Combining Double Breve Below
    U_Combining_Double_Breve = 861,//	U+035D	Combining Double Breve
    U_Combining_Double_Macron = 862,//	U+035E	Combining Double Macron
    U_Combining_Double_Macron_Below = 863,//	U+035F	Combining Double Macron Below
    U_Combining_Double_Tilde = 864,//	U+0360	Combining Double Tilde
    U_Combining_Double_Inverted_Breve = 865,//	U+0361	Combining Double Inverted Breve
    U_Combining_Double_Rightwards_Arrow_Below = 866,//	U+0362	Combining Double Rightwards Arrow Below
    U_Combining_Latin_Small_Letter_A = 867,//	U+0363	Combining Latin Small Letter A
    U_Combining_Latin_Small_Letter_E = 868,//	U+0364	Combining Latin Small Letter E
    U_Combining_Latin_Small_Letter_I = 869,//	U+0365	Combining Latin Small Letter I
    U_Combining_Latin_Small_Letter_O = 870,//	U+0366	Combining Latin Small Letter O
    U_Combining_Latin_Small_Letter_U = 871,//	U+0367	Combining Latin Small Letter U
    U_Combining_Latin_Small_Letter_C = 872,//	U+0368	Combining Latin Small Letter C
    U_Combining_Latin_Small_Letter_D = 873,//	U+0369	Combining Latin Small Letter D
    U_Combining_Latin_Small_Letter_H = 874,//	U+036A	Combining Latin Small Letter H
    U_Combining_Latin_Small_Letter_M = 875,//	U+036B	Combining Latin Small Letter M
    U_Combining_Latin_Small_Letter_R = 876,//	U+036C	Combining Latin Small Letter R
    U_Combining_Latin_Small_Letter_T = 877,//	U+036D	Combining Latin Small Letter T
    U_Combining_Latin_Small_Letter_V = 878,//	U+036E	Combining Latin Small Letter V
    U_Combining_Latin_Small_Letter_X = 879,//	U+036F	Combining Latin Small Letter X
    /**
     * Unicode Character 'LINE SEPARATOR' (U+2028)
     * http://www.fileformat.info/info/unicode/char/2028/index.htm
     */
    LINE_SEPARATOR_2028 = 8232,
    U_CIRCUMFLEX = 94,// U+005E	CIRCUMFLEX
    U_GRAVE_ACCENT = 96,// U+0060	GRAVE ACCENT
    U_DIAERESIS = 168,// U+00A8	DIAERESIS
    U_MACRON = 175,// U+00AF	MACRON
    U_ACUTE_ACCENT = 180,// U+00B4	ACUTE ACCENT
    U_CEDILLA = 184,// U+00B8	CEDILLA
    U_MODIFIER_LETTER_LEFT_ARROWHEAD = 706,// U+02C2	MODIFIER LETTER LEFT ARROWHEAD
    U_MODIFIER_LETTER_RIGHT_ARROWHEAD = 707,// U+02C3	MODIFIER LETTER RIGHT ARROWHEAD
    U_MODIFIER_LETTER_UP_ARROWHEAD = 708,// U+02C4	MODIFIER LETTER UP ARROWHEAD
    U_MODIFIER_LETTER_DOWN_ARROWHEAD = 709,// U+02C5	MODIFIER LETTER DOWN ARROWHEAD
    U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING = 722,// U+02D2	MODIFIER LETTER CENTRED RIGHT HALF RING
    U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING = 723,// U+02D3	MODIFIER LETTER CENTRED LEFT HALF RING
    U_MODIFIER_LETTER_UP_TACK = 724,// U+02D4	MODIFIER LETTER UP TACK
    U_MODIFIER_LETTER_DOWN_TACK = 725,// U+02D5	MODIFIER LETTER DOWN TACK
    U_MODIFIER_LETTER_PLUS_SIGN = 726,// U+02D6	MODIFIER LETTER PLUS SIGN
    U_MODIFIER_LETTER_MINUS_SIGN = 727,// U+02D7	MODIFIER LETTER MINUS SIGN
    U_BREVE = 728,// U+02D8	BREVE
    U_DOT_ABOVE = 729,// U+02D9	DOT ABOVE
    U_RING_ABOVE = 730,// U+02DA	RING ABOVE
    U_OGONEK = 731,// U+02DB	OGONEK
    U_SMALL_TILDE = 732,// U+02DC	SMALL TILDE
    U_DOUBLE_ACUTE_ACCENT = 733,// U+02DD	DOUBLE ACUTE ACCENT
    U_MODIFIER_LETTER_RHOTIC_HOOK = 734,// U+02DE	MODIFIER LETTER RHOTIC HOOK
    U_MODIFIER_LETTER_CROSS_ACCENT = 735,// U+02DF	MODIFIER LETTER CROSS ACCENT
    U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR = 741,// U+02E5	MODIFIER LETTER EXTRA-HIGH TONE BAR
    U_MODIFIER_LETTER_HIGH_TONE_BAR = 742,// U+02E6	MODIFIER LETTER HIGH TONE BAR
    U_MODIFIER_LETTER_MID_TONE_BAR = 743,// U+02E7	MODIFIER LETTER MID TONE BAR
    U_MODIFIER_LETTER_LOW_TONE_BAR = 744,// U+02E8	MODIFIER LETTER LOW TONE BAR
    U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR = 745,// U+02E9	MODIFIER LETTER EXTRA-LOW TONE BAR
    U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK = 746,// U+02EA	MODIFIER LETTER YIN DEPARTING TONE MARK
    U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK = 747,// U+02EB	MODIFIER LETTER YANG DEPARTING TONE MARK
    U_MODIFIER_LETTER_UNASPIRATED = 749,// U+02ED	MODIFIER LETTER UNASPIRATED
    U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD = 751,// U+02EF	MODIFIER LETTER LOW DOWN ARROWHEAD
    U_MODIFIER_LETTER_LOW_UP_ARROWHEAD = 752,// U+02F0	MODIFIER LETTER LOW UP ARROWHEAD
    U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD = 753,// U+02F1	MODIFIER LETTER LOW LEFT ARROWHEAD
    U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD = 754,// U+02F2	MODIFIER LETTER LOW RIGHT ARROWHEAD
    U_MODIFIER_LETTER_LOW_RING = 755,// U+02F3	MODIFIER LETTER LOW RING
    U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT = 756,// U+02F4	MODIFIER LETTER MIDDLE GRAVE ACCENT
    U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT = 757,// U+02F5	MODIFIER LETTER MIDDLE DOUBLE GRAVE ACCENT
    U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT = 758,// U+02F6	MODIFIER LETTER MIDDLE DOUBLE ACUTE ACCENT
    U_MODIFIER_LETTER_LOW_TILDE = 759,// U+02F7	MODIFIER LETTER LOW TILDE
    U_MODIFIER_LETTER_RAISED_COLON = 760,// U+02F8	MODIFIER LETTER RAISED COLON
    U_MODIFIER_LETTER_BEGIN_HIGH_TONE = 761,// U+02F9	MODIFIER LETTER BEGIN HIGH TONE
    U_MODIFIER_LETTER_END_HIGH_TONE = 762,// U+02FA	MODIFIER LETTER END HIGH TONE
    U_MODIFIER_LETTER_BEGIN_LOW_TONE = 763,// U+02FB	MODIFIER LETTER BEGIN LOW TONE
    U_MODIFIER_LETTER_END_LOW_TONE = 764,// U+02FC	MODIFIER LETTER END LOW TONE
    U_MODIFIER_LETTER_SHELF = 765,// U+02FD	MODIFIER LETTER SHELF
    U_MODIFIER_LETTER_OPEN_SHELF = 766,// U+02FE	MODIFIER LETTER OPEN SHELF
    U_MODIFIER_LETTER_LOW_LEFT_ARROW = 767,// U+02FF	MODIFIER LETTER LOW LEFT ARROW
    U_GREEK_LOWER_NUMERAL_SIGN = 885,// U+0375	GREEK LOWER NUMERAL SIGN
    U_GREEK_TONOS = 900,// U+0384	GREEK TONOS
    U_GREEK_DIALYTIKA_TONOS = 901,// U+0385	GREEK DIALYTIKA TONOS
    U_GREEK_KORONIS = 8125,// U+1FBD	GREEK KORONIS
    U_GREEK_PSILI = 8127,// U+1FBF	GREEK PSILI
    U_GREEK_PERISPOMENI = 8128,// U+1FC0	GREEK PERISPOMENI
    U_GREEK_DIALYTIKA_AND_PERISPOMENI = 8129,// U+1FC1	GREEK DIALYTIKA AND PERISPOMENI
    U_GREEK_PSILI_AND_VARIA = 8141,// U+1FCD	GREEK PSILI AND VARIA
    U_GREEK_PSILI_AND_OXIA = 8142,// U+1FCE	GREEK PSILI AND OXIA
    U_GREEK_PSILI_AND_PERISPOMENI = 8143,// U+1FCF	GREEK PSILI AND PERISPOMENI
    U_GREEK_DASIA_AND_VARIA = 8157,// U+1FDD	GREEK DASIA AND VARIA
    U_GREEK_DASIA_AND_OXIA = 8158,// U+1FDE	GREEK DASIA AND OXIA
    U_GREEK_DASIA_AND_PERISPOMENI = 8159,// U+1FDF	GREEK DASIA AND PERISPOMENI
    U_GREEK_DIALYTIKA_AND_VARIA = 8173,// U+1FED	GREEK DIALYTIKA AND VARIA
    U_GREEK_DIALYTIKA_AND_OXIA = 8174,// U+1FEE	GREEK DIALYTIKA AND OXIA
    U_GREEK_VARIA = 8175,// U+1FEF	GREEK VARIA
    U_GREEK_OXIA = 8189,// U+1FFD	GREEK OXIA
    U_GREEK_DASIA = 8190,// U+1FFE	GREEK DASIA
    U_OVERLINE = 8254,// Unicode Character 'OVERLINE'
    /**
     * UTF-8 BOM
     * Unicode Character 'ZERO WIDTH NO-BREAK SPACE' (U+FEFF)
     * http://www.fileformat.info/info/unicode/char/feff/index.htm
     */
    UTF8_BOM = 65279
}
