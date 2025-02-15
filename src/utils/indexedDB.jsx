// src/utils/indexedDB.js

const DB_NAME = "WasherManDB";
const DB_VERSION = 2; // 🔹 Increase version to trigger upgrade
const STORE_NAME = "users";
const WASH_STORE = "GivenClothforWash"; // 🔹 New store

// Open IndexedDB
export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // ✅ Create 'users' store if not exists
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }

            // ✅ Create 'GivenClothforWash' store if not exists
            if (!db.objectStoreNames.contains(WASH_STORE)) {
                db.createObjectStore(WASH_STORE, { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            console.log("Database opened successfully");
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error("Database opening error:", event.target.error);
            reject(event.target.error);
        };
    });
}
// Add user object with clothes
export async function addUser(userName, userCloth = []) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add({ userName, userCloth });

        request.onsuccess = () => resolve("User added successfully!");
        request.onerror = (event) => reject(event.target.error);
    });
}

// Get all users
export async function getUsers() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Add clothes to a specific user
export async function addClothToUser(userId, clothItem) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(userId);

        request.onsuccess = () => {
            const user = request.result;
            if (user) {
                user.userCloth.push(clothItem);
                const updateRequest = store.put(user);
                updateRequest.onsuccess = () => resolve("Cloth added successfully!");
                updateRequest.onerror = (event) => reject(event.target.error);
            } else {
                reject("User not found!");
            }
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

// Delete a user
export async function deleteUser(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve("User deleted successfully!");
        request.onerror = (event) => reject(event.target.error);
    });
}

export const addClothForWash = async (washData) => {
    const db = await openDB(); // Ensure DB is opened properly
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(WASH_STORE, "readwrite");
        const store = transaction.objectStore(WASH_STORE);

        const request = store.add(washData);

        request.onsuccess = () => {
            console.log("✅ Clothes added for wash:", washData);
            resolve("Added Successfully");
        };

        request.onerror = (error) => {
            console.error("❌ Error adding clothes for wash:", error);
            reject(error);
        };
    });
};

export const getGivenClothesForWash = async () => {
    const db = await openDB(); // ✅ Use openDB
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("GivenClothforWash", "readonly");
        const store = transaction.objectStore("GivenClothforWash");

        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (error) => {
            reject(error);
        };
    });
};


export const deleteGivenClothForWash = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("GivenClothforWash", "readwrite");
        const store = transaction.objectStore("GivenClothforWash");
        const request = store.delete(id);

        request.onsuccess = () => {
            console.log(`✅ Record with ID ${id} deleted`);
            resolve();
        };

        request.onerror = (event) => {
            console.error("❌ Error deleting record:", event.target.error);
            reject(event.target.error);
        };
    });
};


export const updateUserClothes = async (userId, updatedClothes) => {
    debugger
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("users", "readwrite");
        const store = tx.objectStore("users");

        const request = store.get(userId);

        request.onsuccess = () => {
            const user = request.result;
            if (user) {
                const updatedUser = {
                    id: user.id,
                    userName: user.userName,
                    userCloth: updatedClothes
                };

                const updateRequest = store.put(updatedUser);

                updateRequest.onsuccess = () => {
                    console.log("✅ User clothes updated successfully!");
                    resolve();
                };

                updateRequest.onerror = (event) => {
                    console.error("❌ Error updating user:", event.target.error);
                    reject(event.target.error);
                };
            } else {
                console.error("❌ User not found for ID:", userId);
                reject("User not found!");
            }
        };

        request.onerror = (event) => {
            console.error("❌ Error fetching user:", event.target.error);
            reject(event.target.error);
        };
    });
};







