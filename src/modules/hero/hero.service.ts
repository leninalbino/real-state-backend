import prisma from '../../utils/prisma';

export const getHeroSlides = async () => {
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: 'asc' } });
  return slides.map((slide) => ({
    id: slide.id,
    titulo: slide.title,
    img: slide.image,
    isLocal: slide.isLocal,
  }));
};
