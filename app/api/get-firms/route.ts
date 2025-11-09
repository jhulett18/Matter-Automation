import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const firmsCleanedPath = path.join(
      process.cwd(),
      'scripts',
      'navigation',
      'firm_selection_from_profile',
      'firms_cleaned.json'
    );

    // Check if firms_cleaned.json exists
    if (!fs.existsSync(firmsCleanedPath)) {
      return NextResponse.json({
        needsExtraction: true,
        message: 'Firms data not found. Please run "Open Lawmatics" first to extract firm data, then reload the application.'
      });
    }

    // Read and parse the firms data
    const firmsData = JSON.parse(fs.readFileSync(firmsCleanedPath, 'utf-8'));

    return NextResponse.json({
      needsExtraction: false,
      firms: firmsData.firms || [],
      totalFirms: firmsData.total_firms || 0,
      parsedAt: firmsData.parsed_at
    });

  } catch (error) {
    console.error('Error reading firms data:', error);
    return NextResponse.json(
      { error: 'Failed to load firms data' },
      { status: 500 }
    );
  }
}
