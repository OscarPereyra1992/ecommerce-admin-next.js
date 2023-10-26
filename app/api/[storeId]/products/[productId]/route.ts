import prismaDb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("product id es requerido", { status: 400 });
    }

    const product = await prismaDb.product.findUnique({
      where: {
        id: params.productId,
      },
      include:{
        images: true,
        category: true,
       
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

//UPDATE METHOD

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      price,
      categoryId,
      description,
      images,
      isFeatured,
      isArchived,
    } = body;

    if (!userId) {
      return new NextResponse("Error, unauthorized", { status: 401 });
    }
    if (!name) {
      return new NextResponse("Error, El nombre es requerido", { status: 400 });
    }
    if(!description){
      return new NextResponse("Error, la descripción es requerida", {status:400});
    }
    if (!images || !images.length) {
      return new NextResponse("Error, Las imagenes son requeridas", {
        status: 400,
      });
    }
    if (!price) {
      return new NextResponse("Error, El precio es requerido", { status: 400 });
    }
    if (!categoryId) {
      return new NextResponse("Error, La categoria es requerida", {
        status: 400,
      });
    }
   
   

    if (!params.storeId) {
      return new NextResponse("Error, Store ID is required", { status: 400 });
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

    await prismaDb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        price,
        categoryId,
        description,
        
        images:{
          deleteMany: {}
        },
        isFeatured,
        isArchived
      },
    });

    const product = await prisma?.product.update({
      where:{
        id: params.productId
      },
      data: {
        images:{
          createMany:{
            data: [
              ...images.map((image: {url: string})=>image)
            ]
          }
        }
      }
    })

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

//DELETE METHOD

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Error de autentificación", { status: 401 });
    }

    if (!params.productId) {
      return new NextResponse("product id es requerido", { status: 400 });
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

    const product = await prismaDb.product.deleteMany({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
