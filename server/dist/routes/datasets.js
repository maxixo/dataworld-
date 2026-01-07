"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const datasetController_1 = require("../controllers/datasetController");
const auth_1 = require("../middleware/auth"); // We need to create this middleware
const router = express_1.default.Router();
router.post('/', auth_1.auth, datasetController_1.uploadDataset);
router.get('/', auth_1.auth, datasetController_1.getDatasets);
router.get('/:id', auth_1.auth, datasetController_1.getDatasetById);
router.get('/:id/blob', auth_1.auth, datasetController_1.getDatasetBlob);
exports.default = router;
