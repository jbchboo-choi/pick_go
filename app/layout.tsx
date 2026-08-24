import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PickGo — 오늘의 나에게 맞는 단 하나의 길',
  description: '사용자의 컨디션에 맞춰 가장 확실한 이동 경로 하나를 제안하는 PickGo 포트폴리오 데모',
  openGraph: {
    title: 'PickGo — 오늘의 나에게 맞는 단 하나의 길',
    description: '컨디션을 반영해 단 하나의 확신 경로를 제안하는 이동 가이드',
    type: 'website',
    locale: 'ko_KR',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'PickGo 포트폴리오 데모' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PickGo — 오늘의 나에게 맞는 단 하나의 길',
    description: '컨디션을 반영해 단 하나의 확신 경로를 제안하는 이동 가이드',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
