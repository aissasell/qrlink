import { redirect, notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://us-central1-qrlink-b845b.cloudfunctions.net";
    const response = await fetch(`${baseUrl}/redirect?id=${slug}`, {
      cache: 'no-store'
    });
    
    if (response.status === 404) {
      return notFound();
    }

    if (!response.ok) {
      throw new Error("Failed to fetch redirect URL");
    }

    const data = await response.json();
    if (data.url) {
      redirect(data.url);
    } else {
      return notFound();
    }
  } catch (error) {
    console.error("Redirect error:", error);
    return notFound();
  }
}
