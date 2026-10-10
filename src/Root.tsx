import "./index.css";
import { Composition, Folder, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import {
  calculateSlideShowMetadata,
  SlideShow,
  slideShowSchema,
} from "./SlideShow/SlideShow";
import { BarChartSlide, type BarChartSlideProps } from "./SlideShow/slides/BarChartSlide";
import { ComparisonSlide, type ComparisonSlideProps } from "./SlideShow/slides/ComparisonSlide";
import { ImageSlide, type ImageSlideProps } from "./SlideShow/slides/ImageSlide";
import { ListSlide, type ListSlideProps } from "./SlideShow/slides/ListSlide";
import { OutroSlide, type OutroSlideProps } from "./SlideShow/slides/OutroSlide";
import { QuoteSlide, type QuoteSlideProps } from "./SlideShow/slides/QuoteSlide";
import { StatSlide, type StatSlideProps } from "./SlideShow/slides/StatSlide";
import { TitleSlide, type TitleSlideProps } from "./SlideShow/slides/TitleSlide";
import { SlideChrome } from "./SlideShow/SlideChrome";

const SERIES_LABEL = "MẸO SỐNG, GIẢI THÍCH";
const FOOTNOTE = "QUẢN LÝ THỜI GIAN / VÍ DỤ MINH HOẠ";
const PREVIEW_TOTAL = 8;

// The "Slides" folder registers each template on its own so it can be
// previewed and tweaked in isolation. They only ever render inside
// <SlideChrome> as part of <SlideShow>, so these preview-only wrappers add
// that same chrome (cream background, header, footer) around the bare
// template - otherwise the standalone preview would show on a blank canvas.
const withPreviewChrome = <Props extends object>(
  Component: React.FC<Props>,
  index: number,
): React.FC<Props> => {
  const Preview: React.FC<Props> = (props) => (
    <SlideChrome
      seriesLabel={SERIES_LABEL}
      index={index}
      total={PREVIEW_TOTAL}
      footnote={FOOTNOTE}
    >
      <Component {...props} />
    </SlideChrome>
  );
  return Preview;
};

const PreviewTitleSlide = withPreviewChrome<TitleSlideProps>(TitleSlide, 1);
const PreviewStatSlide = withPreviewChrome<StatSlideProps>(StatSlide, 2);
const PreviewListSlide = withPreviewChrome<ListSlideProps>(ListSlide, 3);
const PreviewBarChartSlide = withPreviewChrome<BarChartSlideProps>(BarChartSlide, 4);
const PreviewQuoteSlide = withPreviewChrome<QuoteSlideProps>(QuoteSlide, 5);
const PreviewComparisonSlide = withPreviewChrome<ComparisonSlideProps>(ComparisonSlide, 6);
const PreviewImageSlide = withPreviewChrome<ImageSlideProps>(ImageSlide, 7);
const PreviewOutroSlide = withPreviewChrome<OutroSlideProps>(OutroSlide, 8);

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("sample-video.mp4"),
        }}
      />
      <Folder name="Slides">
        <Composition
          id="TitleSlide"
          component={PreviewTitleSlide}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={90}
          defaultProps={{
            heading: "Quản Lý Thời Gian Hiệu Quả",
            subheading: "Bí quyết giúp sinh viên học tập năng suất hơn.",
          }}
        />
        <Composition
          id="StatSlide"
          component={PreviewStatSlide}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={90}
          defaultProps={{
            heading: "Trì hoãn là kẻ thù số một",
            subheading: "Thói quen phổ biến nhất ở sinh viên.",
            label: "KHẢO SÁT / SINH VIÊN ĐẠI HỌC",
            previousLabel: "Trung bình",
            previousValue: "50%",
            value: "70%",
            delta: "+20 điểm %",
            accent: "orange" as const,
          }}
        />
        <Composition
          id="QuoteSlide"
          component={PreviewQuoteSlide}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={90}
          defaultProps={{
            quote:
              "Thời gian là tài sản duy nhất mà khi mất đi, không gì có thể mua lại được.",
            author: "Khuyết danh",
            accent: "teal" as const,
          }}
        />
        <Composition
          id="ListSlide"
          component={PreviewListSlide}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={90}
          defaultProps={{
            heading: "Ba Nguyên Tắc Cốt Lõi",
            subheading: "Áp dụng ngay từ hôm nay.",
            bullets: [
              "Lập danh sách công việc theo thứ tự ưu tiên mỗi sáng.",
              "Chia nhỏ mục tiêu lớn thành từng bước cụ thể.",
              "Dành thời gian nghỉ ngơi để tái tạo năng lượng.",
            ],
            accent: "teal" as const,
          }}
        />
        <Composition
          id="ComparisonSlide"
          component={PreviewComparisonSlide}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={120}
          defaultProps={{
            heading: "Nên Và Không Nên",
            subheading: "Khác biệt nằm ở những thói quen nhỏ.",
            topLabel: "NÊN LÀM",
            topPoints: ["Dùng lịch để theo dõi deadline", "Tập trung một việc tại một thời điểm"],
            bottomLabel: "TRÁNH",
            bottomPoints: ["Vừa học vừa lướt điện thoại", "Ôm đồm quá nhiều việc cùng lúc"],
          }}
        />
        <Composition
          id="BarChartSlide"
          component={PreviewBarChartSlide}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={120}
          defaultProps={{
            heading: "Có Kế Hoạch Hay Không?",
            subheading: "Cùng một khối lượng công việc, 1 tuần.",
            leftLabel: "CÓ KẾ HOẠCH",
            leftValue: "92",
            leftPercent: "+92%",
            rightLabel: "KHÔNG KẾ HOẠCH",
            rightValue: "54",
            rightPercent: "+54%",
            note: "Tỷ lệ hoàn thành đúng hạn (thang điểm 100)",
          }}
        />
        <Composition
          id="ImageSlide"
          component={PreviewImageSlide}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={90}
          defaultProps={{
            heading: "Không Gian Học Tập Gọn Gàng",
            subheading: "Một thay đổi nhỏ, hiệu quả lớn.",
            caption:
              "Một góc học tập gọn gàng với lịch công việc và đồng hồ nhắc nhở thời gian.",
          }}
        />
        <Composition
          id="OutroSlide"
          component={PreviewOutroSlide}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={90}
          defaultProps={{
            heading: "Bắt Đầu Từ Hôm Nay",
            subheading: "Thử áp dụng một nguyên tắc nhỏ ngay bây giờ.",
          }}
        />
      </Folder>
      <Composition
        id="SlideShow"
        component={SlideShow}
        calculateMetadata={calculateSlideShowMetadata}
        schema={slideShowSchema}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={300}
        defaultProps={{
          topic: "Quản lý thời gian hiệu quả cho sinh viên",
          seriesLabel: SERIES_LABEL,
          footnote: FOOTNOTE,
          slides: [
            {
              type: "title",
              heading: "Quản Lý Thời Gian Hiệu Quả",
              subheading: "Bí quyết giúp sinh viên học tập năng suất hơn.",
              accent: "teal",
              icon: "clock",
              voiceover:
                "Bạn có bao giờ cảm thấy một ngày trôi qua quá nhanh mà bài tập vẫn còn chất đống?",
            },
            {
              type: "stat",
              heading: "Trì Hoãn Là Kẻ Thù Số Một",
              subheading: "Thói quen phổ biến nhất ở sinh viên.",
              label: "KHẢO SÁT / SINH VIÊN ĐẠI HỌC",
              previousLabel: "Trung bình",
              previousValue: "50%",
              value: "70%",
              delta: "+20 điểm %",
              accent: "orange",
              voiceover:
                "Có đến bảy mươi phần trăm sinh viên thường để công việc dồn đến sát deadline mới bắt đầu làm.",
            },
            {
              type: "list",
              heading: "Ba Nguyên Tắc Cốt Lõi",
              subheading: "Áp dụng ngay từ hôm nay.",
              bullets: [
                "Lập danh sách công việc theo thứ tự ưu tiên mỗi sáng.",
                "Chia nhỏ mục tiêu lớn thành từng bước cụ thể.",
                "Dành thời gian nghỉ ngơi để tái tạo năng lượng.",
              ],
              accent: "teal",
              icon: "check",
              voiceover:
                "Ba nguyên tắc đơn giản: lập danh sách ưu tiên, chia nhỏ mục tiêu, và đừng quên nghỉ ngơi.",
            },
            {
              type: "barChart",
              heading: "Có Kế Hoạch Hay Không?",
              subheading: "Cùng một khối lượng công việc, 1 tuần.",
              leftLabel: "CÓ KẾ HOẠCH",
              leftValue: "92",
              leftPercent: "+92%",
              rightLabel: "KHÔNG KẾ HOẠCH",
              rightValue: "54",
              rightPercent: "+54%",
              note: "Tỷ lệ hoàn thành đúng hạn (thang điểm 100)",
              footnote: "VÍ DỤ MINH HOẠ / KHÔNG PHẢI SỐ LIỆU THỰC TẾ",
              accent: "teal",
              icon: "chartUp",
              voiceover:
                "Sinh viên có kế hoạch rõ ràng hoàn thành đúng hạn gấp gần hai lần so với người không lên kế hoạch.",
            },
            {
              type: "quote",
              quote:
                "Thời gian là tài sản duy nhất mà khi mất đi, không gì có thể mua lại được.",
              author: "Khuyết danh",
              accent: "teal",
              voiceover:
                "Hãy nhớ, thời gian là tài sản duy nhất mà khi mất đi, không gì có thể mua lại được.",
            },
            {
              type: "outro",
              heading: "Bắt Đầu Từ Hôm Nay",
              subheading: "Thử áp dụng một nguyên tắc nhỏ ngay bây giờ.",
              accent: "orange",
              icon: "rocket",
              voiceover:
                "Hãy bắt đầu áp dụng ngay từ hôm nay, chỉ cần một thay đổi nhỏ mỗi ngày.",
            },
          ],
        }}
      />
    </>
  );
};
