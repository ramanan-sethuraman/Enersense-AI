import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.VERCEL
  ? '/tmp/enersense_data'
  : path.resolve(__dirname, '../../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

interface StoreData {
  [collection: string]: any[];
}

class JsonStore {
  private data: StoreData = {};
  private isLoaded = false;

  constructor() {
    this.ensureStore();
  }

  private ensureStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        this.isLoaded = true;
      } else {
        this.data = {};
        this.save();
      }
    } catch (err) {
      console.warn('[JsonStore] Filesystem notice: operating with resilient in-memory storage on serverless.', err);
      if (!this.data) this.data = {};
      this.isLoaded = true;
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[JsonStore] Notice: data persisted in-memory (disk write restricted).');
    }
  }

  public getCollection(name: string): any[] {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  public find(collectionName: string, query: Record<string, any> = {}): any[] {
    const list = this.getCollection(collectionName);
    return list.filter((item) => {
      for (const [key, val] of Object.entries(query)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          // simple operators $gte, $lte, $gt, $lt, $in, $ne
          if ('$gte' in val && !(item[key] >= val['$gte'])) return false;
          if ('$lte' in val && !(item[key] <= val['$lte'])) return false;
          if ('$gt' in val && !(item[key] > val['$gt'])) return false;
          if ('$lt' in val && !(item[key] < val['$lt'])) return false;
          if ('$ne' in val && item[key] === val['$ne']) return false;
          if ('$in' in val && Array.isArray(val['$in']) && !val['$in'].includes(item[key])) return false;
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });
  }

  public findOne(collectionName: string, query: Record<string, any>): any | null {
    const results = this.find(collectionName, query);
    return results.length > 0 ? { ...results[0] } : null;
  }

  public findById(collectionName: string, id: string): any | null {
    return this.findOne(collectionName, { _id: id });
  }

  public insert(collectionName: string, doc: any): any {
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

  public updateById(collectionName: string, id: string, update: any): any | null {
    const collection = this.getCollection(collectionName);
    const idx = collection.findIndex((d) => d._id === id);
    if (idx === -1) return null;
    collection[idx] = {
      ...collection[idx],
      ...update,
      updatedAt: new Date(),
    };
    this.save();
    return { ...collection[idx] };
  }

  public deleteById(collectionName: string, id: string): boolean {
    const collection = this.getCollection(collectionName);
    const initialLen = collection.length;
    this.data[collectionName] = collection.filter((d) => d._id !== id);
    if (this.data[collectionName].length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public deleteMany(collectionName: string, query: Record<string, any>): number {
    const before = this.getCollection(collectionName).length;
    const remaining = this.getCollection(collectionName).filter((item) => {
      for (const [key, val] of Object.entries(query)) {
        if (item[key] === val) return false;
      }
      return true;
    });
    this.data[collectionName] = remaining;
    this.save();
    return before - remaining.length;
  }

  public clearAll() {
    this.data = {};
    this.save();
  }
}

export const jsonStore = new JsonStore();
