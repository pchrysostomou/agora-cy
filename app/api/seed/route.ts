import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Demo seed data using the same Unsplash images as mock-data.ts
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

const DEMO_LISTINGS = [
  { title: 'Zara φόρεμα - Καλοκαιρινό floral print', description: 'Πανέμορφο καλοκαιρινό φόρεμα από Zara, μέγεθος M. Φορεμένο μόνο 2 φορές. Έρχεται από ελεύθερο κατοικίδιου/καπνίσματος σπίτι. Πολύ ελαφρύ ύφασμα, ιδανικό για παραλία ή βολτούλα.', price: 18, category: 'Ρούχα', condition: 'like_new', location: 'Λεμεσός', promoted: true, seller: 0, images: [LISTING_IMAGES.clothes[0], LISTING_IMAGES.clothes[1]] },
  { title: 'MacBook Pro 2021 M1 - 8GB RAM 256GB', description: 'MacBook Pro 13" M1 chip, 2021. Σε εξαιρετική κατάσταση. Έχει αλλαχθεί η μπαταρία στο Apple Service 6 μήνες πριν (εγγύηση). Πωλείται λόγω αναβάθμισης σε M3. Περιλαμβάνει original charger και box.', price: 780, category: 'Ηλεκτρονικά', condition: 'good', location: 'Λευκωσία', promoted: true, seller: 1, images: [LISTING_IMAGES.electronics[0], LISTING_IMAGES.electronics[1]] },
  { title: 'IKEA KALLAX βιβλιοθήκη 4x4', description: 'KALLAX βιβλιοθήκη σε λευκό χρώμα, 147x147cm. Σε άριστη κατάσταση, χωρίς γρατζουνιές. Αποσυναρμολογείται εύκολα. Παραλαβή μόνο από Λεμεσό.', price: 65, category: 'Έπιπλα', condition: 'good', location: 'Λεμεσός', promoted: false, seller: 0, images: [LISTING_IMAGES.furniture[0], LISTING_IMAGES.furniture[1]] },
  { title: 'Harry Potter και η Φιλοσοφική Λίθος - Πρώτη έκδοση ΕΛ', description: 'Η πρώτη ελληνική έκδοση του Harry Potter. Εξαιρετική κατάσταση, με σκληρό εξώφυλλο. Ιδανικό για collectors ή δώρο.', price: 25, category: 'Βιβλία', condition: 'good', location: 'Λάρνακα', promoted: false, seller: 1, images: [LISTING_IMAGES.books[0]] },
  { title: 'Ποδήλατο βουνού Trek Marlin 5 - 29"', description: 'Trek Marlin 5, 2022 model. 29" τροχοί, 21 ταχύτητες Shimano. Σε άριστη κατάσταση, σέρβις 3 μήνες πριν. Ύψος αναβάτη 175-190cm. Λόγω μετακόμισης.', price: 450, category: 'Αθλητικά', condition: 'like_new', location: 'Πάφος', promoted: true, seller: 0, images: [LISTING_IMAGES.sports[0], LISTING_IMAGES.sports[1]] },
  { title: 'Χρυσό βραχιόλι 18Κ με μπρελόκ', description: 'Βραχιόλι 18 καρατίων χρυσό, με 3 μπρελόκ (καρδιά, αστέρι, φεγγάρι). Διάμετρος 17cm, με κλιπ ασφαλείας. Με πιστοποιητικό γνησιότητας.', price: 180, category: 'Κοσμήματα', condition: 'like_new', location: 'Λεμεσός', promoted: false, seller: 0, images: [LISTING_IMAGES.jewelry[0]] },
  { title: 'iPhone 13 Pro 256GB - Sierra Blue', description: 'iPhone 13 Pro 256GB σε Sierra Blue. Battery health 89%. Χωρίς ζημιές, με tempered glass από αγορά. Πωλείται με original καλώδιο. Unlocked.', price: 420, category: 'Ηλεκτρονικά', condition: 'good', location: 'Λευκωσία', promoted: false, seller: 1, images: [LISTING_IMAGES.electronics[2], LISTING_IMAGES.electronics[3]] },
  { title: 'Καρέκλα γραφείου Herman Miller Aeron', description: 'Θρυλική καρέκλα γραφείου Herman Miller Aeron, Size B (medium). Σε καλή κατάσταση με μερικά σημάδια χρήσης στα μπράτσα. Εγγύηση ακόμα active. Τιμή αγοράς €1,400.', price: 550, category: 'Έπιπλα', condition: 'good', location: 'Λεμεσός', promoted: true, seller: 0, images: [LISTING_IMAGES.furniture[2]] },
  { title: 'Nike Air Max 90 - Νούμερο 43', description: 'Nike Air Max 90 "infrared", νούμερο 43. Φορεμένα περίπου 10 φορές, σε πολύ καλή κατάσταση. Χωρίς ζημιές. Σε original κουτί.', price: 75, category: 'Αθλητικά', condition: 'like_new', location: 'Πάφος', promoted: false, seller: 1, images: [LISTING_IMAGES.sports[2]] },
  { title: 'Σετ βιβλίων Umberto Eco - \"Το Όνομα του Ρόδου\"', description: 'Umberto Eco classics σε ελληνική μετάφραση. Σε πολύ καλή κατάσταση, διαβασμένα με προσοχή. Πουλιούνται ως σετ μόνο.', price: 20, category: 'Βιβλία', condition: 'good', location: 'Λάρνακα', promoted: false, seller: 0, images: [LISTING_IMAGES.books[1]] },
  { title: 'Μάξι φούστα boho - One size', description: 'Boho style μάξι φούστα σε εκρού χρώμα με κεντητά στοιχεία. One size (S-L). Νέο, αχρησιμοποίητο, με ετικέτες.', price: 22, category: 'Ρούχα', condition: 'new', location: 'Λεμεσός', promoted: false, seller: 1, images: [LISTING_IMAGES.clothes[2]] },
  { title: 'Sony WH-1000XM5 Ακουστικά Bluetooth', description: 'Sony WH-1000XM5 ασύρματα ακουστικά ANC. Αγορά 6 μήνες πριν. Σε άριστη κατάσταση, με original case, καλώδιο, adaptor. Battery life εξαιρετική.', price: 220, category: 'Ηλεκτρονικά', condition: 'like_new', location: 'Λευκωσία', promoted: false, seller: 0, images: [LISTING_IMAGES.electronics[1]] },
  { title: 'Καναπές 3θέσιος IKEA EKTORP - Λευκό', description: 'EKTORP καναπές 3θέσιος σε λευκό, αφαιρούμενο και πλενόμενο κάλυμμα. Σε καλή κατάσταση. Αποσυναρμολογείται. Παραλαβή από Λεμεσό μόνο.', price: 120, category: 'Έπιπλα', condition: 'good', location: 'Λεμεσός', promoted: false, seller: 1, images: [LISTING_IMAGES.furniture[1]] },
  { title: 'PlayStation 5 + 2 χειριστήρια + 5 παιχνίδια', description: 'PS5 Disc Edition σε άριστη κατάσταση. Ηλικία: 1 χρόνο. Παιχνίδια: God of War Ragnarök, Horizon Forbidden West, Elden Ring, Spider-Man: Miles Morales, GT7. Λόγω ανάγκης.', price: 450, category: 'Παιχνίδια', condition: 'like_new', location: 'Λευκωσία', promoted: true, seller: 0, images: [LISTING_IMAGES.electronics[2]] },
  { title: 'Ασημένιο δαχτυλίδι με Labradorite', description: 'Χειροποίητο ασημένιο δαχτυλίδι (925) με φυσικό Labradorite. Νούμερο 54 (EU). Αγορά από τοπική τεχνίτρια. Μοναδικό αντικείμενο.', price: 45, category: 'Κοσμήματα', condition: 'new', location: 'Λάρνακα', promoted: false, seller: 1, images: [LISTING_IMAGES.jewelry[1]] },
  { title: 'Pull & Bear τζιν παντελόνι - Mom jeans 38', description: 'Mom jeans από Pull & Bear, νούμερο 38. Σε πολύ καλή κατάσταση, ανοιχτό μπλε χρώμα. Φορεμένο 3-4 φορές μόνο.', price: 15, category: 'Ρούχα', condition: 'like_new', location: 'Λεμεσός', promoted: false, seller: 0, images: [LISTING_IMAGES.clothes[3]], status: 'sold' },
  { title: 'iPad Air 5th Gen 64GB WiFi - Space Gray', description: 'iPad Air 5th generation, 64GB, WiFi only, Space Gray. Battery health 94%. Χωρίς ζημιές, με θήκη Smart Folio (original). Πωλείται επειδή πήρα laptop.', price: 390, category: 'Ηλεκτρονικά', condition: 'good', location: 'Λευκωσία', promoted: false, seller: 1, images: [LISTING_IMAGES.electronics[0]] },
  { title: 'Τένις ρακέτα Wilson Blade 98 v8.0', description: 'Wilson Blade 98 v8.0, 305g. Σε εξαιρετική κατάσταση, νέα τεντίσματα 2 μήνες πριν. Με προστατευτικό grip. Χρησιμοποιήθηκε 5-6 φορές μόνο.', price: 130, category: 'Αθλητικά', condition: 'like_new', location: 'Πάφος', promoted: false, seller: 0, images: [LISTING_IMAGES.sports[1]] },
  { title: 'Επιτραπέζιο φωτιστικό vintage brass', description: 'Vintage επιτραπέζιο φωτιστικό σε brass finish, ύψος 45cm. Σε άριστη κατάσταση, λειτουργεί τέλεια. Ιδανικό για boho ή industrial decor.', price: 35, category: 'Έπιπλα', condition: 'good', location: 'Λεμεσός', promoted: false, seller: 0, images: [LISTING_IMAGES.furniture[0]] },
  { title: 'Σετ 10 βιβλίων αστρονομίας - Carl Sagan', description: 'Πλήρης συλλογή Carl Sagan στα Ελληνικά: Cosmos, Pale Blue Dot, Contact και άλλα. Σε πολύ καλή κατάσταση. Ιδανικό δώρο για λάτρεις της επιστήμης.', price: 55, category: 'Βιβλία', condition: 'good', location: 'Λάρνακα', promoted: false, seller: 1, images: [LISTING_IMAGES.books[0]] },
  { title: 'Yoga mat premium Manduka PRO', description: 'Manduka PRO yoga mat, 6mm, μαύρο. Χρησιμοποιήθηκε 10 φορές μόνο. Non-slip, εξαιρετική ποιότητα. Τιμή αγοράς €120.', price: 60, category: 'Αθλητικά', condition: 'like_new', location: 'Λευκωσία', promoted: false, seller: 0, images: [LISTING_IMAGES.sports[0]] },
];

