import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const t = searchParams.get("t") || "";

  // Truncate for display
  const inputText = q.slice(0, 120) + (q.length > 120 ? "..." : "");
  const outputText = t.slice(0, 200) + (t.length > 200 ? "..." : "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a0b 0%, #141416 100%)",
          padding: "60px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            Li
          </div>
          <span
            style={{
              fontSize: "36px",
              color: "#f0f0f2",
              fontWeight: 400,
              fontStyle: "italic",
            }}
          >
            LinkedIn Translate
          </span>
        </div>

        {inputText ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              width: "100%",
              maxWidth: "900px",
            }}
          >
            {/* Input */}
            <div
              style={{
                background: "#1a1a1f",
                borderRadius: "16px",
                padding: "24px 32px",
                border: "1px solid #2a2a30",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "#55555f",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  marginBottom: "8px",
                }}
              >
                English
              </span>
              <span style={{ fontSize: "22px", color: "#8a8a96" }}>
                {inputText}
              </span>
            </div>

            {/* Output */}
            {outputText && (
              <div
                style={{
                  background: "#1a1a1f",
                  borderRadius: "16px",
                  padding: "24px 32px",
                  border: "1px solid #2a2a30",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "#3b82f6",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: "8px",
                  }}
                >
                  LinkedIn
                </span>
                <span style={{ fontSize: "20px", color: "#f0f0f2" }}>
                  {outputText}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span
              style={{
                fontSize: "28px",
                color: "#8a8a96",
                textAlign: "center",
              }}
            >
              Turn your honest truths into LinkedIn gold
            </span>
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
