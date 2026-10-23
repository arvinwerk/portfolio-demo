import type { Banner as BannerModel } from "@/lib/types";

export function Banner({ banner }: { banner: BannerModel }) {
  return (
    <section className="banner" aria-label={banner.title}>
      <img className="banner__bg" src={banner.bgImage.src} alt="" />
      <div className="banner__shade" />
      <div className="banner__content">
        <h2>{banner.title}</h2>
        <div className="devices">
          <div className="laptop">
            <div className="laptop__screen">
              <img src={banner.laptopImage.src} alt={`Laptopweergave van ${banner.title}`} />
            </div>
            <div className="laptop__base" aria-hidden="true" />
          </div>
          <div className="phone" aria-hidden="false">
            <img src={banner.mobileImage.src} alt={`Telefoonweergave van ${banner.title}`} />
          </div>
        </div>
      </div>
    </section>
  );
}
