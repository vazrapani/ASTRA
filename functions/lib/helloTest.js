"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloTest = void 0;
const https_1 = require("firebase-functions/v2/https");
exports.helloTest = (0, https_1.onRequest)({ region: 'asia-northeast3' }, async (req, res) => {
    console.log('helloTest 함수 진입');
    res.json({ message: 'helloTest OK' });
});
//# sourceMappingURL=helloTest.js.map