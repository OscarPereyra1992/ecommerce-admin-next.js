"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Color } from "@prisma/client";
import { Trash } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";




interface ColorFormProps {
  initalData: Color | null;
}

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(4).regex(/^#(?:[0-9a-fA-F]{3,4}){1,2}$/,{
    message: "El código HEX debe ser válido"
  })
});

type ColorFormValues = z.infer<typeof formSchema>;

export const ColorForm: React.FC<ColorFormProps> = ({ initalData }) => {
  const params = useParams();
  const router = useRouter();
  

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initalData ? "Edit Color" : "Create Color";
  const description = initalData ? "Edit a Color" : "Add new Color";
  const toastMessage = initalData ? "Color updated" : "Color created";
  const action = initalData ? "Save changes" : "Create";

  const onSubmit = async (data: ColorFormValues) => {
    try {
      setLoading(true);
      if (initalData) {
        await axios.patch(
          `/api/${params.storeId}/colors/${params.colorId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/colors`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Algo ha fallado");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/colors/${params.colorId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast.success("colors deleted");
    } catch (error) {
      toast.error(
        "Por favor elimine todas los elementos"
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initalData || {
      name: "",
      value: "",
    },
  });

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initalData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="colors name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <div className="flex iems-center gap-x-4">
                    <Input
                      disabled={loading}
                      placeholder="colors value"
                      {...field}
                    />
                    <div 
                    className="border p-4 rounded-full"
                    style={{backgroundColor: field.value}}
                    />

                    
                    </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
      
    </>
  );
};
