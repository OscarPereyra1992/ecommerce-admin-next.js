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
      include: {
        images: true,
        category: true,
      },
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
    if (!description) {
      return new NextResponse("Error, la descripción es requerida", {
        status: 400,
      });
    }
    if (!images || !images.length) {
      return new NextResponse("Error, Las imágenes son requeridas", {
        status: 400,
      });
    }
    if (!price) {
      return new NextResponse("Error, El precio es requerido", { status: 400 });
    }
    if (!categoryId) {
      return new NextResponse("Error, La categoría es requerida", {
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

    // Obtén las imágenes existentes del producto que se está actualizando
    const existingProduct = await prismaDb.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: true,
      },
    });

    if (!existingProduct) {
      return new NextResponse("Producto no encontrado", { status: 404 });
    }

    const existingImages = existingProduct.images;

    // En la solicitud PATCH, asegúrate de enviar una lista de imágenes actualizada
    const updatedImages = images || [];

    // Elimina las imágenes que ya no se necesitan
    const imagesToDelete = existingImages.filter(
      (existingImage) =>
        !updatedImages.some(
          (updatedImage: { url: string }) =>
            updatedImage.url === existingImage.url
        )
    );

    // Actualiza el producto con los datos proporcionados (excepto las imágenes)
    const updatedProduct = await prismaDb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        price,
        categoryId,
        description,
        isFeatured,
        isArchived,
      },
    });

    // Elimina las imágenes que ya no se necesitan
    if (imagesToDelete.length > 0) {
      await prismaDb.image.deleteMany({
        where: {
          id: {
            in: imagesToDelete.map((image) => image.id),
          },
        },
      });
    }

    // Agrega las nuevas imágenes
    if (updatedImages.length > 0) {
      await prismaDb.image.createMany({
        data: updatedImages.map((image: { url: string }) => ({
          url: image.url,
          productId: params.productId,
        })),
      });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Error desconocido", { status: 500 });
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
    return new NextResponse("Error desconocido", { status: 500 });
  }
}
