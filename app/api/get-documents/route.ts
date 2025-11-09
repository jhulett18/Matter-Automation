import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const documentsPath = path.join(
      process.cwd(),
      'scripts',
      'navigation',
      'getCustomDocuments',
      'custom_documents.json'
    );

    // Check if custom_documents.json exists
    if (!fs.existsSync(documentsPath)) {
      return NextResponse.json({
        needsExtraction: true,
        message: 'Custom documents data not found. Documents will be extracted automatically when you run "Testing Document Upload".'
      });
    }

    // Read and parse the documents data
    const documentsData = JSON.parse(fs.readFileSync(documentsPath, 'utf-8'));

    return NextResponse.json({
      needsExtraction: false,
      documents: documentsData.form_names || [],
      totalCount: documentsData.total_count || 0,
      extractedAt: documentsData.extracted_at,
      sourceUrl: documentsData.source_url
    });

  } catch (error) {
    console.error('Error reading custom documents data:', error);
    return NextResponse.json(
      { error: 'Failed to load custom documents data' },
      { status: 500 }
    );
  }
}
