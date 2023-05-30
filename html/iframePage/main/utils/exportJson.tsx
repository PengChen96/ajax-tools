
export const exportJSON = (title: string, data: any) => {
  const reTitle = `${title}.json`;
  const dataStr = data ? JSON.stringify(data, null, 2) : '';
  return new Promise<void>(resolve => { // Chrome、Firefox
    const a = document.createElement('a');
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = reTitle;
    a.click();
    resolve();
  });
};
