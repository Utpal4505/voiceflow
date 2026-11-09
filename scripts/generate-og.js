const { ImageResponse } = require('../apps/web/node_modules/next/og');
const fs = require('fs');
const path = require('path');

async function generate() {
  const fontData = fs.readFileSync('C:\\Windows\\Fonts\\segoeui.ttf');

  const element = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#141414',
        padding: '60px 80px',
        color: '#ffffff',
        fontFamily: 'Segoe UI',
      },
      children: [
        // Top Header
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            },
            children: [
              // Logo
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '14px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          backgroundColor: '#FF5722',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                width: '18px',
                                height: '18px',
                                borderRadius: '9999px',
                                backgroundColor: '#ffffff',
                              },
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '28px',
                          fontWeight: 800,
                          letterSpacing: '-0.5px',
                          color: '#ffffff',
                        },
                        children: 'VoiceFlow',
                      },
                    },
                  ],
                },
              },
              // Windows Badge
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#cbd5e1',
                  },
                  children: [
                    {
                      type: 'svg',
                      props: {
                        width: '16',
                        height: '16',
                        viewBox: '0 0 256 256',
                        children: [
                          {
                            type: 'path',
                            props: {
                              fill: '#0078d4',
                              d: 'M0 0h121.329v121.329H0zm134.671 0H256v121.329H134.671zM0 134.671h121.329V256H0zm134.671 0H256V256H134.671z',
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'span',
                      props: { children: 'Windows 11 & 10 Native' },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Center: Headline + Subtitle + HUD Mockup
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '18px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '64px',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    letterSpacing: '-2px',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  },
                  children: [
                    { type: 'span', props: { children: 'Stop typing.' } },
                    {
                      type: 'span',
                      props: {
                        style: { color: '#FF5722' },
                        children: 'Start speaking.',
                      },
                    },
                  ],
                },
              },
              {
                type: 'p',
                props: {
                  style: {
                    fontSize: '20px',
                    color: '#94a3b8',
                    maxWidth: '820px',
                    lineHeight: 1.4,
                    margin: 0,
                  },
                  children:
                    '100% Offline AI Voice Typing for Windows. Powered by local OpenAI Whisper with zero cloud egress.',
                },
              },
              // Floating HUD Mockup
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginTop: '8px',
                    padding: '14px 28px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(28, 28, 30, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '12px',
                          height: '12px',
                          borderRadius: '9999px',
                          backgroundColor: '#FF5722',
                        },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#f1f5f9',
                        },
                        children: 'Ctrl + Space',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { color: '#64748b' },
                        children: '|',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '15px',
                          color: '#e2e8f0',
                        },
                        children: '"Schedule the architectural review for Thursday at 10 AM."',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Bottom Features
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '32px',
              fontSize: '14px',
              color: '#94a3b8',
              fontWeight: 500,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '8px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '8px',
                          height: '8px',
                          borderRadius: '9999px',
                          backgroundColor: '#10b981',
                        },
                      },
                    },
                    { type: 'span', props: { children: 'Zero Cloud Telemetry' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '8px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '8px',
                          height: '8px',
                          borderRadius: '9999px',
                          backgroundColor: '#10b981',
                        },
                      },
                    },
                    { type: 'span', props: { children: 'Local AVX2 Vector Acceleration' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '8px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '8px',
                          height: '8px',
                          borderRadius: '9999px',
                          backgroundColor: '#10b981',
                        },
                      },
                    },
                    { type: 'span', props: { children: '~25 MB Single Binary' } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };

  const res = new ImageResponse(element, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Segoe UI',
        data: fontData,
        style: 'normal',
        weight: 400,
      },
    ],
  });

  const buffer = Buffer.from(await res.arrayBuffer());
  const outputPath = path.resolve(__dirname, '../apps/web/public/og-image.png');
  fs.writeFileSync(outputPath, buffer);
  console.log('SUCCESS: Saved og-image.png, size:', buffer.length, 'bytes');
}

generate().catch(console.error);
