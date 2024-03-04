export const keyCodeList = [{ "keyName": "Backspace", "keyCode": 8 }, { "keyName": "BKSP", "keyCode": 8 }, { "keyName": "Tab", "keyCode": 9 }, { "keyName": "Enter", "keyCode": 13 }, { "keyName": "Shift", "keyCode": 16 }, { "keyName": "Ctrl", "keyCode": 17 }, { "keyName": "Alt", "keyCode": 18 }, { "keyName": "Pause", "keyCode": 19 }, { "keyName": "CapsLock", "keyCode": 20 }, { "keyName": "Esc", "keyCode": 27 }, { "keyName": "Space", "keyCode": 32 }, { "keyName": "Page Up", "keyCode": 33 }, { "keyName": "Page Down", "keyCode": 34 }, { "keyName": "End", "keyCode": 35 }, { "keyName": "Home", "keyCode": 36 }, { "keyName": "Left Arrow", "keyCode": 37 }, { "keyName": "Up Arrow", "keyCode": 38 }, { "keyName": "Right Arrow", "keyCode": 39 }, { "keyName": "Down Arrow", "keyCode": 40 }, { "keyName": "Insert", "keyCode": 45 }, { "keyName": "Delete", "keyCode": 46 }, { "keyName": "0", "keyCode": 48 }, { "keyName": "1", "keyCode": 49 }, { "keyName": "2", "keyCode": 50 }, { "keyName": "3", "keyCode": 51 }, { "keyName": "4", "keyCode": 52 }, { "keyName": "5", "keyCode": 53 }, { "keyName": "6", "keyCode": 54 }, { "keyName": "7", "keyCode": 55 }, { "keyName": "8", "keyCode": 56 }, { "keyName": "9", "keyCode": 57 }, { "keyName": "A", "keyCode": 65 }, { "keyName": "B", "keyCode": 66 }, { "keyName": "C", "keyCode": 67 }, { "keyName": "D", "keyCode": 68 }, { "keyName": "E", "keyCode": 69 }, { "keyName": "F", "keyCode": 70 }, { "keyName": "G", "keyCode": 71 }, { "keyName": "H", "keyCode": 72 }, { "keyName": "I", "keyCode": 73 }, { "keyName": "J", "keyCode": 74 }, { "keyName": "K", "keyCode": 75 }, { "keyName": "L", "keyCode": 76 }, { "keyName": "M", "keyCode": 77 }, { "keyName": "N", "keyCode": 78 }, { "keyName": "O", "keyCode": 79 }, { "keyName": "P", "keyCode": 80 }, { "keyName": "Q", "keyCode": 81 }, { "keyName": "R", "keyCode": 82 }, { "keyName": "S", "keyCode": 83 }, { "keyName": "T", "keyCode": 84 }, { "keyName": "U", "keyCode": 85 }, { "keyName": "V", "keyCode": 86 }, { "keyName": "W", "keyCode": 87 }, { "keyName": "X", "keyCode": 88 }, { "keyName": "Y", "keyCode": 89 }, { "keyName": "Z", "keyCode": 90 }, { "keyName": "LWin", "keyCode": 91 }, { "keyName": "RWin", "keyCode": 92 }, { "keyName": "Select Key", "keyCode": 93 }, { "keyName": "Numpad 0", "keyCode": 96 }, { "keyName": "Numpad 1", "keyCode": 97 }, { "keyName": "Numpad 2", "keyCode": 98 }, { "keyName": "Numpad 3", "keyCode": 99 }, { "keyName": "Numpad 4", "keyCode": 100 }, { "keyName": "Numpad 5", "keyCode": 101 }, { "keyName": "Numpad 6", "keyCode": 102 }, { "keyName": "Numpad 7", "keyCode": 103 }, { "keyName": "Numpad 8", "keyCode": 104 }, { "keyName": "Numpad 9", "keyCode": 105 }, { "keyName": "Multiply", "keyCode": 106 }, { "keyName": "Add", "keyCode": 107 }, { "keyName": "Subtract", "keyCode": 109 }, { "keyName": "Decimal Point", "keyCode": 110 }, { "keyName": "Divide", "keyCode": 111 }, { "keyName": "F1", "keyCode": 112 }, { "keyName": "F2", "keyCode": 113 }, { "keyName": "F3", "keyCode": 114 }, { "keyName": "F4", "keyCode": 115 }, { "keyName": "F5", "keyCode": 116 }, { "keyName": "F6", "keyCode": 117 }, { "keyName": "F7", "keyCode": 118 }, { "keyName": "F8", "keyCode": 119 }, { "keyName": "F9", "keyCode": 120 }, { "keyName": "F10", "keyCode": 121 }, { "keyName": "F11", "keyCode": 122 }, { "keyName": "F12", "keyCode": 123 }, { "keyName": "PrtSc", "keyCode": 44 }, { "keyName": "Num Lock", "keyCode": 144 }, { "keyName": "ScrLk", "keyCode": 145 }, { "keyName": "Pause", "keyCode": 19 }, { "keyName": "Semicolon", "keyCode": 186 }, { "keyName": "Equal Sign", "keyCode": 187 }, { "keyName": "Comma", "keyCode": 188 }, { "keyName": "Dash", "keyCode": 189 }, { "keyName": "Period", "keyCode": 190 }, { "keyName": "Forward Slash", "keyCode": 191 }, { "keyName": "Grave Accent", "keyCode": 192 }, { "keyName": "Open Bracket", "keyCode": 219 }, { "keyName": "Back Slash", "keyCode": 220 }, { "keyName": "Close Braket", "keyCode": 221 }, { "keyName": "Single Quote", "keyCode": 222 }]
export const keyCodeMap: Record<string, number> = {}
keyCodeList.forEach((e) => {
  keyCodeMap[e.keyName.toUpperCase()] = e.keyCode
})

