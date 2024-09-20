import Image from "next/image";
import React from "react";

export const CustomCard = ({
  imagePath,
  children,
}: {
  imagePath: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full w-full bg-card-background/95 shadow-xl p-4 rounded-lg flex justify-center items-center">
      <div className="relative flex-1 flex justify-center items-center">
        <Image
          src={imagePath}
          alt="image"
          width={300}
          height={400}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover rounded-xl opacity-45 blur-md"
        />
        <Image
          src={imagePath}
          alt="image"
          width={200}
          height={270}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover rounded-lg"
        />
      </div>
      <div className="h-full w-[0.2px] m-6 rounded-full bg-card-foreground/50" />
      <div className="h-full flex-1 flex flex-col justify-start items-start gap-4 p-4">
        {children}
      </div>
    </div>
  );
};
