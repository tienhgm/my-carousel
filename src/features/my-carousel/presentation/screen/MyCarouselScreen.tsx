import Carousel from "@/features/my-carousel/presentation/components/carousel/Carousel";
const slideData = [
  {
    id: 1,
    title: "Slide 1",
    image: "https://image/300x300",
    landing_page: "https://landingpage1",
  },
  {
    id: 2,
    title: "Slide 2",
    image: "https://picsum.photos/id/1016/600/300",
    landing_page: "https://landingpage2",
  },
  {
    id: 3,
    title: "Slide 3",
    image: "https://picsum.photos/id/1018/600/300",
    landing_page: "https://landingpage3",
  },
  {
    id: 4,
    title: "Slide 4",
    image: "https://picsum.photos/id/1018/600/300",
    landing_page: "https://landingpage4",
  },
  {
    id: 5,
    title: "Slide 5",
    image: "https://picsum.photos/id/1018/600/300",
    landing_page: "https://landingpage5",
  },
  {
    id: 6,
    title: "Slide 6",
    image: "https://picsum.photos/id/1018/600/300",
    landing_page: "https://landingpage6",
  },
];
export default function MyCarouselScreen() {
  return (
    <>
      <Carousel data={slideData} size={300} perView={3} />
    </>
  );
}
