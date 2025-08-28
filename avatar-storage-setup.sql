-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Create policies for the avatars bucket
-- Allow users to view their own avatar
CREATE POLICY "Users can view their own avatars"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' AND 
  (auth.uid() = owner OR POSITION(auth.uid()::text in name) > 0)
);

-- Allow authenticated users to upload avatars named with their user ID
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'avatars' AND 
  POSITION(auth.uid()::text in name) > 0
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  (auth.uid() = owner OR POSITION(auth.uid()::text in name) > 0)
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatars" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  (auth.uid() = owner OR POSITION(auth.uid()::text in name) > 0)
);

-- Allow anyone to download avatars (they're public but controlled by above policies)
CREATE POLICY "Anyone can download avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
