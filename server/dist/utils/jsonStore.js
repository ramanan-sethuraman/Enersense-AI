"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonStore = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = process.env.VERCEL
    ? '/tmp/enersense_data'
    : path_1.default.resolve(__dirname, '../../data');
const STORE_PATH = path_1.default.join(DATA_DIR, 'store.json');
class JsonStore {
    data = {};
    isLoaded = false;
    constructor() {
        this.ensureStore();
    }
    ensureStore() {
        try {
            if (!fs_1.default.existsSync(DATA_DIR)) {
                fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
            }
            if (fs_1.default.existsSync(STORE_PATH)) {
                const raw = fs_1.default.readFileSync(STORE_PATH, 'utf-8');
                this.data = JSON.parse(raw);
                this.isLoaded = true;
            }
            else {
                this.data = {};
                this.save();
            }
        }
        catch (err) {
            console.warn('[JsonStore] Filesystem notice: operating with resilient in-memory storage on serverless.', err);
            if (!this.data)
                this.data = {};
            this.isLoaded = true;
        }
    }
    save() {
        try {
            if (!fs_1.default.existsSync(DATA_DIR)) {
                fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
            }
            fs_1.default.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
        }
        catch (err) {
            console.warn('[JsonStore] Notice: data persisted in-memory (disk write restricted).');
        }
    }
    getCollection(name) {
        if (!this.data[name]) {
            this.data[name] = [];
        }
        return this.data[name];
    }
    find(collectionName, query = {}) {
        const list = this.getCollection(collectionName);
        return list.filter((item) => {
            for (const [key, val] of Object.entries(query)) {
                if (val && typeof val === 'object' && !Array.isArray(val)) {
                    // simple operators $gte, $lte, $gt, $lt, $in, $ne
                    if ('$gte' in val && !(item[key] >= val['$gte']))
                        return false;
                    if ('$lte' in val && !(item[key] <= val['$lte']))
                        return false;
                    if ('$gt' in val && !(item[key] > val['$gt']))
                        return false;
                    if ('$lt' in val && !(item[key] < val['$lt']))
                        return false;
                    if ('$ne' in val && item[key] === val['$ne'])
                        return false;
                    if ('$in' in val && Array.isArray(val['$in']) && !val['$in'].includes(item[key]))
                        return false;
                }
                else if (item[key] !== val) {
                    return false;
                }
            }
            return true;
        });
    }
    findOne(collectionName, query) {
        const results = this.find(collectionName, query);
        return results.length > 0 ? { ...results[0] } : null;
    }
    findById(collectionName, id) {
        return this.findOne(collectionName, { _id: id });
    }
    insert(collectionName, doc) {
        const collection = this.getCollection(collectionName);
        const newDoc = {
            _id: doc._id || 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
            ...doc,
            createdAt: doc.createdAt || new Date(),
            updatedAt: doc.updatedAt || new Date(),
        };
        collection.push(newDoc);
        this.save();
        return { ...newDoc };
    }
    updateById(collectionName, id, update) {
        const collection = this.getCollection(collectionName);
        const idx = collection.findIndex((d) => d._id === id);
        if (idx === -1)
            return null;
        collection[idx] = {
            ...collection[idx],
            ...update,
            updatedAt: new Date(),
        };
        this.save();
        return { ...collection[idx] };
    }
    deleteById(collectionName, id) {
        const collection = this.getCollection(collectionName);
        const initialLen = collection.length;
        this.data[collectionName] = collection.filter((d) => d._id !== id);
        if (this.data[collectionName].length !== initialLen) {
            this.save();
            return true;
        }
        return false;
    }
    deleteMany(collectionName, query) {
        const before = this.getCollection(collectionName).length;
        const remaining = this.getCollection(collectionName).filter((item) => {
            for (const [key, val] of Object.entries(query)) {
                if (item[key] === val)
                    return false;
            }
            return true;
        });
        this.data[collectionName] = remaining;
        this.save();
        return before - remaining.length;
    }
    clearAll() {
        this.data = {};
        this.save();
    }
}
exports.jsonStore = new JsonStore();
