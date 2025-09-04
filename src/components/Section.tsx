import React, { FC } from "react";
import { cn } from "@/lib/utils";
import {
  SectionDescriptionProps,
  SectionHeadingProps,
  SectionProps,
} from "@/types/section";

const SectionHeading: FC<SectionHeadingProps> = ({
  className,
  children,
  ...props
}) => (
  <h1 className={cn("text-2xl font-bold", className)} {...props}>
    {children}
  </h1>
);

const SectionDescription: FC<SectionDescriptionProps> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn("text-muted-foreground text-lg", className)} {...props}>
    {children}
  </p>
);

const Section: FC<SectionProps> = ({
  heading,
  description,
  classNames,
  className,
  children,
  ...props
}) => (
  <section
    className={cn(
      "@container/main flex flex-1 flex-col px-4 lg:px-6 gap-4 py-4 md:gap-6 md:py-6",
      classNames?.section,
      className
    )}
    {...props}
  >
    {heading && (
      <SectionHeading className={classNames?.heading}>{heading}</SectionHeading>
    )}

    {description && (
      <SectionDescription className={classNames?.description}>
        {description}
      </SectionDescription>
    )}

    {children}
  </section>
);

export default Section;