//上位特殊符号list
export const keyCodeUpSpecList = [
  "~",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "+", '{', '}', ':', `"`, '|', '<', '>', '?'
]
//普通特殊符号list
export const commonKeyCodeSpecList = [
  '[', ']', ';', `'`, `\\`, `,`, '.', '/'
]

//上位特殊符号映射
export const keyCodeUpSpecCharMap: Record<string, number> = {}
for (let i = 1; i < 10; i++) {
  let ii = i + 1
  keyCodeUpSpecCharMap[keyCodeUpSpecList[i]] = `${i}`.charCodeAt(0)
}
keyCodeUpSpecCharMap['~'] = 192
keyCodeUpSpecCharMap[')'] = 48
keyCodeUpSpecCharMap['_'] = 189
keyCodeUpSpecCharMap['+'] = 187
keyCodeUpSpecCharMap['{'] = 219
keyCodeUpSpecCharMap['}'] = 221
keyCodeUpSpecCharMap['|'] = 220
keyCodeUpSpecCharMap[':'] = 186
keyCodeUpSpecCharMap['"'] = 222
keyCodeUpSpecCharMap['<'] = 188
keyCodeUpSpecCharMap['>'] = 190
keyCodeUpSpecCharMap['?'] = 191
//普通特殊符号映射
export const commonKeyCodeSpecCharMap: Record<string, number> = {
}
commonKeyCodeSpecCharMap['`'] = 192
commonKeyCodeSpecCharMap['-'] = 189
commonKeyCodeSpecCharMap['='] = 187
commonKeyCodeSpecCharMap['['] = 219
commonKeyCodeSpecCharMap[']'] = 221
commonKeyCodeSpecCharMap['\\'] = 220
commonKeyCodeSpecCharMap[';'] = 186
commonKeyCodeSpecCharMap['\''] = 222
commonKeyCodeSpecCharMap[','] = 188
commonKeyCodeSpecCharMap['.'] = 190
commonKeyCodeSpecCharMap['/'] = 191



