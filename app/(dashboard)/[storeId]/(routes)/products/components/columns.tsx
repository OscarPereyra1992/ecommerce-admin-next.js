"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"


export type ProductColumn = {
  id: string;
  name: string;
  price: number;
  description: string;	
  category: String;
  isFeatured: boolean;
  isArchived: boolean;
  createdAt: string;
  
}

export const columns: ColumnDef<ProductColumn>[] = [
 
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  
  {
    accessorKey: "isFeatured",
    header: "En menú",
  },
  {
    accessorKey: "price",
    header: "Precio",
  },
  {
    accessorKey: "category",
    header: "Categoría",
  }, 
  {
    accessorKey: "isArchived",
    header: "Sin Stock",
  },
  
  {
    id: "actions",
    cell: ({row}) => <CellAction data={row.original}/>
  }
]
