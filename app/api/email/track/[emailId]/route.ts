import { NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

// Transparent 1x1 pixel GIF
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(
  request: Request,
  { params }: { params: { emailId: string } }
) {
  const { emailId } = params

  try {
    // Track email open
    emailService.trackEmailOpen(emailId)

    // Return tracking pixel
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error tracking email open:', error)
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store'
      }
    })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { emailId: string } }
) {
  const { emailId } = params

  try {
    const { url } = await request.json()
    
    // Track link click
    emailService.trackLinkClick(emailId, url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking link click:', error)
    return NextResponse.json(
      { error: 'Failed to track link click' },
      { status: 500 }
    )
  }
} 