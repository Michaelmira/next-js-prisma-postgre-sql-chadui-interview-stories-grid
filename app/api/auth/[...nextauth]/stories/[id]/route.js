// app/api/stories/[id]/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, content } = await request.json()
    const { id } = params

    const story = await prisma.interviewStory.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    const updatedStory = await prisma.interviewStory.update({
      where: { id: id },
      data: {
        title,
        description,
        content
      }
    })

    return NextResponse.json(updatedStory)
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const story = await prisma.interviewStory.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    await prisma.interviewStory.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Story deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}