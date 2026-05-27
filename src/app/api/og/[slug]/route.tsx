import { ImageResponse } from 'next/og';

const SIZE = { width: 1200, height: 630 };

function getInitials(displayName: string): string {
  return (
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'K'
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const q = url.searchParams;

  const displayName = q.get('name') || slug;
  const headline = q.get('h') || `${displayName} on Karte`;
  const location = q.get('loc') || '';
  const isLive = q.get('live') === '1';
  const accent = `#${q.get('accent') || '67e8f9'}`;
  const initials = getInitials(displayName);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#0a0a0a',
          color: '#ededed',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <div
            style={{
              width: '104px',
              height: '104px',
              borderRadius: '28px',
              background: accent,
              color: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '44px',
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 500,
                color: accent,
                textTransform: 'uppercase',
              }}
            >
              karte.cc/{slug}
            </div>
            <div
              style={{
                fontSize: '56px',
                fontWeight: 700,
                marginTop: '8px',
              }}
            >
              {displayName}
              {location ? ` · ${location}` : ''}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: '24px',
            borderLeft: `4px solid ${accent}`,
            maxWidth: '980px',
          }}
        >
          {isLive ? (
            <div
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: accent,
                textTransform: 'uppercase',
                marginBottom: '18px',
              }}
            >
              · Today&apos;s headline · auto-written by AI
            </div>
          ) : null}
          <div
            style={{
              fontSize: isLive ? '52px' : '40px',
              fontWeight: 700,
              lineHeight: 1.15,
              color: '#ffffff',
              textTransform: isLive ? 'uppercase' : 'none',
            }}
          >
            {headline}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#a1a1aa',
            fontSize: '20px',
            textTransform: 'uppercase',
          }}
        >
          <div>Built on Karte · the profile that talks back</div>
          <div style={{ display: 'flex', alignItems: 'center', color: accent, fontWeight: 600 }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '999px',
                background: accent,
                marginRight: '10px',
              }}
            />
            Live
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        'cache-control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    },
  );
}
