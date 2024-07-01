"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.FIRST_URL = void 0;
const login_1 = require("./login");
Object.defineProperty(exports, "FIRST_URL", { enumerable: true, get: function () { return login_1.FIRST_URL; } });
Object.defineProperty(exports, "login", { enumerable: true, get: function () { return login_1.login; } });
const logout_1 = require("./logout");
Object.defineProperty(exports, "logout", { enumerable: true, get: function () { return logout_1.logout; } });
exports.default = {
    FIRST_URL: login_1.FIRST_URL,
    login: login_1.login,
    logout: logout_1.logout
};
