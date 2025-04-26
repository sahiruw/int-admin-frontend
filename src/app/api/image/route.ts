import { getGoogleServices } from '@/utils/google/google';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pictureId = searchParams.get('picture_id');

  if (!pictureId) {
    return NextResponse.json({ error: 'Missing picture_id' }, { status: 400 });
  }

  

  try {
    const { drive } = await getGoogleServices();
    const masterFolderId = process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID;

  

    // Search for matching files in the master folder
    const { data } = await drive.files.list({
      q: `(name contains '${pictureId}')`,
      fields: 'files(id, name, webContentLink, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'allDrives'
    });

    console.log('Files found:', data.files);


    if (data.files && data.files.length > 0) {
      const fileId = data.files[0].id;
      const fileResponse = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      // return the raw data instead of a blob URL
    return NextResponse.json({
      buffer: Buffer.from(fileResponse.data).toString('base64'),
      mimeType: data.files[0].mimeType
    });

    }



    return NextResponse.json({ error: 'Image not found' }, { status: 404 });


  } catch (error) {
    console.error('Error accessing Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve image' },
      { status: 500 }
    );
  }
}