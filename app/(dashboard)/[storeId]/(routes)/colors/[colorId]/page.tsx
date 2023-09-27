import prismaDb from "@/lib/prismadb";
import { ColorForm } from "./components/color-form";

const ColorsPage = async ({
  params
}: {
  params: { colorId: string }
}) => {
  const color = await prismaDb.color.findUnique({
    where: {
      id: params.colorId
    }
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorForm initalData={color} />
      </div>
    </div>
  );
};

export default ColorsPage;
