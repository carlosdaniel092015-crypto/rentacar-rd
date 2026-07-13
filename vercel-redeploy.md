import Image from "next/image";

interface VehicleGalleryProps {
  nombre: string;
  imagenPrincipal: string | null;
  imagenesUrls: string[];
  id: string;
}

export function VehicleGallery({ nombre, imagenPrincipal, imagenesUrls, id }: VehicleGalleryProps) {
  const todas: string[] = [];
  if (imagenPrincipal) todas.push(imagenPrincipal);
  for (const u of imagenesUrls) {
    if (!todas.includes(u)) todas.push(u);
  }

  if (todas.length === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)]">
        Sin imagen
      </div>
    );
  }

  if (todas.length === 1) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-muted)]">
        <Image src={todas[0]} alt={nombre} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
      </div>
    );
  }

  const gid = `vg-${id.slice(0, 8)}`;

  // CSS-only gallery: radio inputs control which image is shown via :checked + sibling selectors
  // Structure: inputs → main-image-div → thumbnails-div  (all siblings inside wrapper)
  const css = `
    #${gid}-main img { opacity: 0; transition: opacity 0.3s; position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    ${todas.map((_, i) => `
      #${gid}-r${i}:checked ~ #${gid}-main label[for="${gid}-r${i}"] img { opacity: 1; z-index: 1; }
      #${gid}-r${i}:checked ~ #${gid}-thumbs label[for="${gid}-r${i}"] { border-color: #F97316 !important; opacity: 1 !important; }
    `).join("")}
  `;

  return (
    <div id={gid} className="space-y-3">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Radio inputs — ocultos, preceden a los divs para que el selector ~ funcione */}
      {todas.map((_, i) => (
        <input
          key={i}
          type="radio"
          id={`${gid}-r${i}`}
          name={gid}
          defaultChecked={i === 0}
          className="sr-only"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
          aria-label={`${nombre} — foto ${i + 1}`}
        />
      ))}

      {/* Imagen principal: labels apilados, el CSS muestra el activo */}
      <div
        id={`${gid}-main`}
        className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-muted)]"
      >
        {todas.map((url, i) => (
          <label
            key={url}
            htmlFor={`${gid}-r${i}`}
            style={{ position: "absolute", inset: 0, display: "block", cursor: "default", zIndex: 0 }}
          >
            <Image
              src={url}
              alt={`${nombre} — foto ${i + 1}`}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </label>
        ))}
      </div>

      {/* Miniaturas: labels que activan el radio correspondiente */}
      <div id={`${gid}-thumbs`} className="flex gap-2 overflow-x-auto pb-1">
        {todas.map((url, i) => (
          <label
            key={url}
            htmlFor={`${gid}-r${i}`}
            style={{
              flexShrink: 0,
              width: 80,
              height: 80,
              borderRadius: 8,
              overflow: "hidden",
              position: "relative",
              cursor: "pointer",
              display: "block",
              border: "3px solid transparent",
              opacity: i === 0 ? 1 : 0.6,
              transition: "border-color 0.2s, opacity 0.2s",
            }}
          >
            <Image
              src={url}
              alt={`${nombre} miniatura ${i + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
