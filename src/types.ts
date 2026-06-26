export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Rabbit' | 'Bird' | string;
  breed: string;
  age: string;
  gender: '公' | '母' | string;
  personalityTags: string[];
  imageUrl: string;
  description: string;
  status: '待認養' | '審核中' | '已認養' | string;
  contactInfo: string;
  createdAt: string;
}

export interface Application {
  id: string;
  petId: string;
  petName: string;
  petImageUrl: string;
  userId: string;
  userName: string;
  userEmail: string;
  phone: string;
  occupation: string;
  experience: '新手' | '有養過狗/貓' | '養寵十冬以上' | string;
  reason: string;
  status: '已送出' | '審核中' | '已批准' | '已拒絕' | string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  petId: string;
  createdAt: string;
}
