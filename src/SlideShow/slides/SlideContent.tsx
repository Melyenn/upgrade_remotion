import type { z } from "zod";
import type { slideSchema } from "../schema.mjs";
import { BarChartSlide } from "./BarChartSlide";
import { ComparisonSlide } from "./ComparisonSlide";
import { ImageSlide } from "./ImageSlide";
import { ListSlide } from "./ListSlide";
import { OutroSlide } from "./OutroSlide";
import { QuoteSlide } from "./QuoteSlide";
import { StatSlide } from "./StatSlide";
import { TitleSlide } from "./TitleSlide";

export type SlideItem = z.infer<typeof slideSchema>;

export const SlideContent: React.FC<{ readonly slide: SlideItem }> = ({
  slide,
}) => {
  switch (slide.type) {
    case "title":
      return (
        <TitleSlide
          heading={slide.heading}
          subheading={slide.subheading}
          icon={slide.icon}
          accent={slide.accent}
        />
      );
    case "stat":
      return (
        <StatSlide
          heading={slide.heading}
          subheading={slide.subheading}
          value={slide.value}
          label={slide.label}
          previousValue={slide.previousValue}
          previousLabel={slide.previousLabel}
          delta={slide.delta}
          accent={slide.accent}
          icon={slide.icon}
          durationInFrames={slide.durationInFrames}
        />
      );
    case "quote":
      return (
        <QuoteSlide
          quote={slide.quote}
          author={slide.author}
          accent={slide.accent}
          icon={slide.icon}
        />
      );
    case "list":
      return (
        <ListSlide
          heading={slide.heading}
          subheading={slide.subheading}
          bullets={slide.bullets}
          accent={slide.accent}
          icon={slide.icon}
          durationInFrames={slide.durationInFrames}
        />
      );
    case "comparison":
      return (
        <ComparisonSlide
          heading={slide.heading}
          subheading={slide.subheading}
          topLabel={slide.topLabel}
          topPoints={slide.topPoints}
          bottomLabel={slide.bottomLabel}
          bottomPoints={slide.bottomPoints}
          accent={slide.accent}
          icon={slide.icon}
          durationInFrames={slide.durationInFrames}
        />
      );
    case "barChart":
      return (
        <BarChartSlide
          heading={slide.heading}
          subheading={slide.subheading}
          leftLabel={slide.leftLabel}
          leftValue={slide.leftValue}
          leftPercent={slide.leftPercent}
          rightLabel={slide.rightLabel}
          rightValue={slide.rightValue}
          rightPercent={slide.rightPercent}
          note={slide.note}
          accent={slide.accent}
          icon={slide.icon}
          durationInFrames={slide.durationInFrames}
        />
      );
    case "image":
      return (
        <ImageSlide
          heading={slide.heading}
          subheading={slide.subheading}
          imageSrc={slide.imageSrc}
          caption={slide.caption}
          accent={slide.accent}
          icon={slide.icon}
        />
      );
    case "outro":
      return (
        <OutroSlide
          heading={slide.heading}
          subheading={slide.subheading}
          accent={slide.accent}
          icon={slide.icon}
        />
      );
    default:
      return null;
  }
};
