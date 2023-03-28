
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

export const HEADERS_EXAMPLES = [{
  egText: `{
  "Content-Type": "application/json"
}
`
}];

export const RESPONSE_EXAMPLES = [
  {
    egTitle: 'e.g. json Basic',
    egText: `{
  "status": 200,
  "response": "OK"
}
`
  },
  {
    egTitle: 'e.g. javascript Basic',
    egText: `const data = [];
for (let i = 0; i < 10; i++) {
  data.push({ id: i });
}

return {
  "status": 200,
  "response": data
}
`
  },
  {
    egTitle: 'e.g. javascript Mock.js',
    egText: `const data = Mock.mock({
  'list|1-10': [{
    'id|+1': 1
  }]
});

return {
  "status": 200,
  "response": data
}

// Mock.js: https://github.com/nuysoft/Mock/wiki/Getting-Started
`
  },
  {
    egTitle: 'e.g. javascript Create Scene',
    egText: `const { method, payload, originalResponse } = arguments[0];
if (method === 'get') { // Method
  // do something 
}
if (payload) { // parameters { queryStringParameters，requestPayload }
  // do something
}

return {
  "status": 200,
  "response": originalResponse
}
`
  }
];
