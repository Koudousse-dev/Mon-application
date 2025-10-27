// IndexedDB storage for offline functionality
class LocalStorage {
  private dbName = 'GardeEnfantsDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Parent requests store
        if (!db.objectStoreNames.contains('parentRequests')) {
          const store = db.createObjectStore('parentRequests', { keyPath: 'id', autoIncrement: true });
          store.createIndex('dateCreation', 'dateCreation', { unique: false });
        }
        
        // Nanny applications store
        if (!db.objectStoreNames.contains('nannyApplications')) {
          const store = db.createObjectStore('nannyApplications', { keyPath: 'id', autoIncrement: true });
          store.createIndex('dateCreation', 'dateCreation', { unique: false });
        }
        
        // Contact messages store
        if (!db.objectStoreNames.contains('contactMessages')) {
          const store = db.createObjectStore('contactMessages', { keyPath: 'id', autoIncrement: true });
          store.createIndex('dateCreation', 'dateCreation', { unique: false });
        }
        
        // Sync queue for offline submissions
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async storeParentRequest(data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['parentRequests'], 'readwrite');
      const store = transaction.objectStore('parentRequests');
      
      const requestData = {
        ...data,
        dateCreation: new Date(),
        synced: false
      };
      
      const request = store.add(requestData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async storeNannyApplication(data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['nannyApplications'], 'readwrite');
      const store = transaction.objectStore('nannyApplications');
      
      const applicationData = {
        ...data,
        dateCreation: new Date(),
        synced: false
      };
      
      const request = store.add(applicationData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async storeContactMessage(data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['contactMessages'], 'readwrite');
      const store = transaction.objectStore('contactMessages');
      
      const messageData = {
        ...data,
        dateCreation: new Date(),
        synced: false
      };
      
      const request = store.add(messageData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const localStorage = new LocalStorage();
