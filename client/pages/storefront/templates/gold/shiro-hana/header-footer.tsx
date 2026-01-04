import { resolveResponsiveNumber, resolveResponsiveStyle, type Breakpoint } from './responsive';

export function Header({ node, onSelect, resolveAssetUrl, theme, responsive }: any) {
  const safeNode = node || {};
  const logo = safeNode.logo || null;
  const logoFit = logo?.fit === 'contain' ? 'contain' : 'cover';

  const sticky = safeNode?.sticky !== false;
  const isMd = !!responsive?.isMd;

  const bp = (responsive?.breakpoint || (isMd ? 'desktop' : (responsive?.isSm ? 'tablet' : 'mobile'))) as Breakpoint;
  const resolveNumber = (v: any): number | undefined => resolveResponsiveNumber(v, bp);

  const padY = resolveNumber(safeNode?.paddingY);
  const padX = resolveNumber(safeNode?.paddingX);

  const logoPosXRaw = resolveNumber(logo?.posX);
  const logoPosYRaw = resolveNumber(logo?.posY);
  const logoSize = resolveNumber(logo?.size);
  const logoScaleXRaw = resolveNumber(logo?.scaleX);
  const logoScaleYRaw = resolveNumber(logo?.scaleY);

  const logoPosX = typeof logoPosXRaw === 'number' ? Math.max(0, Math.min(1, logoPosXRaw)) : 0.5;
  const logoPosY = typeof logoPosYRaw === 'number' ? Math.max(0, Math.min(1, logoPosYRaw)) : 0.5;
  const logoScaleX = typeof logoScaleXRaw === 'number' ? logoScaleXRaw : (typeof logoSize === 'number' ? logoSize : 1);
  const logoScaleY = typeof logoScaleYRaw === 'number' ? logoScaleYRaw : (typeof logoSize === 'number' ? logoSize : 1);

  const logoAssetKey = typeof (logo as any)?.assetKey === 'string' ? (logo as any).assetKey : '';
  const logoAlt = typeof (logo as any)?.alt === 'string' ? (logo as any).alt : '';

  const navLinks = Array.isArray(theme?.navLinks) && theme.navLinks.length
    ? theme.navLinks
    : (Array.isArray(safeNode.nav) ? safeNode.nav : []);

  return (
    <header
      className={`shadow-sm top-0 z-40 ${sticky ? 'sticky' : ''}`}
      style={{
        backgroundColor: theme?.headerBg || theme?.colors?.background || undefined,
        color: theme?.headerText || theme?.colors?.text || undefined,
        paddingTop: padY,
        paddingBottom: padY,
      }}
      data-edit-path="layout.header"
      onClick={(e) => {
        if (theme?.canManage === false) return;
        e.preventDefault();
        e.stopPropagation();
        onSelect('layout.header');
      }}
    >
      <div
        className="container mx-auto flex items-center justify-between"
        style={{
          paddingLeft: padX,
          paddingRight: padX,
        }}
      >
        <div className="flex items-center gap-4">
          {logoAssetKey ? (
            <img
              src={resolveAssetUrl ? resolveAssetUrl(logoAssetKey) : `/assets/${logoAssetKey}`}
              alt={logoAlt}
              className="h-10"
              style={{
                objectFit: logoFit,
                objectPosition: `${Math.round(logoPosX * 100)}% ${Math.round(logoPosY * 100)}%`,
                transform: `scaleX(${logoScaleX}) scaleY(${logoScaleY})`,
              }}
              data-edit-path="layout.header.logo"
              onClick={(e) => {
                if (theme?.canManage === false) return;
                e.preventDefault();
                e.stopPropagation();
                onSelect('layout.header.logo');
              }}
            />
          ) : null}
          {isMd ? (
            <nav
              className="flex gap-4"
              data-edit-path="layout.header.nav"
              onClick={(e) => {
                if (theme?.canManage === false) return;
                e.preventDefault();
                e.stopPropagation();
                onSelect('layout.header.nav');
              }}
            >
              {navLinks.map((n: any, i: number) => {
                const label = n?.label && typeof n.label === 'object' ? n.label : n;
                const labelValue = typeof label?.value === 'string' ? label.value : (typeof n?.label === 'string' ? n.label : String(label || ''));
                const href = typeof n?.url === 'string' ? n.url : (typeof n?.action === 'string' ? n.action : '#');
                return (
                  <a
                    key={i}
                    href={href || '#'}
                    data-edit-path={n?.label ? `layout.header.nav.${i}.label` : `layout.header.nav.${i}`}
                    onClick={(e) => {
                      if (theme?.canManage === false) return;
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect('layout.header.nav');
                    }}
                    style={{
                      color: theme?.headerText || theme?.colors?.text || undefined,
                      ...(resolveResponsiveStyle(label?.style, bp) || {}),
                    }}
                  >
                    {labelValue}
                  </a>
                );
              })}
            </nav>
          ) : null}
        </div>
        <div>
          {(safeNode.cta || []).map((c: any, i: number) => (
            <a
              key={i}
              href={c.action}
              className="px-3 py-1 border rounded"
              data-edit-path={`layout.header.cta.${i}.label`}
              onClick={(e) => {
                if (theme?.canManage === false) return;
                e.preventDefault();
                e.stopPropagation();
                onSelect(`layout.header.cta.${i}.label`);
              }}
              style={resolveResponsiveStyle(c?.label?.style, bp) || undefined}
            >
              {c?.label?.value}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

export function Footer({ node, onSelect, theme, responsive }: any) {
  const safeNode = node || {};
  const isMd = !!responsive?.isMd;
  const bp = (responsive?.breakpoint || (isMd ? 'desktop' : (responsive?.isSm ? 'tablet' : 'mobile'))) as Breakpoint;
  const resolveNumber = (v: any): number | undefined => resolveResponsiveNumber(v, bp);

  const padY = resolveNumber(safeNode?.paddingY);
  const padX = resolveNumber(safeNode?.paddingX);
  return (
    <footer
      className=""
      style={{
        backgroundColor: theme?.colors?.surface || undefined,
        color: theme?.footerText || theme?.colors?.muted || undefined,
        paddingTop: padY,
        paddingBottom: padY,
      }}
      data-edit-path="layout.footer"
      onClick={(e) => {
        if (theme?.canManage === false) return;
        e.preventDefault();
        e.stopPropagation();
        onSelect('layout.footer');
      }}
    >
      <div
        className="container mx-auto text-sm"
        style={{
          paddingLeft: padX,
          paddingRight: padX,
        }}
      >
        <div className="flex justify-between">
          <div
            data-edit-path="layout.footer.links"
            onClick={(e) => {
              if (theme?.canManage === false) return;
              e.preventDefault();
              e.stopPropagation();
              onSelect('layout.footer.links');
            }}
          >
            {(safeNode.links || []).map((l: any, i: number) => {
              const label = l?.label && typeof l.label === 'object' ? l.label : l;
              const action = typeof l?.action === 'string' ? l.action : '#';
              return (
                <a
                  key={i}
                  href={action || '#'}
                  className="mr-4"
                  data-edit-path={l?.label ? `layout.footer.links.${i}.label` : `layout.footer.links.${i}`}
                  onClick={(e) => {
                    if (theme?.canManage === false) return;
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect('layout.footer.links');
                  }}
                  style={{
                    color: theme?.footerLinkColor || theme?.colors?.muted || undefined,
                    ...(resolveResponsiveStyle(label?.style, bp) || {}),
                  }}
                >
                  {label?.value}
                </a>
              );
            })}

            {Array.isArray(theme?.socialLinks) && theme.socialLinks.length ? (
              <div
                className="mt-3 flex flex-wrap gap-3"
                data-edit-path="layout.footer.social"
                onClick={(e) => {
                  if (theme?.canManage === false) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect('layout.footer.social');
                }}
              >
                {theme.socialLinks.map((s: any, idx: number) => (
                  <a
                    key={`${s.platform}-${idx}`}
                    href={s.url}
                    className="underline-offset-2 hover:underline"
                    style={{ color: theme?.footerLinkColor || theme?.colors?.muted || undefined }}
                    onClick={(e) => {
                      if (theme?.canManage === false) return;
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect('layout.footer.social');
                    }}
                  >
                    {String(s.platform)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <div
            data-edit-path="layout.footer.copyright"
            onClick={(e) => {
              if (theme?.canManage === false) return;
              e.preventDefault();
              e.stopPropagation();
              onSelect('layout.footer.copyright');
            }}
            style={resolveResponsiveStyle(node?.copyright?.style, bp) || undefined}
          >
            {node?.copyright?.value}
          </div>
        </div>
      </div>
    </footer>
  );
}
