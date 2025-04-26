import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  if (!address) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_ZERION_API_KEY;
  console.log('Debug - API Key Status:', {
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0
  });

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  try {
    console.log('Attempting Zerion API call for address:', address);
    
    const apiUrl = `https://api.zerion.io/v1/wallets/${address}/positions`;
    console.log('API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${apiKey}`
      }
    });

    console.log('Zerion API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zerion API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json({
        error: `API request failed: ${response.status} - ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Zerion API Success - Data Structure:', {
      hasData: !!data,
      dataKeys: Object.keys(data),
      itemCount: data.data?.length || 0
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Zerion API Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch data from Zerion API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 