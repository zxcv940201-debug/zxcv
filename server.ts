import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';


const app = express();
const PORT = 3000;

app.use(express.json());

// Firebase configuration from patient spec
const firebaseConfig = {
  apiKey: "AIzaSyCYY_dAwtwrlwSWMMedbyBB2Go5LkGzpVg",
  authDomain: "gogo123-37e6f.firebaseapp.com",
  projectId: "gogo123-37e6f",
  storageBucket: "gogo123-37e6f.firebasestorage.app",
  messagingSenderId: "752561939705",
  appId: "1:752561939705:web:471825ce6863dd838aee28",
  measurementId: "G-RNJRLFKRSW"
};

// Initialize Firebase representation for server context
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// Default Pets Seed Data
const DEFAULT_PETS = [
  {
    name: "可樂",
    species: "Dog",
    breed: "黃金獵犬",
    age: "2歲",
    gender: "公",
    personalityTags: ["親人", "活潑", "愛玩水"],
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
    description: "非常親人、溫暖熱情的小男生。很喜歡玩水和玩飛盤，適合有活力、有空帶他出去跑步的家庭。",
    status: "待認養",
    contactInfo: "0912-345-678 陳小姐",
    createdAt: new Date().toISOString()
  },
  {
    name: "咪咪",
    species: "Cat",
    breed: "橘貓 / 米克斯",
    age: "8個月",
    gender: "母",
    personalityTags: ["撒嬌", "安靜", "愛乾淨"],
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
    description: "非常乖巧的小女生，一摸就會發出舒服的呼嚕聲。已經學會使用貓砂盆，很適合公寓生活陪伴。",
    status: "待認養",
    contactInfo: "0923-456-789 林先生",
    createdAt: new Date().toISOString()
  },
  {
    name: "黑皮",
    species: "Dog",
    breed: "臺灣犬 / 米克斯",
    age: "1歲",
    gender: "公",
    personalityTags: ["忠誠", "聰明", "警戒心"],
    imageUrl: "https://images.unsplash.com/photo-1537151608828-ea2b117b6281?auto=format&fit=crop&q=80&w=600",
    description: "聰明機警，指令學習能力超級快。對主人十分忠誠，會是看家護院與生活探索的最佳夥伴。",
    status: "待認養",
    contactInfo: "0934-567-890 張先生",
    createdAt: new Date().toISOString()
  },
  {
    name: "麻糬",
    species: "Rabbit",
    breed: "獅子兔",
    age: "1歲半",
    gender: "母",
    personalityTags: ["溫馴", "害羞", "愛吃草"],
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600",
    description: "雪白絨毛像一顆大麻糬！性格比較害羞，需要耐心照顧。最中意新鮮牧草與烘乾胡蘿蔔乾片。",
    status: "待認養",
    contactInfo: "0945-678-901 謝小姐",
    createdAt: new Date().toISOString()
  },
  {
    name: "泡泡",
    species: "Cat",
    breed: "英國短毛貓",
    age: "3歲",
    gender: "公",
    personalityTags: ["獨立", "呆萌", "愛罐罐"],
    imageUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600",
    description: "身材圓滾滾的英短男生，平常看起來高冷獨立，但只要開罐罐就會跑來繞著你撒嬌，熱愛日光浴。",
    status: "待認養",
    contactInfo: "0956-789-012 廖先生",
    createdAt: new Date().toISOString()
  },
  {
    name: "啾啾",
    species: "Bird",
    breed: "玄鳳鸚鵡",
    age: "6個月",
    gender: "公",
    personalityTags: ["黏人", "好歌喉", "好奇心"],
    imageUrl: "https://images.unsplash.com/photo-1522850959074-b7c3d2524bc7?auto=format&fit=crop&q=80&w=600",
    description: "超級活潑好動的玄鳳，會吹哼哼幾首簡單小曲子。很依賴人，常常停在肩膀上當貼身保鏢。",
    status: "待認養",
    contactInfo: "0967-890-123 許小姐",
    createdAt: new Date().toISOString()
  }
];

