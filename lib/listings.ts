import { createClient } from '@/lib/supabase/client';

export interface ListingImage {
  id: string;
  url: string;
  position: number;
  is_primary: boolean;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  location: string;
  status: 'active' | 'sold' | 'reserved' | 'deleted';
  views: number;
  promoted: boolean;
  created_at: string;
  listing_images: ListingImage[];
  profiles?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    rating: number;
    review_count: number;
    location: string;
    verified: boolean;
  };
}

export interface ListingFilters {
  category?: string;
  condition?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
}

export async function getListings(
  filters: ListingFilters = {},
  limit = 40
): Promise<Listing[]> {
  const supabase = createClient();

  let query = supabase
    .from('listings')
    .select(`
      *,
      listing_images (id, url, position, is_primary),
      profiles!listings_seller_id_fkey (id, username, full_name, avatar_url, rating, review_count, location, verified)
    `)
    .eq('status', 'active')
    .order('promoted', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.condition) query = query.eq('condition', filters.condition);
  if (filters.location) query = query.eq('location', filters.location);
  if (filters.minPrice) query = query.gte('price', filters.minPrice);
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
  if (filters.query) {
    query = query.ilike('title', `%${filters.query}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[getListings] error:', error);
    return [];
  }
  return (data ?? []) as Listing[];
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = createClient();
  // Increment views (best-effort)
  try {
    await supabase.rpc('increment_views', { listing_id: id });
  } catch { /* ignore */ }

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_images (id, url, position, is_primary),
      profiles!listings_seller_id_fkey (id, username, full_name, avatar_url, rating, review_count, location, verified, bio, created_at)
    `)
    .eq('id', id)
    .neq('status', 'deleted')
    .maybeSingle();

  if (error) {
    console.error('[getListingById] error:', error);
    return null;
  }
  return data as Listing | null;
}

export async function getListingsByUser(
  userId: string,
  status?: 'active' | 'sold'
): Promise<Listing[]> {
  const supabase = createClient();

  let query = supabase
    .from('listings')
    .select(`
      *,
      listing_images (id, url, position, is_primary)
    `)
    .eq('seller_id', userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as Listing[];
}

export async function createListing(
  listing: Omit<Listing, 'id' | 'created_at' | 'listing_images' | 'profiles'>,
  imageFiles: File[]
): Promise<{ id: string }> {
  const supabase = createClient();

  const { data: listingData, error: listingError } = await supabase
    .from('listings')
    .insert({
      seller_id: listing.seller_id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      condition: listing.condition,
      location: listing.location,
      status: listing.status ?? 'active',
      promoted: listing.promoted ?? false,
      views: 0,
    })
    .select('id')
    .single();

  if (listingError || !listingData) throw new Error(listingError?.message ?? 'Failed to create listing');

  // Upload images and insert records
  if (imageFiles.length > 0) {
    const uploadedUrls: string[] = [];
    for (const file of imageFiles) {
      const url = await uploadListingImage(file, listing.seller_id, listingData.id);
      if (url) uploadedUrls.push(url);
    }
    if (uploadedUrls.length > 0) {
      await supabase.from('listing_images').insert(
        uploadedUrls.map((url, i) => ({
          listing_id: listingData.id,
          url,
          position: i,
          is_primary: i === 0,
        }))
      );
    }
  }

  return { id: listingData.id };
}

export function getPrimaryImage(listing: Listing): string {
  const primary = listing.listing_images?.find((img) => img.is_primary);
  if (primary) return primary.url;
  if (listing.listing_images?.length > 0) {
    const sorted = [...listing.listing_images].sort((a, b) => a.position - b.position);
    return sorted[0].url;
  }
  return '/placeholder-image.png';
}

export function getImages(listing: Listing): string[] {
  if (!listing.listing_images?.length) return ['/placeholder-image.png'];
  return [...listing.listing_images]
    .sort((a, b) => a.position - b.position)
    .map((img) => img.url);
}

export async function uploadListingImage(
  file: File,
  userId: string,
  listingId?: string
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const path = `${userId}/${listingId ?? 'temp'}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('listing-images')
    .upload(path, file, { upsert: false });

  if (error) return null;

  const { data } = supabase.storage
    .from('listing-images')
    .getPublicUrl(path);

  return data.publicUrl;
}
