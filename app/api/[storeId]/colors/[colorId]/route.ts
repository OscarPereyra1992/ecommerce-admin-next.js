import prismaDb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { colorId: string } }
) {
  try {
    if (!params.colorId) {
      return new NextResponse("Colors id es requerido", { status: 400 });
    }

    const color = await prismaDb.color.findUnique({
      where: {
        id: params.colorId,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLORS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

//UPDATE METHOD

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Error de autentificación", { status: 401 });
    }

    if (!name) {
      return new NextResponse("name es requerido", { status: 400 });
    }
    if (!value) {
      return new NextResponse("value es requerido", { status: 400 });
    }

    if (!params.colorId) {
      return new NextResponse("Colors id es requerido", { status: 400 });
    }
    const storeByUserId = await prismaDb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Acceso no autorizado", { status: 403 });
    }

    const color = await prismaDb.color.updateMany({
      where: {
        id: params.colorId,
      },
      data: {
        name,
        value,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLORS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

//DELETE METHOD

export async function DELETE(
  req: Request,
  { params }: { params: { colorId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Error de autentificación", { status: 401 });
    }

    if (!params.colorId) {
      return new NextResponse("Colors id es requerido", { status: 400 });
    }
    const storeByUserId = await prismaDb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Acceso no autorizado", { status: 403 });
    }

    const color = await prismaDb.color.deleteMany({
      where: {
        id: params.colorId,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLORS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
