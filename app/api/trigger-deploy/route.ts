import { NextResponse } from 'next/server';

export async function GET() {
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

  if (!deployHookUrl) {
    console.error('VERCEL_DEPLOY_HOOK_URL is not set in environment variables.');
    return NextResponse.json(
      { success: false, message: 'Deploy hook URL not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(deployHookUrl, { method: 'POST', body: '{}' }); // Added empty body for some hooks that might require it

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error triggering Vercel deploy hook: ${response.status} ${errorText}`);
      return NextResponse.json(
        { success: false, message: 'Error triggering Vercel deploy hook.', error: errorText },
        { status: response.status }
      );
    }

    const responseData = await response.json(); // Assuming Vercel deploy hook API returns JSON
    console.log('Vercel deploy hook triggered successfully:', responseData);
    return NextResponse.json({ success: true, message: 'Vercel deploy hook triggered successfully.', data: responseData });

  } catch (error) {
    console.error('Failed to make request to Vercel deploy hook:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to make request to Vercel deploy hook.', error: (error instanceof Error) ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 