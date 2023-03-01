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
  request: string,
  requestDes: string,
  responseText: string,
  language: string, // json javascript
  headers: string,
  [key: string]: any;
}

export const defaultInterface: DefaultInterfaceObject = {
  key: '1',
  open: true,
  matchType: 'normal',
  matchMethod: '',
  request: '',
  requestDes: '',
  responseText: '',
  language: 'json',
  headers: ''
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
