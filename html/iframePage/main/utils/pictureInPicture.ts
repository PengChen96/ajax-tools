
export const popupWindow = async ({ url } : { url: string }) => {
  if (!('documentPictureInPicture' in window)) {
    alert('Your browser does not currently support documentPictureInPicture. You can go to chrome://flags/#document-picture-in-picture-api to enable it.');
    return;
  }
  const pipWindow = await documentPictureInPicture.requestWindow({ width: 580, height: 680 });
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.className = 'ajax-interceptor-iframe';
  iframe.style.setProperty('width', '100%');
  iframe.style.setProperty('height', '100%');
  iframe.style.setProperty('border', 'none');
  pipWindow.document.body.style.setProperty('margin', '0');
  pipWindow.document.body.append(iframe);
  return pipWindow;
};
