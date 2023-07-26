
export const popup = async ({ el }: { el: HTMLElement }) => {
  if (!('documentPictureInPicture' in window)) {
    alert('Your browser does not currently support documentPictureInPicture. You can go to chrome://flags/#document-picture-in-picture-api to enable it.');
    return;
  }

  const popupContent = el;
  const pipWindow = await documentPictureInPicture.requestWindow({ width: 580, height: 680 });
  // css
  const allCSS = [...document.styleSheets]
    .map((styleSheet) => {
      try {
        return [...styleSheet.cssRules].map((r) => r.cssText).join('');
      } catch (e) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = styleSheet.type;
        // @ts-ignore
        link.media = styleSheet.media;
        // @ts-ignore
        link.href = styleSheet.href;
        pipWindow.document.head.appendChild(link);
      }
    })
    .filter(Boolean)
    .join('\n');
  const style = document.createElement('style');
  style.textContent = allCSS;
  pipWindow.document.head.appendChild(style);
  // js
  [...document.scripts].map((v) => {
    const script = document.createElement('script');
    script.src = v.src;
    script.type = v.type;
    pipWindow.document.head.appendChild(script);
  });
  pipWindow.document.body.append(popupContent);

  pipWindow.addEventListener('pagehide', () => {
    const popupContentContainer = document.body;
    popupContentContainer?.append(popupContent);
  });

  return pipWindow;
};
