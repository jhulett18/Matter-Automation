import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const base64Content = Buffer.from(buffer).toString('base64');

    // Determine media type
    const mediaType = file.type || 'application/pdf';

    // Initialize Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Send document to Claude for parsing
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Content,
              },
            },
            {
              type: 'text',
              text: `Please extract the following information from this document and return it as JSON:
              - client_name: The client's full name
              - email: The client's email address
              - state: The state (if mentioned)
              - form_url: The target form URL (if mentioned, otherwise use a placeholder)

              Return ONLY valid JSON, no other text. Use this format:
              {
                "client_name": "...",
                "email": "...",
                "state": "...",
                "form_url": "https://your-lawmatics-url.com/form"
              }`
            }
          ],
        },
      ],
    });

    // Extract the JSON response
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse the JSON response
    let parsedData;
    try {
      const jsonText = textContent.text.trim();
      // Remove markdown code blocks if present
      const cleanJson = jsonText.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse Claude response:', textContent.text);
      throw new Error('Failed to parse extracted data');
    }

    return NextResponse.json({
      success: true,
      parsedData,
      message: 'Document parsed successfully'
    });

  } catch (error) {
    console.error('Error in upload:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
