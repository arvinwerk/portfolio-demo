import type { Banner as BannerModel } from "../domain/model";

export function Banner({ banner }: { banner: BannerModel }) {
  return (
    <section
      className="device-stage"
      style={{ backgroundImage: `url(${banner.bgImage.src})` }}
      aria-label={banner.title}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-black/45" aria-hidden="true" />
      <h2 className="relative z-10 px-4 pt-20 text-center font-display text-3xl font-semibold tracking-tight text-white md:pt-24 md:text-5xl">
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
