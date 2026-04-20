export type Category =
  | 'Ρούχα'
  | 'Ηλεκτρονικά'
  | 'Έπιπλα'
  | 'Βιβλία'
  | 'Παιχνίδια'
  | 'Αθλητικά'
  | 'Κοσμήματα'
  | 'Άλλα';

export type Condition = 'new' | 'like_new' | 'good' | 'fair';
export type Location = 'Λευκωσία' | 'Λεμεσός' | 'Λάρνακα' | 'Πάφος' | 'Αμμόχωστος';

export interface MockUser {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  location: Location;
  rating: number;
  reviewCount: number;
  memberSince: string;
  verified: boolean;
  bio: string;
}

export interface MockListing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: Condition;
  location: Location;
  status: 'active' | 'sold' | 'reserved';
  views: number;
  images: string[];
  createdAt: string;
  promoted?: boolean;
}

export const CONDITION_LABELS: Record<Condition, string> = {
  new: 'Καινούργιο',
  like_new: 'Σαν καινούργιο',
  good: 'Καλή κατάσταση',
  fair: 'Μέτρια κατάσταση',
};

export const CATEGORIES: Category[] = [
  'Ρούχα',
  'Ηλεκτρονικά',
  'Έπιπλα',
  'Βιβλία',
  'Παιχνίδια',
  'Αθλητικά',
  'Κοσμήματα',
  'Άλλα',
];

export const LOCATIONS: Location[] = [
  'Λευκωσία',
  'Λεμεσός',
  'Λάρνακα',
  'Πάφος',
  'Αμμόχωστος',
];

export const CATEGORY_ICONS: Record<Category, string> = {
  'Ρούχα': '👗',
  'Ηλεκτρονικά': '💻',
  'Έπιπλα': '🛋️',
  'Βιβλία': '📚',
  'Παιχνίδια': '🎮',
  'Αθλητικά': '⚽',
  'Κοσμήματα': '💍',
  'Άλλα': '📦',
};

export const MOCK_USERS: MockUser[] = [
  {
    id: 'u1',
    username: 'maria_nik',
    fullName: 'Μαρία Νικολάου',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    location: 'Λεμεσός',
    rating: 4.9,
    reviewCount: 47,
    memberSince: '2023-03',
    verified: true,
    bio: 'Λατρεύω τη μόδα και το recycling! Πουλάω ρούχα που δεν φοράω πλέον.',
  },
  {
    id: 'u2',
    username: 'kostas_tech',
    fullName: 'Κώστας Παπαδόπουλος',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kostas',
    location: 'Λευκωσία',
    rating: 4.7,
    reviewCount: 23,
    memberSince: '2023-07',
    verified: true,
    bio: 'Tech enthusiast. Πουλάω gadgets και ηλεκτρονικά που αναβαθμίζω.',
  },
  {
    id: 'u3',
    username: 'elena_lim',
    fullName: 'Ελένη Χριστοδούλου',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
    location: 'Λάρνακα',
    rating: 5.0,
    reviewCount: 12,
    memberSince: '2024-01',
    verified: false,
    bio: 'Φιλόβιβλη. Ανταλλάσσω και πουλάω βιβλία από τη συλλογή μου.',
  },
  {
    id: 'u4',
    username: 'antreas_sport',
    fullName: 'Ανδρέας Σολομωνίδης',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=antreas',
    location: 'Πάφος',
    rating: 4.6,
    reviewCount: 31,
    memberSince: '2023-05',
    verified: true,
    bio: 'Αθλητής. Πουλάω αθλητικό εξοπλισμό σε άριστη κατάσταση.',
  },
  {
    id: 'u5',
    username: 'sofia_design',
    fullName: 'Σοφία Κωνσταντίνου',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia',
    location: 'Λεμεσός',
    rating: 4.8,
    reviewCount: 19,
    memberSince: '2023-09',
    verified: false,
    bio: 'Interior designer. Πουλάω έπιπλα και διακοσμητικά.',
  },
];

