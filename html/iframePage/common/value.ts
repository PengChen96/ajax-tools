
export interface AjaxDataListObject {
  summaryText: string,
  collapseActiveKeys: string [],
  headerClass: string,
  interfaceList: DefaultInterfaceObject[]
}
export interface DefaultInterfaceObject {
  key: string,
  open: boolean,
  matchType: string, // normal regex
  matchMethod: string, // GET、POST、PUT、DELETE、HEAD、OPTIONS、CONNECT、TRACE、PATCH
  request: string, // matched url
  requestDes: string,
  // modify ⬇️
  replacementMethod: string,
  replacementUrl: string,
  headers: string,
  responseText: string,
  language: string, // json javascript
  [key: string]: any;
}

export const defaultInterface: DefaultInterfaceObject = {
  key: '1',
  open: true,
  matchType: 'normal',
  matchMethod: '',
  request: '',
  requestDes: '',
  // modify ⬇️
  replacementMethod: '',
  replacementUrl: '',
  headers: '',
  responseText: '',
  language: 'json',
};

export const defaultAjaxDataList: AjaxDataListObject[] = [
  {
    summaryText: 'Group Name (Editable)',
    collapseActiveKeys: ['1'],
    headerClass: 'ajax-tools-color-volcano',
    interfaceList: [
      { ...defaultInterface },
    ]
  },
];

export const HTTP_METHOD_MAP = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'CONNECT',
  'TRACE',
  'PATCH',
];
