"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { twMerge } from "tailwind-merge";
import { type MyImageProps } from "@/types/index";
import noimage from "@/assets/image/noimage.png";

export function MyImage({
  src,
  alt,
  className,
  errorClassName,
  width,
  height,
}: MyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | StaticImageData>(src);
  const [cn, setCn] = useState(className);

  const handleImageError = () => {
    setImageSrc(noimage);
    setCn((cn) => twMerge(cn, errorClassName));
  };

  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={cn}
      width={width}
      height={height}
      onError={handleImageError}
    />
  );
}
