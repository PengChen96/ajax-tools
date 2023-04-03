
export const exportJSON = (title: string, data: any) => {
  const reTitle = `${title}.json`;
  const dataStr = data ? JSON.stringify(data, null, 2) : '';
  return new Promise<void>(resolve => { // Chrome、Firefox
    const a = document.createElement('a');
    a.href = 'data:text/json;charset=utf-8,' + dataStr;
    a.download = reTitle;
    a.click();
    resolve();
  });
};