let cachedInMemoryPets = [...DEFAULT_PETS].map((p, i) => ({ ...p, id: `seed_${i}` }));
let cachedInMemoryApplications: any[] = [];
let cachedInMemoryFavorites: any[] = [];

// Seed database on setup
async function seedDatabaseIfEmpty() {
  try {
    const petsRef = collection(db, 'pets');
    const petSnap = await getDocs(petsRef);
    if (petSnap.empty) {
      console.log("Firestore pets collection is empty! Seeding default pet profiles...");
      for (const pet of DEFAULT_PETS) {
        await addDoc(petsRef, pet);
      }
      console.log("Successfully seeded pets collection.");
    } else {
      console.log(`Firestore already has ${petSnap.size} pet documents. Skipping seed.`);
    }
  } catch (error) {
    console.warn("Could not seed Firestore (this is common if database rules deny public write, or auth is pending). Using memory-cached backup in Server. Error details:", error);
  }
}

// Perform seed
seedDatabaseIfEmpty();

// --- BACKEND API ROUTES ---

// 1. GET /api/pets - Get list of pets (optionally filtered by species and personality tags)
app.get('/api/pets', async (req, res) => {
  try {
    const { species, tag, search } = req.query;
    
    // First attempt Firestore query
    try {
      const petsRef = collection(db, 'pets');
      const petSnap = await getDocs(petsRef);
      let list = petSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      if (list.length === 0) {
        // Fallback to seeded local cache
        list = cachedInMemoryPets;
      }

      // Apply filtrations
      if (species && species !== 'all') {
        list = list.filter(p => p.species.toLowerCase() === (species as string).toLowerCase());
      }
      if (tag && tag !== 'all') {
        list = list.filter(p => p.personalityTags && p.personalityTags.includes(tag as string));
      }
      if (search) {
        const queryTerm = (search as string).toLowerCase();
        list = list.filter(p => 
          p.name.toLowerCase().includes(queryTerm) || 
          p.breed.toLowerCase().includes(queryTerm) ||
          p.description.toLowerCase().includes(queryTerm)
        );
      }

      return res.json(list);
    } catch {
      // Fallback completely to memory cache
      let list = [...cachedInMemoryPets];
      if (species && species !== 'all') {
        list = list.filter(p => p.species.toLowerCase() === (species as string).toLowerCase());
      }
      if (tag && tag !== 'all') {
        list = list.filter(p => p.personalityTags && p.personalityTags.includes(tag as string));
      }
      if (search) {
        const queryTerm = (search as string).toLowerCase();
        list = list.filter(p => 
          p.name.toLowerCase().includes(queryTerm) || 
          p.breed.toLowerCase().includes(queryTerm) ||
          p.description.toLowerCase().includes(queryTerm)
        );
      }
      return res.json(list);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/pets/:id - Get detail of a specific pet
app.get('/api/pets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    try {
      const petDocRef = doc(db, 'pets', id);
      const petSnap = await getDoc(petDocRef);
      if (petSnap.exists()) {
        return res.json({ id: petSnap.id, ...petSnap.data() });
      }
    } catch {
      // search in memory
    }

    const memoryPet = cachedInMemoryPets.find(p => p.id === id);
    if (memoryPet) {
      return res.json(memoryPet);
    }
    return res.status(404).json({ error: "Pet not found." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/pets - Create a new pet listing
app.post('/api/pets', async (req, res) => {
  try {
    const { name, species, breed, age, gender, personalityTags, imageUrl, description, contactInfo } = req.body;
    
    if (!name || !species || !breed || !age || !gender || !personalityTags || !imageUrl) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newPet = {
      name,
      species,
      breed,
      age,
      gender,
      personalityTags: Array.isArray(personalityTags) ? personalityTags : [personalityTags],
      imageUrl,
      description: description || "無詳細說明",
      status: "待認養",
      contactInfo: contactInfo || "請聯絡平台客服",
      createdAt: new Date().toISOString()
    };

    let id = `mem_${Date.now()}`;
    try {
      const docRef = await addDoc(collection(db, 'pets'), newPet);
      id = docRef.id;
    } catch {
      console.warn("Firestore write skipped, saving pet listing to memory cache instead.");
    }

    const savedPet = { id, ...newPet };
    cachedInMemoryPets.unshift(savedPet);
    return res.status(201).json(savedPet);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/applications - Submit pet adoption request
app.post('/api/applications', async (req, res) => {
  try {
    const { petId, petName, petImageUrl, userId, userName, userEmail, phone, occupation, experience, reason } = req.body;
    
    if (!petId || !userId || !userName || !userEmail || !phone || !reason) {
      return res.status(400).json({ error: "Missing required adoption request fields." });
    }

    const newApplication = {
      petId,
      petName,
      petImageUrl: petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
      userId,
      userName,
      userEmail,
      phone,
      occupation: occupation || "未提供",
      experience: experience || "新手",
      reason,
      status: "已送出",
      createdAt: new Date().toISOString()
    };

    let id = `app_${Date.now()}`;
    try {
      const docRef = await addDoc(collection(db, 'applications'), newApplication);
      id = docRef.id;
      
      // Update pet status to '審核中' on Firestore
      try {
        const petRef = doc(db, 'pets', petId);
        await setDoc(petRef, { status: "審核中" }, { merge: true });
      } catch (err) {
        console.warn("Could not automatically update pet status inside Firestore:", err);
      }
    } catch {
      console.warn("Saving application to memory cache.");
    }

    // Update state inside memory cache
    const targetPet = cachedInMemoryPets.find(p => p.id === petId);
    if (targetPet) {
      targetPet.status = "審核中";
    }

    const savedApp = { id, ...newApplication };
    cachedInMemoryApplications.unshift(savedApp);
    return res.status(201).json(savedApp);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. GET /api/applications - Get all submissions
app.get('/api/applications', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId query parameter." });
    }

    try {
      const appsRef = collection(db, 'applications');
      const q = query(appsRef, where("userId", "==", userId as string));
      const querySnap = await getDocs(q);
      
      let list = querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (list.length === 0) {
        list = cachedInMemoryApplications.filter(a => a.userId === userId);
      }
      return res.json(list);
    } catch {
      const list = cachedInMemoryApplications.filter(a => a.userId === userId);
      return res.json(list);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. POST /api/favorites - Toggle collection favor state
app.post('/api/favorites', async (req, res) => {
  try {
    const { userId, petId } = req.body;
    if (!userId || !petId) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    const favoriteId = `${userId}_${petId}`;
    let action = 'added';

    try {
      const favRef = doc(db, 'favorites', favoriteId);
      const favSnap = await getDoc(favRef);
      if (favSnap.exists()) {
        await deleteDoc(favRef);
        action = 'removed';
      } else {
        await setDoc(favRef, {
          userId,
          petId,
          createdAt: new Date().toISOString()
        });
      }
    } catch {
      console.warn("Firestore favorites interaction skipped, updating memory records.");
    }

    // Always maintain memory-cached list
    const index = cachedInMemoryFavorites.findIndex(f => f.userId === userId && f.petId === petId);
    if (index > -1) {
      cachedInMemoryFavorites.splice(index, 1);
      action = 'removed';
    } else {
      cachedInMemoryFavorites.push({ id: favoriteId, userId, petId, createdAt: new Date().toISOString() });
      action = 'added';
    }

    return res.json({ status: "success", action });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. GET /api/favorites - Get user favorites list
app.get('/api/favorites', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId query parameter." });
    }

    try {
      const favRef = collection(db, 'favorites');
      const q = query(favRef, where("userId", "==", userId as string));
      const querySnap = await getDocs(q);
      
      let list = querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (list.length === 0) {
        list = cachedInMemoryFavorites.filter(f => f.userId === userId);
      }
      return res.json(list);
    } catch {
      const list = cachedInMemoryFavorites.filter(f => f.userId === userId);
      return res.json(list);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- INTEGRATING VITE DEV SERVER / PRODUCTION SERVING ---
async function start() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`即時寵物認養資訊平台 Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch(err => {
  console.error("Error starting Express application server:", err);
});
