import type { Banner as BannerModel } from "@/lib/types";

export function Banner({ banner }: { banner: BannerModel }) {
  return (
    <section
      className="device-stage"
      style={{ backgroundImage: `url(${banner.bgImage.src})` }}
      aria-label={banner.title}
    >
      <h2 className="px-4 pt-12 text-center font-display text-3xl font-semibold text-white md:pt-24 md:text-5xl">
        {banner.title}
      </h2>
      <div className="device-laptop">
        <div className="device-laptop__screen">
          <img src={banner.laptopImage.src} alt={`Laptopweergave van ${banner.title}`} />
        </div>
        <div className="device-laptop__bottom" aria-hidden="true">
          <div className="device-laptop__under" />
        </div>
        <div className="device-laptop__shadow" aria-hidden="true" />
      </div>
      <div className="device-phone">
        <img src={banner.mobileImage.src} alt={`Telefoonweergave van ${banner.title}`} />
      </div>
    </section>
  );
}
