"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../modules/Auth/auth.route");
const user_route_1 = require("../modules/User/user.route");
const profile_route_1 = require("../modules/Profile/profile.route");
const post_route_1 = require("../modules/Post/post.route");
const comment_route_1 = require("../modules/Comment/comment.route");
const payment_route_1 = require("../modules/payment/payment.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/users',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/profile',
        route: profile_route_1.ProfileRoutes,
    },
    {
        path: '/posts',
        route: post_route_1.PostRoutes,
    },
    {
        path: '/comments',
        route: comment_route_1.CommentRoutes,
    },
    {
        path: '/payments',
        route: payment_route_1.PaymentRoutes,
    }
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