// Using Unsplash images by category for realistic look
const LISTING_IMAGES = {
  clothes: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80',
    'https://images.unsplash.com/photo-1542060748-10c28b62716f?w=600&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80',
  ],
  electronics: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
    'https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=600&q=80',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
  ],
  furniture: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80',
  ],
  books: [
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
  ],
  sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  ],
  jewelry: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  ],
};

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: 'l1',
    sellerId: 'u1',
    title: 'Zara φόρεμα - Καλοκαιρινό floral print',
    description: 'Πανέμορφο καλοκαιρινό φόρεμα από Zara, μέγεθος M. Φορεμένο μόνο 2 φορές. Έρχεται από ελεύθερο κατοικίδιου/καπνίσματος σπίτι. Πολύ ελαφρύ ύφασμα, ιδανικό για παραλία ή βολτούλα.',
    price: 18,
    category: 'Ρούχα',
    condition: 'like_new',
    location: 'Λεμεσός',
    status: 'active',
    views: 124,
    images: [LISTING_IMAGES.clothes[0], LISTING_IMAGES.clothes[1]],
    createdAt: '2024-11-15T10:30:00Z',
    promoted: true,
  },
  {
    id: 'l2',
    sellerId: 'u2',
    title: 'MacBook Pro 2021 M1 - 8GB RAM 256GB',
    description: 'MacBook Pro 13" M1 chip, 2021. Σε εξαιρετική κατάσταση. Έχει αλλαχθεί η μπαταρία στο Apple Service 6 μήνες πριν (εγγύηση). Πωλείται λόγω αναβάθμισης σε M3. Περιλαμβάνει original charger και box.',
    price: 780,
    category: 'Ηλεκτρονικά',
    condition: 'good',
    location: 'Λευκωσία',
    status: 'active',
    views: 342,
    images: [LISTING_IMAGES.electronics[0], LISTING_IMAGES.electronics[1]],
    createdAt: '2024-11-14T09:15:00Z',
    promoted: true,
  },
  {
    id: 'l3',
    sellerId: 'u5',
    title: 'IKEA KALLAX βιβλιοθήκη 4x4',
    description: 'KALLAX βιβλιοθήκη σε λευκό χρώμα, 147x147cm. Σε άριστη κατάσταση, χωρίς γρατζουνιές. Αποσυναρμολογείται εύκολα. Παραλαβή μόνο από Λεμεσό (δεν αποστέλλεται).',
    price: 65,
    category: 'Έπιπλα',
    condition: 'good',
    location: 'Λεμεσός',
    status: 'active',
    views: 89,
    images: [LISTING_IMAGES.furniture[0], LISTING_IMAGES.furniture[1]],
    createdAt: '2024-11-13T14:00:00Z',
  },
  {
    id: 'l4',
    sellerId: 'u3',
    title: 'Harry Potter και η Φιλοσοφική Λίθος - Πρώτη έκδοση ΕΛ',
    description: 'Η πρώτη ελληνική έκδοση του Harry Potter. Εξαιρετική κατάσταση, με σκληρό εξώφυλλο. Ιδανικό για collectors ή δώρο.',
    price: 25,
    category: 'Βιβλία',
    condition: 'good',
    location: 'Λάρνακα',
    status: 'active',
    views: 67,
    images: [LISTING_IMAGES.books[0]],
    createdAt: '2024-11-12T11:20:00Z',
  },
  {
    id: 'l5',
    sellerId: 'u4',
    title: 'Ποδήλατο βουνού Trek Marlin 5 - 29"',
    description: 'Trek Marlin 5, 2022 model. 29" τροχοί, 21 ταχύτητες Shimano. Σε άριστη κατάσταση, σέρβις 3 μήνες πριν. Ύψος αναβάτη 175-190cm. Λόγω μετακόμισης.',
    price: 450,
    category: 'Αθλητικά',
    condition: 'like_new',
    location: 'Πάφος',
    status: 'active',
    views: 198,
    images: [LISTING_IMAGES.sports[0], LISTING_IMAGES.sports[1]],
    createdAt: '2024-11-11T16:45:00Z',
    promoted: true,
  },
  {
    id: 'l6',
    sellerId: 'u1',
    title: 'Χρυσό βραχιόλι 18Κ με μπρελόκ',
    description: 'Βραχιόλι 18 καρατίων χρυσό, με 3 μπρελόκ (καρδιά, αστέρι, φεγγάρι). Διάμετρος 17cm, με κλιπ ασφαλείας. Με πιστοποιητικό γνησιότητας.',
    price: 180,
    category: 'Κοσμήματα',
    condition: 'like_new',
    location: 'Λεμεσός',
    status: 'active',
    views: 211,
    images: [LISTING_IMAGES.jewelry[0]],
    createdAt: '2024-11-10T12:00:00Z',
  },
  {
    id: 'l7',
    sellerId: 'u2',
    title: 'iPhone 13 Pro 256GB - Sierra Blue',
    description: 'iPhone 13 Pro 256GB σε Sierra Blue. Battery health 89%. Χωρίς ζημιές, με tempered glass από αγορά. Πωλείται με original καλώδιο. Unlocked.',
    price: 420,
    category: 'Ηλεκτρονικά',
    condition: 'good',
    location: 'Λευκωσία',
    status: 'active',
    views: 289,
    images: [LISTING_IMAGES.electronics[2], LISTING_IMAGES.electronics[3]],
    createdAt: '2024-11-09T09:00:00Z',
  },
  {
    id: 'l8',
    sellerId: 'u5',
    title: 'Καρέκλα γραφείου Herman Miller Aeron',
    description: 'Θρυλική καρέκλα γραφείου Herman Miller Aeron, Size B (medium). Σε καλή κατάσταση με μερικά σημάδια χρήσης στα μπράτσα. Εγγύηση ακόμα active. Τιμή αγοράς €1,400.',
    price: 550,
    category: 'Έπιπλα',
    condition: 'good',
    location: 'Λεμεσός',
    status: 'active',
    views: 156,
    images: [LISTING_IMAGES.furniture[2]],
    createdAt: '2024-11-08T13:30:00Z',
    promoted: true,
  },
  {
    id: 'l9',
    sellerId: 'u4',
    title: 'Nike Air Max 90 - Νούμερο 43',
    description: 'Nike Air Max 90 "infrared", νούμερο 43. Φορεμένα περίπου 10 φορές, σε πολύ καλή κατάσταση. Χωρίς ζημιές. Σε original κουτί.',
    price: 75,
    category: 'Αθλητικά',
    condition: 'like_new',
    location: 'Πάφος',
    status: 'active',
    views: 143,
    images: [LISTING_IMAGES.sports[2]],
    createdAt: '2024-11-07T10:15:00Z',
  },
  {
    id: 'l10',
    sellerId: 'u3',
    title: 'Σετ βιβλίων "Το Όνομα του Ρόδου" + "Foucault\'s Pendulum"',
    description: 'Umberto Eco classics σε ελληνική μετάφραση. Σε πολύ καλή κατάσταση, διαβασμένα με προσοχή. Πουλιούνται ως σετ μόνο.',
    price: 20,
    category: 'Βιβλία',
    condition: 'good',
    location: 'Λάρνακα',
    status: 'active',
    views: 45,
    images: [LISTING_IMAGES.books[1]],
    createdAt: '2024-11-06T15:00:00Z',
  },
  {
    id: 'l11',
    sellerId: 'u1',
    title: 'Μάξι φούστα boho - One size',
    description: 'Boho style μάξι φούστα σε εκρού χρώμα με κεντητά στοιχεία. One size (S-L). Νέο, αχρησιμοποίητο, με ετικέτες.',
    price: 22,
    category: 'Ρούχα',
    condition: 'new',
    location: 'Λεμεσός',
    status: 'active',
    views: 78,
    images: [LISTING_IMAGES.clothes[2]],
    createdAt: '2024-11-05T11:45:00Z',
  },
  {
    id: 'l12',
    sellerId: 'u2',
    title: 'Sony WH-1000XM5 Ακουστικά Bluetooth',
    description: 'Sony WH-1000XM5 ασύρματα ακουστικά ANC. Αγορά 6 μήνες πριν. Σε άριστη κατάσταση, με original case, καλώδιο, adaptor. Battery life εξαιρετική.',
    price: 220,
    category: 'Ηλεκτρονικά',
    condition: 'like_new',
    location: 'Λευκωσία',
    status: 'active',
    views: 267,
    images: [LISTING_IMAGES.electronics[1]],
    createdAt: '2024-11-04T08:30:00Z',
  },
  {
    id: 'l13',
    sellerId: 'u5',
    title: 'Καναπές 3θέσιος IKEA EKTORP - Λευκό',
    description: 'EKTORP καναπές 3θέσιος σε λευκό, αφαιρούμενο και πλενόμενο κάλυμμα. Σε καλή κατάσταση. Αποσυναρμολογείται. Παραλαβή από Λεμεσό μόνο.',
    price: 120,
    category: 'Έπιπλα',
    condition: 'good',
    location: 'Λεμεσός',
    status: 'active',
    views: 201,
    images: [LISTING_IMAGES.furniture[1]],
    createdAt: '2024-11-03T14:20:00Z',
  },
  {
    id: 'l14',
    sellerId: 'u4',
    title: 'PlayStation 5 + 2 χειριστήρια + 5 παιχνίδια',
    description: 'PS5 Disc Edition σε άριστη κατάσταση. Ηλικία: 1 χρόνο. Παιχνίδια: God of War Ragnarök, Horizon Forbidden West, Elden Ring, Spider-Man: Miles Morales, GT7. Λόγω ανάγκης.',
    price: 450,
    category: 'Παιχνίδια',
    condition: 'like_new',
    location: 'Λευκωσία',
    status: 'active',
    views: 512,
    images: [LISTING_IMAGES.electronics[2]],
    createdAt: '2024-11-02T09:45:00Z',
    promoted: true,
  },
  {
    id: 'l15',
    sellerId: 'u3',
    title: 'Ασημένιο δαχτυλίδι με Labradorite',
    description: 'Χειροποίητο ασημένιο δαχτυλίδι (925) με φυσικό Labradorite. Νούμερο 54 (EU). Αγορά από τοπική τεχνίτρια. Μοναδικό αντικείμενο.',
    price: 45,
    category: 'Κοσμήματα',
    condition: 'new',
    location: 'Λάρνακα',
    status: 'active',
    views: 88,
    images: [LISTING_IMAGES.jewelry[1]],
    createdAt: '2024-11-01T12:10:00Z',
  },
  {
    id: 'l16',
    sellerId: 'u1',
    title: 'Pull & Bear τζιν παντελόνι - Mom jeans 38',
    description: 'Mom jeans από Pull & Bear, νούμερο 38. Σε πολύ καλή κατάσταση, ανοιχτό μπλε χρώμα. Φορεμένο 3-4 φορές μόνο.',
    price: 15,
    category: 'Ρούχα',
    condition: 'like_new',
    location: 'Λεμεσός',
    status: 'sold',
    views: 203,
    images: [LISTING_IMAGES.clothes[3]],
    createdAt: '2024-10-28T10:00:00Z',
  },
  {
    id: 'l17',
    sellerId: 'u2',
    title: 'iPad Air 5th Gen 64GB WiFi - Space Gray',
    description: 'iPad Air 5th generation, 64GB, WiFi only, Space Gray. Battery health 94%. Χωρίς ζημιές, με θήκη Smart Folio (original). Πωλείται επειδή πήρα laptop.',
    price: 390,
    category: 'Ηλεκτρονικά',
    condition: 'good',
    location: 'Λευκωσία',
    status: 'active',
    views: 176,
    images: [LISTING_IMAGES.electronics[0]],
    createdAt: '2024-10-25T09:30:00Z',
  },
  {
    id: 'l18',
    sellerId: 'u4',
    title: 'Τένις ρακέτα Wilson Blade 98 v8.0',
    description: 'Wilson Blade 98 v8.0, 305g. Σε εξαιρετική κατάσταση, νέα τεντίσματα 2 μήνες πριν (Luxilon Alu Power). Με προστατευτικό grip. Χρησιμοποιήθηκε 5-6 φορές μόνο.',
    price: 130,
    category: 'Αθλητικά',
    condition: 'like_new',
    location: 'Πάφος',
    status: 'active',
    views: 94,
    images: [LISTING_IMAGES.sports[1]],
    createdAt: '2024-10-20T11:00:00Z',
  },
  {
    id: 'l19',
    sellerId: 'u5',
    title: 'Επιτραπέζιο φωτιστικό vintage brass',
    description: 'Vintage επιτραπέζιο φωτιστικό σε brass finish, ύψος 45cm. Σε άριστη κατάσταση, λειτουργεί τέλεια. Ιδανικό για boho ή industrial decor.',
    price: 35,
    category: 'Έπιπλα',
    condition: 'good',
    location: 'Λεμεσός',
    status: 'active',
    views: 112,
    images: [LISTING_IMAGES.furniture[0]],
    createdAt: '2024-10-15T14:00:00Z',
  },
  {
    id: 'l20',
    sellerId: 'u3',
    title: 'Σετ 10 βιβλίων αστρονομίας - Carl Sagan',
    description: 'Πλήρης συλλογή Carl Sagan στα Ελληνικά: Cosmos, Pale Blue Dot, Contact και άλλα. Σε πολύ καλή κατάσταση. Ιδανικό δώρο για λάτρεις της επιστήμης.',
    price: 55,
    category: 'Βιβλία',
    condition: 'good',
    location: 'Λάρνακα',
    status: 'active',
    views: 73,
    images: [LISTING_IMAGES.books[0]],
    createdAt: '2024-10-10T09:20:00Z',
  },
];

export function getListingById(id: string): MockListing | undefined {
  return MOCK_LISTINGS.find((l) => l.id === id);
}

export function getUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getListingsByUser(userId: string): MockListing[] {
  return MOCK_LISTINGS.filter((l) => l.sellerId === userId);
}

export function searchListings(
  query: string,
  filters: {
    category?: Category;
    location?: Location;
    minPrice?: number;
    maxPrice?: number;
    condition?: Condition;
  } = {}
): MockListing[] {
  return MOCK_LISTINGS.filter((l) => {
    if (l.status === 'sold') return false;
    if (query) {
      const q = query.toLowerCase();
      if (!l.title.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filters.category && l.category !== filters.category) return false;
    if (filters.location && l.location !== filters.location) return false;
    if (filters.condition && l.condition !== filters.condition) return false;
    if (filters.minPrice !== undefined && l.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && l.price > filters.maxPrice) return false;
    return true;
  });
}
