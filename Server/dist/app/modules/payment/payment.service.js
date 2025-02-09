"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentServices = void 0;
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
const path_1 = require("path");
const fs_1 = require("fs");
const payment_1 = require("../../utils/payment");
const user_model_1 = require("../User/user.model");
const user_constant_1 = require("../User/user.constant");
const confirmationService = (transactionId, status) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    let message = '';
    if (status === 'success') {
        const verifyResponse = yield (0, payment_1.verifyPayment)(transactionId);
        if (verifyResponse && verifyResponse.pay_status === 'Successful') {
            result = yield user_model_1.User.findOneAndUpdate({ transactionId }, {
                paymentStatus: 'Paid',
                status: user_constant_1.USER_STATUS.PREMIUM,
                isVerified: true,
            }, {
                new: true,
            });
            message = 'Successfully Paid!';
        }
        else {
            message = 'Payment Verification Failed!';
        }
    }
    if (status === 'failed') {
        message = 'Payment Failed!';
    }
    const filePath = (0, path_1.join)(__dirname, '../../../../confirmation.html');
    let template = (0, fs_1.readFileSync)(filePath, 'utf-8');
    template = template.replace('{{message}}', message);
    return template;
});
exports.paymentServices = {
    confirmationService,
};
