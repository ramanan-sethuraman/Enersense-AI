"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tariffController_js_1 = require("../controllers/tariffController.js");
const router = (0, express_1.Router)();
router.get('/', tariffController_js_1.TariffController.getTariffs);
router.post('/estimate', tariffController_js_1.TariffController.estimateBill);
exports.default = router;