export async function POST(request: Request) {
  // Protect with a secret token
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'agora-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const results: string[] = [];

  // ─── Create demo users ───────────────────────────────────────
  const demoUsers = [
    { email: 'maria@demo.agora.cy', password: 'demo123!', full_name: 'Μαρία Νικολάου', username: 'maria_nik', location: 'Λεμεσός', bio: 'Λατρεύω τη μόδα και το recycling! Πουλάω ρούχα που δεν φοράω πλέον.', verified: true },
    { email: 'kostas@demo.agora.cy', password: 'demo123!', full_name: 'Κώστας Παπαδόπουλος', username: 'kostas_tech', location: 'Λευκωσία', bio: 'Tech enthusiast. Πουλάω gadgets και ηλεκτρονικά που αναβαθμίζω.', verified: true },
  ];

  const userIds: string[] = [];
  for (const u of demoUsers) {
    // Check if user exists
    const { data: existing } = await adminClient.auth.admin.listUsers();
    const found = existing?.users?.find((au) => au.email === u.email);
    if (found) {
      userIds.push(found.id);
      results.push(`User already exists: ${u.email}`);
    } else {
      const { data: created, error } = await adminClient.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });
      if (error || !created.user) {
        results.push(`ERROR creating ${u.email}: ${error?.message}`);
        userIds.push('');
        continue;
      }
      userIds.push(created.user.id);

      // Update profile (trigger creates it automatically)
      await new Promise((r) => setTimeout(r, 300)); // small delay for trigger
      await adminClient.from('profiles').update({
        username: u.username,
        full_name: u.full_name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
        location: u.location,
        bio: u.bio,
        verified: u.verified,
        rating: 4.8,
        review_count: Math.floor(Math.random() * 50) + 5,
      }).eq('id', created.user.id);

      results.push(`Created user: ${u.email}`);
    }
  }

  // ─── Check if listings already exist ─────────────────────────
  const { count } = await adminClient.from('listings').select('id', { count: 'exact', head: true });
  if ((count ?? 0) > 0) {
    return NextResponse.json({
      ok: true,
      message: `Listings already seeded (${count} exist). Users: ${userIds.join(', ')}`,
      results,
    });
  }

  // ─── Insert listings ──────────────────────────────────────────
  for (const l of DEMO_LISTINGS) {
    const sellerId = userIds[l.seller];
    if (!sellerId) continue;

    const { data: listing, error: lErr } = await adminClient
      .from('listings')
      .insert({
        seller_id: sellerId,
        title: l.title,
        description: l.description,
        price: l.price,
        category: l.category,
        condition: l.condition,
        location: l.location,
        status: (l as any).status ?? 'active',
        promoted: l.promoted ?? false,
        views: Math.floor(Math.random() * 400) + 20,
      })
      .select('id')
      .single();

    if (lErr || !listing) {
      results.push(`ERROR inserting "${l.title}": ${lErr?.message}`);
      continue;
    }

    // Insert images
    const imageRows = l.images.map((url, i) => ({
      listing_id: listing.id,
      url,
      position: i,
      is_primary: i === 0,
    }));
    await adminClient.from('listing_images').insert(imageRows);
    results.push(`Inserted: "${l.title}"`);
  }

  return NextResponse.json({ ok: true, results });
}
