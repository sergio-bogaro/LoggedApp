import { t } from "i18next"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MediaTypeEnum } from "@/utils/mediaText"

interface TrackMediaDialogProps {
  title: string;
  mediaType: MediaTypeEnum;
  image: string;
  alternateImages?: string[];
}

export function TrackMediaDialog({ mediaType, image, title, alternateImages }: TrackMediaDialogProps) {
  const form = useForm();
  const { control } = form;

  const [selectedImage, setSelectedImage] = useState(image);
  
  return(
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          Track
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[1000px]">
        <DialogHeader>
          <DialogTitle>{t(`Track data ${mediaType}`)} </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row w-full">
          <div className="w-full lg:w-1/3 flex flex-col gap-2 items-center text-center">
            <img src={selectedImage} alt={image} className="rounded" />
            <h3 className="text-wrap">
              {title}
            </h3>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  {t("Change Image")}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[1000px] max-h-10/12 overflow-auto ">

                <DialogHeader>
                  <DialogTitle> {t("Change Image")} </DialogTitle>
                  <DialogDescription>This will appear only in your library</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {alternateImages?.map((imgUrl, index) => (
                    <DialogClose key={index} asChild>
                      <img 
                        src={imgUrl} 
                        alt={imgUrl}    
                        onClick={() => setSelectedImage(imgUrl)}
                        className="rounded hover:scale-105 transition-transform cursor-pointer" 
                      />
                    </DialogClose>
                  ))}
                </div>

              </DialogContent>

            </Dialog>
          </div>

        

      
          <Form {...form}>
            <form className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full lg:w-2/3">
              <Input 
                label="Viewed On"
                name="viewedOn"
                control={control}
                type="date"
              />

              <Input 
                label="Viewed On"
                name="viewedOn"
                control={control}
                type="date"
              />

            </form>
          </Form>

        </div>
        
        
      </DialogContent>
    </Dialog>
  )
}