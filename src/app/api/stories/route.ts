import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjusted path
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const stories = await prisma.interviewStory.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc', // Optional: order stories by creation date, newest first
      },
    });
    return NextResponse.json(stories);
  } catch (error) {
    console.error('[STORIES_GET] Error fetching stories:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, shortDescription, content } = body;

    if (!title || !shortDescription || !content) {
      return new NextResponse('Missing required fields (title, shortDescription, content)', { status: 400 });
    }

    const newStory = await prisma.interviewStory.create({
      data: {
        title,
        shortDescription,
        content,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newStory, { status: 201 }); // 201 Created status
  } catch (error) {
    console.error('[STORIES_POST] Error creating story:', error);
    if (error instanceof SyntaxError) { // Handle cases where req.json() fails
        return new NextResponse('Invalid JSON in request body', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 