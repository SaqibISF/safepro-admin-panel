import { HTMLAttributes } from "react";

declare type SectionHeadingProps = HTMLAttributes<HTMLHeadingElement>;

declare type SectionDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

declare type SectionProps = {
  heading?: ReactNode;
  description?: ReactNode;

  classNames?: {
    section?: string;
    heading?: string;
    description?: string;
  };
} & HTMLAttributes<HTMLElement>;
